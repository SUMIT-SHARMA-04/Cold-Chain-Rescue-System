import React from 'react';

export default function TelemetrySidebar({ selectedTruck, activeRescue }) {
  if (!selectedTruck) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500">
        Select an asset to view telemetry matrix.
      </div>
    );
  }

  const isCritical = selectedTruck.fleet_status === 'critical' || selectedTruck.risk_score > 50;

  return (
    <div className="flex flex-col space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-bold tracking-wider">{selectedTruck.truck_id}</h2>
        <p className="text-slate-400 text-sm mt-1">{selectedTruck.carrier_id}</p>
        
        <div className={`mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider
          ${isCritical ? 'bg-red-900/50 text-red-400 border border-red-500/50' : 
            selectedTruck.fleet_status === 'dispatched' ? 'bg-blue-900/50 text-blue-400 border border-blue-500/50' : 
            'bg-emerald-900/50 text-emerald-400 border border-emerald-500/50'}`}
        >
          <span className={`w-2 h-2 rounded-full mr-2 ${isCritical ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
          {selectedTruck.fleet_status}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">AI Prediction Engine</h3>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="text-sm text-slate-400 mb-1">Probability of Failure</div>
          <div className={`text-4xl font-mono font-bold ${isCritical ? 'text-red-500' : 'text-emerald-400'}`}>
            {selectedTruck.risk_score}%
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Live Telemetry Streams</h3>
        <div className="grid grid-cols-2 gap-3">
          
          <MetricBox label="Internal Temp" value={`${selectedTruck.cargo_internal_temp_c}°C`} isDanger={selectedTruck.cargo_internal_temp_c > -15} />
          <MetricBox label="Ambient Temp" value={`${selectedTruck.ambient_external_temp_c}°C`} />
          <MetricBox label="Battery" value={`${selectedTruck.battery_voltage}V`} isDanger={selectedTruck.battery_voltage < 12} />
          <MetricBox label="Current Draw" value={`${selectedTruck.compressor_current_draw}A`} isDanger={selectedTruck.compressor_current_draw > 45} />
          <MetricBox label="Vibration" value={`${selectedTruck.engine_vibration_hz}Hz`} isDanger={selectedTruck.engine_vibration_hz > 75} />
          <MetricBox label="Pressure" value={`${selectedTruck.coolant_pressure_psi}PSI`} isDanger={selectedTruck.coolant_pressure_psi < 25} />
          
          <MetricBox label="Door Status" value={selectedTruck.door_status === 1 ? 'OPEN' : 'CLOSED'} isDanger={selectedTruck.door_status === 1} />
          <MetricBox label="Compressor" value={selectedTruck.compressor_status === 1 ? 'RUNNING' : 'IDLE'} />
          <MetricBox label="Age / Hours" value={`${selectedTruck.truck_age_years}y / ${selectedTruck.trip_duration_hours}h`} />
          <MetricBox label="Cargo Load" value={`${selectedTruck.current_cargo_volume}%`} />

        </div>
      </div>

      {activeRescue && activeRescue.failed_truck_id === selectedTruck.truck_id && (
        <div className="mt-6 bg-red-950/30 border border-red-900 p-4 rounded-xl">
          <h3 className="text-red-500 font-bold text-sm mb-2">RESCUE DISPATCHED</h3>
          <p className="text-xs text-red-200">
            Interceptor <span className="font-bold text-white">{activeRescue.rescue_truck_id}</span> is en route.
          </p>
        </div>
      )}
    </div>
  );
}

function MetricBox({ label, value, isDanger }) {
  return (
    <div className={`p-3 rounded-lg border ${isDanger ? 'bg-red-950/20 border-red-900/50' : 'bg-slate-800/30 border-slate-700/50'}`}>
      <div className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</div>
      <div className={`font-mono text-sm mt-1 ${isDanger ? 'text-red-400 font-bold' : 'text-slate-200'}`}>{value}</div>
    </div>
  );
}