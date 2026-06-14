import React, { useState, useEffect } from 'react';
import DashboardMap from './components/DashboardMap';
import TelemetrySidebar from './components/TelemetrySidebar';
import SimulationControls from './components/SimulationControls';

export default function App() {
  const [fleet, setFleet] = useState([]);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [activeRescue, setActiveRescue] = useState(null);

  // Poll the FastAPI backend every 2 seconds for live coordinates and status updates
  useEffect(() => {
    const fetchFleetStatus = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/fleet-status/');
        const data = await response.json();
        setFleet(data.trucks);
        
        // Update active rescue tracking if applicable
        if (data.active_rescue) {
          setActiveRescue(data.active_rescue);
        } else {
          setActiveRescue(null);
        }

        // Keep the currently inspected truck data updated live
        if (selectedTruck) {
          const updated = data.trucks.find(t => t.truck_id === selectedTruck.truck_id);
          if (updated) setSelectedTruck(updated);
        }
      } catch (error) {
        console.error("Error fetching live fleet data:", error);
      }
    };

    fetchFleetStatus();
    const interval = setInterval(fetchFleetStatus, 2000);
    return () => clearInterval(interval);
  }, [selectedTruck]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Left Area: Controls and Map */}
      <div className="flex flex-col flex-1 relative h-full">
        {/* Top Floating Control Bar */}
        <div className="absolute top-4 left-4 z-10 w-80 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-4 shadow-2xl">
          <h1 className="text-lg font-bold tracking-wide text-indigo-400">COLD-CHAIN COMMAND</h1>
          <p className="text-xs text-slate-400 mt-1">Predictive IoT Spatial Dispatch Engine</p>
          <SimulationControls selectedTruck={selectedTruck} />
        </div>

        {/* The Live Mapping Engine */}
        <div className="w-full h-full">
          <DashboardMap 
            fleet={fleet} 
            selectedTruck={selectedTruck} 
            setSelectedTruck={setSelectedTruck}
            activeRescue={activeRescue}
          />
        </div>
      </div>

      {/* Right Area: Telemetry Status Deck */}
      <div className="w-96 border-l border-slate-800 bg-slate-900/50 backdrop-blur p-6 overflow-y-auto">
        <TelemetrySidebar selectedTruck={selectedTruck} activeRescue={activeRescue} />
      </div>
    </div>
  );
}