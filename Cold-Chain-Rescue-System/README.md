# 🧊 Cold Chain Command
> **Predictive IoT Fleet Telemetry & Automated Spatial Rescue Dispatch Engine**  
> *Built for the Zuup Faraway Hackathon*

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Scikit-Learn](https://img.shields.io/badge/scikit_learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 🌟 Overview & Architecture

**Cold Chain Command** is a full-stack, real-time IoT logistics platform designed to prevent catastrophic cargo loss in cold supply chains. 

Instead of waiting for a reefer truck to break down on the highway, the system continuously ingests **12 multi-dimensional telemetry parameters**. It processes these streams through an embedded **Scikit-Learn Machine Learning Pipeline** to predict mechanical failures *before* they occur. 

When an asset's risk score crosses a critical threshold, a **Haversine-based Spatial Dispatch Algorithm** automatically identifies the nearest healthy truck with sufficient cargo capacity and deploys an intercept rescue route.

```text
 [ React.js Dashboard ] ◄────── 2s Polling Status ──────┐
          │                                              │
   🎛️ Inject Anomaly                                     │
   (God Mode Sliders)                                    │
          │                                              │
          ▼                                              │
 [ FastAPI Server Gateway ] ─────────────────────────────┘
          │
  ⚡ Background Task
          │
          ▼
 [ Scikit-Learn Pipeline (`pipe.pkl`) ]
  ├── OneHotEncoder (carrier_id)
  └── Logistic Regression Classifier
          │
          ▼
 [ Risk Score Probability Calculation ]
          │
    (If Risk > 50%)
          │
          ▼
 [ Spatial Haversine Dispatcher ] ──► Calculates Intercept Coordinates
```

---

## ✨ Key Features

- **Predictive ML Failure Engine:** Uses a trained Scikit-Learn Logistic Regression model (`pipe.pkl`) to evaluate incoming telemetry vectors and return a failure probability score in real-time.
- **Automated Rescue Dispatch:** Computes Haversine distances across active fleet assets, filtering for healthy status and remaining cargo payload capacity to assign the optimal intercept truck.
- **Real-Time Geospatial Mapping:** Integrated **React-Leaflet** interactive map rendering live truck coordinates, custom status pins, and animated intercept vectors.
- **Interactive "God Mode" Simulator:** Full control panel with custom sliders allowing judges and engineers to manipulate hardware telemetry parameters on the fly to simulate real-world failure scenarios.
- **Asynchronous Telemetry Ingestion:** Built on FastAPI using `BackgroundTasks` to ensure continuous telemetry processing without blocking API endpoints or UI updates.

---

## 🛠️ Technology Stack

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React.js, Tailwind CSS | High-contrast Dark Mode Operations Dashboard |
| **Mapping Engine** | React-Leaflet, CartoDB Dark Tiles | Real-time Geospatial Fleet & Intercept Path Visualizer |
| **Backend Framework** | FastAPI (Python 3.11+) | Asynchronous REST API Gateway |
| **Machine Learning** | Scikit-Learn, Joblib, Pandas | Trained Logistic Regression Pipeline & Feature Transformer |
| **Spatial Engine** | Python Math (Haversine Formula) | Geodetic Distance & Fleet Intercept Calculation |
| **Data Validation** | Pydantic | Strict Telemetry Ingestion Schema Enforcement |

---

## 📊 Telemetry Data Schema (12 Features)

The Machine Learning pipeline evaluates the following 12 input features to calculate the breakdown probability (`failure_imminent`):

| Feature Parameter | Type | Description |
| :--- | :--- | :--- |
| `carrier_id` | String | Fleet operator (`FROST_LOGISTICS`, `ARCTIC_TRANSIT`, `POLAR_FREIGHT`) |
| `truck_age_years` | Integer | Total vehicle service age |
| `trip_duration_hours` | Integer | Total active hours on current route |
| `current_cargo_volume` | Integer | Capacity utilization percentage (0 - 100%) |
| `door_status` | Integer | Binary sensor (`0 = Closed`, `1 = Open`) |
| `compressor_status` | Integer | Binary state (`0 = Idle`, `1 = Running`) |
| `ambient_external_temp_c` | Float | Outside weather profile thermal multiplier |
| `battery_voltage` | Float | Operational electrical voltage (Threshold: `< 10.5V`) |
| `compressor_current_draw` | Float | Amperage drawn by the cooling system (Amps) |
| `engine_vibration_hz` | Float | Engine/chassis vibration frequency (Hz) |
| `coolant_pressure_psi` | Float | Refrigerant line pressure (PSI) |
| `cargo_internal_temp_c` | Float | Internal cargo vault temperature (°C) |

---

## 🚀 Local Setup Instructions

### Prerequisites
- **Python 3.11+**
- **Node.js v18+** & `npm`

### 1. Backend Setup (FastAPI + ML Engine)

```bash
# Clone the repository
git clone [https://github.com/YourUsername/Cold-Chain-Command.git](https://github.com/YourUsername/Cold-Chain-Command.git)
cd Cold-Chain-Command/backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install fastapi uvicorn pydantic pandas joblib scikit-learn

# Ensure your trained ML model (`pipe.pkl`) is in the backend directory
# Start the FastAPI server
uvicorn main:app --reload
```
*The backend interactive docs will be available at `http://127.0.0.1:8000/docs`.*

### 2. Frontend Setup (React + Leaflet)

```bash
# Open a new terminal window and navigate to the frontend directory
cd Cold-Chain-Command/frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
*The operational control panel will open locally at `http://localhost:5173`.*

---

## 🎛️ Hackathon Demo Guide ("God Mode")

1. **Observe Baseline Fleet:** Open the React dashboard. You will see active trucks (`TRK-001`, `TRK-002`, `TRK-003`) plotted on the Leaflet dark map with green "Healthy" indicators.
2. **Select Target Truck:** Click on **`TRK-001`** on the map or in the sidebar. The "God Mode" Simulation Controls will load its current operational state.
3. **Simulate a Fault Event:**
   - Drop **Battery Voltage** to `9.5V`.
   - Spike **Compressor Current Draw** to `65A`.
   - Raise **Engine Vibration** to `90Hz`.
4. **Transmit Payload:** Click **Transmit Custom Payload**.
5. **Watch Automated Rescue In Real-Time:**
   - FastAPI catches the payload and runs non-blocking inference through `pipe.pkl`.
   - **`TRK-001`**'s risk score spikes to **> 50%**, instantly turning its status to **`CRITICAL`**.
   - The Haversine algorithm scans the fleet, identifies the nearest healthy truck with available capacity (`TRK-002`), changes its status to **`DISPATCHED`**, and dynamically plots a dashed intercept route on the map.

---

## 👥 Team & Acknowledgments

Built with passion for the **Zuup Faraway Hackathon**.

- **Team Lead & Full-Stack Architect** 

---
*MIT License — Feel free to fork and build upon this architecture!.*