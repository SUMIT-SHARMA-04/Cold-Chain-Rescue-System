import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function DashboardMap({ fleet, selectedTruck, setSelectedTruck, activeRescue }) {
  // Center roughly on the San Francisco Bay Area (matching mock data)
  const mapCenter = [37.7549, -122.3194]; 

  return (
    <MapContainer center={mapCenter} zoom={11} className="w-full h-full">
      {/* Dark mode map tiles from Carto */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {fleet.map((truck) => (
        <Marker 
          key={truck.truck_id} 
          position={[truck.lat, truck.lng]}
          eventHandlers={{
            click: () => setSelectedTruck(truck),
          }}
        >
          <Popup>
            <div className="text-slate-900 font-sans p-1">
              <strong className="text-sm block text-indigo-600">{truck.truck_id}</strong>
              <span className="text-xs block mt-1 font-semibold">Status: {truck.fleet_status}</span>
              <span className="text-xs block text-rose-600">Risk Index: {truck.risk_score}%</span>
            </div>
          </Popup>
        </Marker>
      ))}

      {activeRescue && (
        <Polyline 
          positions={[
            [activeRescue.failed_lat, activeRescue.failed_lng],
            [activeRescue.intercept_lat, activeRescue.intercept_lng],
            [activeRescue.rescue_lat, activeRescue.rescue_lng]
          ]} 
          pathOptions={{ color: '#6366f1', weight: 4, dashArray: '10, 10' }} 
        />
      )}
    </MapContainer>
  );
}