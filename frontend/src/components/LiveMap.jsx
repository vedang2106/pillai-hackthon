import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';

export default function LiveMap({ zones }) {
  // Center coordinates (Pillai University area / Mumbai default)
  const center = [18.99, 73.12];

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden shadow-glass border border-white">
      <MapContainer center={center} zoom={14} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {zones.map((zone) => (
          <CircleMarker
            key={zone.id}
            center={zone.coords}
            radius={25}
            pathOptions={{
              color: zone.status === 'Critical' ? '#EF4444' : zone.status === 'Moderate' ? '#F59E0B' : '#10B981',
              fillColor: zone.status === 'Critical' ? '#EF4444' : zone.status === 'Moderate' ? '#F59E0B' : '#10B981',
              fillOpacity: 0.4,
            }}
          >
            <Popup>
              <div className="p-1 font-sans">
                <h4 className="font-bold text-slate-800">{zone.name}</h4>
                <p className="text-xs text-slate-600">Density: {zone.occupancy}%</p>
                <p className="text-xs font-semibold mt-1">Status: {zone.status}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}