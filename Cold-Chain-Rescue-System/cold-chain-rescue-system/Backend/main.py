from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import math

# ==========================================
# 1. API SETUP & CORS
# ==========================================
app = FastAPI(title="Cold Chain Command API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 2. MACHINE LEARNING MODEL INTEGRATION
# ==========================================
try:
    # Load the Scikit-Learn Pipeline
    ml_brain = joblib.load("pipe.pkl")
    print("Logistic Regression Pipeline loaded successfully.")
except FileNotFoundError:
    print("WARNING: pipe.pkl not found. API will use fallback logic.")
    ml_brain = None

# ==========================================
# 3. MOCK DATABASE (STATE MANAGEMENT)
# ==========================================
# Updated to include all 12 required features
fleet_db = {
    "TRK-001": {"truck_id": "TRK-001", "lat": 37.7749, "lng": -122.4194, "fleet_status": "healthy", "risk_score": 5, "carrier_id": "FROST_LOGISTICS", "truck_age_years": 5, "trip_duration_hours": 48, "current_cargo_volume": 20, "door_status": 0, "compressor_status": 1, "ambient_external_temp_c": 22.5, "battery_voltage": 13.5, "compressor_current_draw": 25.0, "engine_vibration_hz": 30.0, "coolant_pressure_psi": 45.0, "cargo_internal_temp_c": -18.5},
    "TRK-002": {"truck_id": "TRK-002", "lat": 37.8044, "lng": -122.2712, "fleet_status": "healthy", "risk_score": 2, "carrier_id": "ARCTIC_TRANSIT", "truck_age_years": 2, "trip_duration_hours": 12, "current_cargo_volume": 40, "door_status": 0, "compressor_status": 0, "ambient_external_temp_c": 15.0, "battery_voltage": 13.8, "compressor_current_draw": 1.5, "engine_vibration_hz": 22.0, "coolant_pressure_psi": 50.0, "cargo_internal_temp_c": -20.0},
    "TRK-003": {"truck_id": "TRK-003", "lat": 37.6879, "lng": -122.4702, "fleet_status": "healthy", "risk_score": 8, "carrier_id": "POLAR_FREIGHT", "truck_age_years": 11, "trip_duration_hours": 110, "current_cargo_volume": 40, "door_status": 0, "compressor_status": 1, "ambient_external_temp_c": 35.0, "battery_voltage": 13.2, "compressor_current_draw": 32.0, "engine_vibration_hz": 42.0, "coolant_pressure_psi": 35.0, "cargo_internal_temp_c": -16.5},
}

active_rescue_state = None

class TelemetryData(BaseModel):
    truck_id: str
    carrier_id: str
    truck_age_years: int
    trip_duration_hours: int
    current_cargo_volume: int
    door_status: int
    compressor_status: int
    ambient_external_temp_c: float
    battery_voltage: float
    compressor_current_draw: float
    engine_vibration_hz: float
    coolant_pressure_psi: float
    cargo_internal_temp_c: float

# ==========================================
# 4. DISPATCH ALGORITHMS
# ==========================================
def calculate_haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371.0 
    rad_lat1, rad_lon1 = math.radians(lat1), math.radians(lon1)
    rad_lat2, rad_lon2 = math.radians(lat2), math.radians(lon2)
    d_lat = rad_lat2 - rad_lat1
    d_lon = rad_lon2 - rad_lon1
    a = math.sin(d_lat / 2)**2 + math.cos(rad_lat1) * math.cos(rad_lat2) * math.sin(d_lon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def dispatch_nearest_rescue(failed_truck, fleet_list):
    closest_truck_id = None
    min_distance = float('inf')
    failed_payload_volume = failed_truck.get("current_cargo_volume", 0)
    
    for truck in fleet_list:
        if truck["truck_id"] == failed_truck["truck_id"]:
            continue
        available_capacity = 100 - truck.get("current_cargo_volume", 0)
        
        if truck["fleet_status"] == "healthy" and available_capacity >= failed_payload_volume:
            distance = calculate_haversine_distance(
                failed_truck["lat"], failed_truck["lng"], truck["lat"], truck["lng"]
            )
            if distance < min_distance:
                min_distance = distance
                closest_truck_id = truck["truck_id"]
                
    return closest_truck_id

# ==========================================
# 5. CORE BUSINESS LOGIC
# ==========================================
def process_telemetry(data: TelemetryData):
    global active_rescue_state
    truck = fleet_db.get(data.truck_id)
    if not truck: return
    
    # Update DB with all 12 new parameters
    truck.update(data.dict())
    
    risk_prob = 5 
    if ml_brain:
        try:
            # Create a DataFrame so the Pipeline's ColumnTransformer can map column names
            df_input = pd.DataFrame([data.dict()]).drop(columns=['truck_id'])
            
            # Predict Probability using the Logistic Regression Pipeline
            risk_prob = int(ml_brain.predict_proba(df_input)[0][1] * 100)
        except Exception as e:
            print(f"Prediction Error: {e}")
            risk_prob = 95 if data.battery_voltage < 10.5 else 5
        
    truck["risk_score"] = risk_prob
    
    if risk_prob > 50 and truck["fleet_status"] == "healthy": # Adjusted to > 50 based on Logistic Regression standard threshold
        truck["fleet_status"] = "critical"
        fleet_list = list(fleet_db.values())
        rescue_truck_id = dispatch_nearest_rescue(truck, fleet_list)
        
        if rescue_truck_id:
            rescue_truck = fleet_db[rescue_truck_id]
            rescue_truck["fleet_status"] = "dispatched"
            active_rescue_state = {
                "failed_truck_id": truck["truck_id"],
                "rescue_truck_id": rescue_truck["truck_id"],
                "failed_lat": truck["lat"],
                "failed_lng": truck["lng"],
                "intercept_lat": (truck["lat"] + rescue_truck["lat"]) / 2, 
                "intercept_lng": (truck["lng"] + rescue_truck["lng"]) / 2,
                "rescue_lat": rescue_truck["lat"],
                "rescue_lng": rescue_truck["lng"],
            }

# ==========================================
# 6. API ENDPOINTS
# ==========================================
@app.get("/api/fleet-status/")
async def get_fleet_status():
    return {
        "trucks": list(fleet_db.values()),
        "active_rescue": active_rescue_state
    }

@app.post("/api/telemetry/")
async def receive_telemetry(data: TelemetryData, background_tasks: BackgroundTasks):
    if data.truck_id not in fleet_db:
        raise HTTPException(status_code=404, detail="Truck not found")
    background_tasks.add_task(process_telemetry, data)
    return {"status": "success"}