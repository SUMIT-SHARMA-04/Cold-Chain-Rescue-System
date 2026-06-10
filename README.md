# Cold-Chain-Rescue-System
[ React.js Control Panel Frontend ]
                           │
        ✨ Live Status     │ 🎛️ Inject Anomaly
         & Map Polling     │    (Demo Mode)
                           ▼
               [ FastAPI Backend Server ]
                 │                   │
  💾 Read/Write  │                   │ 🧠 Asynchronous
   Fleet Data    ▼                   ▼    ML Evaluation
          [ SQLite DB ]      [ scikit-learn Engine ]
          (SQLAlchemy)       (cold_chain_model.pkl)
                                     │
                                     ▼
                         [ Decision Logic ]
                 Risk > 85%? ➔ Triggers Spatial Filter
                 (Haversine Distance + Space Verification)

1. **Ingestion Loop:** Simulated IoT sensors on fleet vehicles send real-time coordinates and performance metrics via HTTP POST to the FastAPI backend.
2. **Predictive Analytics:** FastAPI offloads the telemetry metrics to a background execution thread where the pre-trained Scikit-learn model calculates the probability of mechanical failure.
3. **Automated Dispatch:** If the risk score breaches 85%, the backend triggers our spatial search algorithm to locate, filter, and assign the optimal rescue vehicle.
4. **Real-time Operations:** The React.js frontend consumes live fleet state updates, dynamically visualizing the calculated rescue intercept coordinate maps.

---

## 🛠️ Technology Stack

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React.js (Vite), JavaScript | Operations Control Panel Dashboard |
| **Styling** | Tailwind CSS | Clean, high-contrast Dark Mode UI |
| **Mapping Engine**| React-Leaflet / Leaflet.js | Interactive Geospatial Fleet Plotting |
| **Backend API** | FastAPI (Python) | High-performance Asynchronous API Gateway |
| **Data Models** | Pydantic | Strict Telemetry Verification & Type Validation |
| **Database ORM** | SQLAlchemy | Relational Fleet Database Management |
| **Database Engine**| SQLite | Lightweight, Zero-Config Embedded Data Store |
| **Machine Learning**| Scikit-learn, Pandas, Joblib | Time-Series Classification & Feature Processing |

---

## 📊 Core Data Schemas

### 1. ML Telemetry Model (Feature Vector)
The Machine Learning classifier processes the following continuous time-series variables to predict impending breakdown states:
* `compressor_voltage` (Float): Operational electrical current (Normal: `~13.5V`, Failure State: `< 12.0V`).
* `vibration_hz` (Float): Structural engine oscillation frequency (Normal: `20-40Hz`, Friction State: `> 70Hz`).
* `internal_temp` (Float): Internal climate state of the container (Target: `4.0°C` or `-18.0°C`).
* `external_temp` (Float): Outside weather profile acting as an operational thermal stress multiplier.

### 2. Live Relational Fleet Model (Database Schema)
* `truck_id` (String): Unique identifiers for inventory tracking (e.g., `TRUCK-ALPHA`).
* `current_latitude` / `current_longitude` (Float): Live spatial coordinates.
* `fleet_status` (String): Active operating conditions (`AVAILABLE`, `DELIVERING`, `RESCUE_MODE`, `IMPENDING_FAILURE`).
* `max_capacity_volume` (Integer): Total physical transport threshold.
* `current_cargo_volume` (Integer): Current inventory volume loaded in transport.

---

## 🚀 Getting Started: Local Setup

### Prerequisites
Ensure you have the following installed locally on your system:
* **Python 3.9+**
* **Node.js (v16+) & npm**
* **Git**

### Step 1: Clone the Repository
```bash
git clone [https://github.com/YourUsername/Cold-Chain-Rescue-System.git](https://github.com/YourUsername/Cold-Chain-Rescue-System.git)
cd Cold-Chain-Rescue-System
Step 2: Backend Setup & Server Execution
Navigate into the backend directory and spin up an isolated virtual environment:

Bash
cd backend
python -bin/python -m venv venv
# On Windows: python -m venv venv
Activate the virtual environment:

Bash
source venv/bin/activate
# On Windows: venv\\Scripts\\activate
Install the required Python libraries:

Bash
pip install -r requirements.txt
Populate your local SQLite database with default mock fleet data:

Bash
python seed_database.py
Launch the FastAPI application using Uvicorn:

Bash
uvicorn main:app --reload
The backend documentation will now be interactively available at: http://127.0.0.1:8000/docs

Step 3: Frontend Setup & Dev Server Execution
Open a new terminal window and navigate into the frontend workspace:

Bash
cd frontend
Install the necessary project dependencies:

Bash
npm install
Launch the local development build server:

Bash
npm run dev
The interactive dispatch panel will open locally at: http://localhost:5173