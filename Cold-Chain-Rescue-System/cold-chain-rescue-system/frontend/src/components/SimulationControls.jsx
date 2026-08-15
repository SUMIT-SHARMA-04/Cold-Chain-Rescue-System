import React, { useState, useEffect } from 'react';

export default function SimulationControls({ selectedTruck }) {
  // Local state to hold slider values without jumping when the API polls
  const [controls, setControls] = useState({});

  useEffect(() => {
    if (selectedTruck) {
      setControls(selectedTruck);
    }
  }, [selectedTruck?.truck_id]); // Only reset when changing trucks

  if (!selectedTruck) {
    return <div className="mt-4 text-sm text-slate-500">Select a truck on the map to open God Mode.</div>;
  }

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setControls(prev => ({
      ...prev,
      [name]: type === 'number' || type === 'range' ? parseFloat(value) : value
    }));
  };

  const handleFireFault = async () => {
    const payload = {
        truck_id: selectedTruck.truck_id,
        carrier_id: controls.carrier_id,
        truck_age_years: controls.truck_age_years,
        trip_duration_hours: controls.trip_duration_hours,
        current_cargo_volume: controls.current_cargo_volume,
        door_status: parseInt(controls.door_status),
        compressor_status: parseInt(controls.compressor_status),
        ambient_external_temp_c: controls.ambient_external_temp_c,
        battery_voltage: controls.battery_voltage,
        compressor_current_draw: controls.compressor_current_draw,
        engine_vibration_hz: controls.engine_vibration_hz,
        coolant_pressure_psi: controls.coolant_pressure_psi,
        cargo_internal_temp_c: controls.cargo_internal_temp_c
    };

    try {
      await fetch('http://127.0.0.1:8000/api/telemetry/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("Failed to send payload:", err);
    }
  };

  return (
    <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
      <div className="text-sm text-indigo-300 font-bold mb-2">TARGET: {selectedTruck.truck_id}</div>
      
      {/* Toggles & Selects */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
        <div className="col-span-2">
            <label className="block text-slate-400">Carrier</label>
            <select name="carrier_id" value={controls.carrier_id || 'FROST_LOGISTICS'} onChange={handleChange} className="w-full bg-slate-800 text-white p-1 rounded">
                <option value="FROST_LOGISTICS">Frost Logistics</option>
                <option value="ARCTIC_TRANSIT">Arctic Transit</option>
                <option value="POLAR_FREIGHT">Polar Freight</option>
            </select>
        </div>
        <div>
            <label className="block text-slate-400">Door Status</label>
            <select name="door_status" value={controls.door_status || 0} onChange={handleChange} className="w-full bg-slate-800 text-white p-1 rounded">
                <option value={0}>Closed</option>
                <option value={1}>OPEN</option>
            </select>
        </div>
        <div>
            <label className="block text-slate-400">Compressor</label>
            <select name="compressor_status" value={controls.compressor_status || 0} onChange={handleChange} className="w-full bg-slate-800 text-white p-1 rounded">
                <option value={0}>Idle</option>
                <option value={1}>Running</option>
            </select>
        </div>
      </div>

      {/* Sliders */}
      {[
        { name: 'truck_age_years', label: 'Truck Age (Years)', min: 0, max: 20, step: 1 },
        { name: 'trip_duration_hours', label: 'Trip Duration (Hours)', min: 0, max: 200, step: 1 },
        { name: 'current_cargo_volume', label: 'Cargo Volume (%)', min: 0, max: 100, step: 1 },
        { name: 'cargo_internal_temp_c', label: 'Internal Temp (°C)', min: -25, max: 10, step: 0.1 },
        { name: 'ambient_external_temp_c', label: 'Ambient Temp (°C)', min: -10, max: 45, step: 0.1 },
        { name: 'battery_voltage', label: 'Battery (V)', min: 9, max: 15, step: 0.1 },
        { name: 'compressor_current_draw', label: 'Current Draw (Amps)', min: 0, max: 70, step: 0.5 },
        { name: 'engine_vibration_hz', label: 'Vibration (Hz)', min: 10, max: 130, step: 1 },
        { name: 'coolant_pressure_psi', label: 'Pressure (PSI)', min: 0, max: 80, step: 1 },
      ].map(metric => (
        <div key={metric.name}>
            <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{metric.label}</span>
                <span className="font-mono text-indigo-400">{controls[metric.name]}</span>
            </div>
            <input 
                type="range" name={metric.name}
                min={metric.min} max={metric.max} step={metric.step}
                value={controls[metric.name] || 0} onChange={handleChange}
                className="w-full accent-indigo-500"
            />
        </div>
      ))}

      <button 
        onClick={handleFireFault}
        className="w-full mt-4 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded transition-colors"
      >
        Transmit Custom Payload
      </button>
    </div>
  );
}