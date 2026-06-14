import React from 'react';

export default function TelemetrySidebar({ selectedTruck, activeRescue }) {
  if (!selectedTruck) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
        <div className="text-6xl mb-4 opacity-50">🚛</div>
        <p className="text-sm">Select a vehicle from the map to view telemetry.</p>
      </div>
    );
  }

  const getRiskColor = (score) => {
    if (score > 80) return 'text-rose-500 border-rose-500/30 bg-rose-500/10';
    if (score > 40) return 'text-amber-500 border-amber-500/30 bg-amber-500/10';
    return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">{selectedTruck.truck_id}</h2>
            <p className="text-xs text-slate-400 mt-1">Cargo: {selectedTruck.current_cargo_volume}/{selectedTruck.max_capacity_volume} Units</p>
          </div>
          <span className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border ${getRiskColor(selectedTruck.risk_score)}`}>
            {selectedTruck.fleet_status}
          </span>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 text-center shadow-inner">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Failure Probability</h3>
        <div className={`text-5xl font-extrabold tracking-tight ${selectedTruck.risk_score > 80 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>
          {selectedTruck.risk_score}%
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 flex justify-between items-center">
          <div>
            <div className="text-xs text-slate-400">Compressor Voltage</div>
            <div className="text-xl font-mono font-bold mt-1 text-white">{selectedTruck.voltage.toFixed(1)}V</div>
          </div>
          <div className={`w-3 h-3 rounded-full ${selectedTruck.voltage < 12 ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 flex justify-between items-center">
          <div>
            <div className="text-xs text-slate-400">Engine Vibration</div>
            <div className="text-xl font-mono font-bold mt-1 text-white">{selectedTruck.vibration} Hz</div>
          </div>
          <div className={`w-3 h-3 rounded-full ${selectedTruck.vibration > 70 ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
        </div>
      </div>

      {activeRescue && (activeRescue.failed_truck_id === selectedTruck.truck_id || activeRescue.rescue_truck_id === selectedTruck.truck_id) && (
        <div className="border border-indigo-500 bg-indigo-500/10 rounded-xl p-5 space-y-3 mt-8 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-400">Active Rescue Engaged</div>
          <div className="text-sm text-slate-200">
            <strong>{activeRescue.rescue_truck_id}</strong> routed to intercept <strong>{activeRescue.failed_truck_id}</strong>.
          </div>
        </div>
      )}
    </div>
  );
}