import React, { useState } from 'react';

export default function SimulationControls({ selectedTruck }) {
  const [voltage, setVoltage] = useState(13.5);
  const [vibration, setVibration] = useState(30);

  const injectAnomaly = async () => {
    if (!selectedTruck) return;
    try {
      await fetch('http://127.0.0.1:8000/api/telemetry/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          truck_id: selectedTruck.truck_id,
          voltage: parseFloat(voltage),
          vibration: parseInt(vibration),
          lat: selectedTruck.lat,
          lng: selectedTruck.lng
        })
      });
      alert(`Anomaly injected for ${selectedTruck.truck_id}!`);
    } catch (error) {
      alert(`Simulation Warning: Backend offline. Cannot send data.`);
    }
  };

  return (
    <div className="pt-4 border-t border-slate-700/50 space-y-5">
      {!selectedTruck ? (
        <p className="text-xs text-slate-500 italic">Select a vehicle on the map to unlock controls.</p>
      ) : (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-[11px] font-bold uppercase text-slate-400 mb-2">
              <span>Voltage Overlay</span>
              <span className="font-mono text-indigo-400">{voltage}V</span>
            </div>
            <input 
              type="range" min="10.0" max="14.0" step="0.1" 
              value={voltage} onChange={(e) => setVoltage(e.target.value)}
              className="w-full accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer h-2 appearance-none"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-bold uppercase text-slate-400 mb-2">
              <span>Vibration Overlay</span>
              <span className="font-mono text-indigo-400">{vibration} Hz</span>
            </div>
            <input 
              type="range" min="20" max="100" step="1" 
              value={vibration} onChange={(e) => setVibration(e.target.value)}
              className="w-full accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer h-2 appearance-none"
            />
          </div>

          <button 
            onClick={injectAnomaly}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all duration-200 uppercase tracking-widest text-[10px]"
          >
            Transmit Fault Packet
          </button>
        </div>
      )}
    </div>
  );
}