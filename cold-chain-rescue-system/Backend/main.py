from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import math
import numpy as np

# ==========================================
# 1. API SETUP & CORS
# ==========================================
app = FastAPI(title="Cold Chain Command API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 2. MACHINE LEARNING MODEL INTEGRATION
# ==========================================
try:
    with open("model.pkl", "rb") as f:
        ml_brain = pickle.load(f)
    print("AI Brain loaded successfully.")
except FileNotFoundError:
    print("WARNING: model.pkl not found. API will use hardcoded fallback logic.")
    ml_brain = None

# ==========================================
# 3. MOCK DATABASE (STATE MANAGEMENT)
# ==========================================
# Populated with San Francisco coordinates to match the React map
fleet_db = {
    "TRK-001": {"truck_id": "TRK-001", "lat": 37.7749, "lng": -122.4194, "voltage": 13.5, "vibration": 30, "fleet_status": "healthy", "risk_score": 5, "current_cargo_volume": 80, "max_capacity_volume": 100},
    "TRK-002": {"truck_id": "TRK-002", "lat": 37.8044, "lng": -122.2712, "voltage": 13.6, "vibration": 25, "fleet_status": "healthy", "risk_score": 2, "current_cargo_volume": 40, "max_capacity_volume": 100},
    "TRK-003": {"truck_id": "TRK-003", "lat": 37.6879, "lng": -122.4702, "voltage": 13.4, "vibration": 35, "fleet_status": "healthy", "risk_score": 8, "current_cargo_volume": 90, "max_capacity_volume": 100},
    "TRK-004": {"truck_id": "TRK-004", "lat": 37.5629, "lng": -122.3255, "voltage": 13.5, "vibration": 28, "fleet_status": "healthy", "risk_score": 4, "current_cargo_volume": 10, "max_capacity_volume": 100},
}

active_rescue_state = None

class TelemetryData(BaseModel):
    truck_id: str
    voltage: float
    vibration: int
    lat: float
    lng: float

# ==========================================
# 4. DISPATCH ALGORITHMS
# ==========================================
def calculate_haversine_distance(lat1, lon1, lat2, lon2):
    """Calculates geographical distance between two points."""
    R = 6371.0 # Earth radius in km
    rad_lat1, rad_lon1 = math.radians(lat1), math.radians(lon1)
    rad_lat2, rad_lon2 = math.radians(lat2), math.radians(lon2)
    
    d_lat = rad_lat2 - rad_lat1
    d_lon = rad_lon2 - rad_lon1
    
    a = math.sin(d_lat / 2)**2 + math.cos(rad_lat1) * math.cos(rad_lat2) * math.sin(d_lon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def dispatch_nearest_rescue(failed_truck, fleet_list):
    """Finds the closest available healthy truck."""
    closest_truck_id = None
    min_distance = float('inf')
    
    for truck in fleet_list:
        if truck["truck_id"] != failed_truck["truck_id"] and truck["fleet_status"] == "healthy":
            distance = calculate_haversine_distance(
                failed_truck["lat"], failed_truck["lng"], 
                truck["lat"], truck["lng"]
            )
            if distance < min_distance:
                min_distance = distance
                closest_truck_id = truck["truck_id"]
                
    return closest_truck_id

# ==========================================
# 5. CORE BUSINESS LOGIC (BACKGROUND TASK)
# ==========================================
def process_telemetry(data: TelemetryData):
    global active_rescue_state
    
    truck = fleet_db.get(data.truck_id)
    if not truck: return
    
    # Update live data
    truck["voltage"] = data.voltage
    truck["vibration"] = data.vibration
    
    # AI Prediction Phase
    risk_prob = 5 # Default safe
    if ml_brain:
        try:
            # Model expects a 2D array of features
            features = np.array([[data.voltage, data.vibration]])
            
            # Use predict_proba for a percentage, or fallback to predict
            if hasattr(ml_brain, "predict_proba"):
                risk_prob = int(ml_brain.predict_proba(features)[0][1] * 100)
            else:
                prediction = ml_brain.predict(features)[0]
                risk_prob = 95 if prediction == 1 else 5
        except Exception as e:
            print(f"Model Error: {e}")
            risk_prob = 95 if data.voltage < 10.5 or data.vibration > 75 else 5
    else:
        # Fallback if no model file exists
        risk_prob = 95 if data.voltage < 10.5 or data.vibration > 75 else 5
        
    truck["risk_score"] = risk_prob
    
    # Rescue Dispatch Phase
    if risk_prob > 80 and truck["fleet_status"] == "healthy":
        truck["fleet_status"] = "critical"
        
        fleet_list = list(fleet_db.values())
        rescue_truck_id = dispatch_nearest_rescue(truck, fleet_list)
        
        if rescue_truck_id:
            rescue_truck = fleet_db[rescue_truck_id]
            rescue_truck["fleet_status"] = "dispatched"
            
            # Format the rescue line data for React
            active_rescue_state = {
                "failed_truck_id": truck["truck_id"],
                "rescue_truck_id": rescue_truck["truck_id"],
                "failed_lat": truck["lat"],
                "failed_lng": truck["lng"],
                "intercept_lat": (truck["lat"] + rescue_truck["lat"]) / 2, # Midpoint visual
                "intercept_lng": (truck["lng"] + rescue_truck["lng"]) / 2,
                "rescue_lat": rescue_truck["lat"],
                "rescue_lng": rescue_truck["lng"]
            }

# ==========================================
# 6. API ENDPOINTS
# ==========================================
@app.get("/api/fleet-status/")
async def get_fleet_status():
    """Endpoint polled by React every 2 seconds."""
    return {
        "trucks": list(fleet_db.values()),
        "active_rescue": active_rescue_state
    }

@app.post("/api/telemetry/")
async def receive_telemetry(data: TelemetryData, background_tasks: BackgroundTasks):
    """Endpoint triggered by React 'God Mode' controls."""
    if data.truck_id not in fleet_db:
        raise HTTPException(status_code=404, detail="Truck not found")
        
    # Pass to background task so the API responds instantly
    background_tasks.add_task(process_telemetry, data)
    return {"status": "success", "message": "Telemetry received and processing."}