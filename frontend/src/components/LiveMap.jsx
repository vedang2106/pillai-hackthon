import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';

export default function LiveMap({ zones }) {
  const defaultCenter = [19.076, 72.8777];

  const processedZones = (zones && zones.length > 0 ? zones : [
    { id: 1, name: 'Gate A Check-In', coords: [19.0760, 72.8777], occupancy: 84, status: 'Critical' },
    { id: 2, name: 'Main Stage Arena', coords: [19.0775, 72.8788], occupancy: 92, status: 'Critical' },
    { id: 3, name: 'Food & Beverage Pavilion', coords: [19.0748, 72.8762], occupancy: 65, status: 'Moderate' },
    { id: 4, name: 'South Parking Plaza', coords: [19.0732, 72.8745], occupancy: 35, status: 'Low' },
    { id: 5, name: 'Central Metro Station', coords: [19.0788, 72.8805], occupancy: 78, status: 'Moderate' },
  ]).map((z) => {
    let lat = parseFloat(z.latitude ?? z.lat);
    let lng = parseFloat(z.longitude ?? z.lng);
    if ((isNaN(lat) || isNaN(lng)) && Array.isArray(z.coords)) {
      lat = Number(z.coords[0]);
      lng = Number(z.coords[1]);
    }
    if ((isNaN(lat) || isNaN(lng)) && z.location?.coordinates) {
      lng = Number(z.location.coordinates[0]);
      lat = Number(z.location.coordinates[1]);
    }
    return {
      ...z,
      id: z.id || z._id || z.name,
      coords: [isNaN(lat) ? 19.076 : lat, isNaN(lng) ? 72.8777 : lng],
      occupancy: z.utilizationPercent ?? z.occupancy ?? 50,
      status: z.status || z.crowdLevel || 'Low',
    };
  });

  const center = processedZones[0]?.coords || defaultCenter;

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden shadow-glass border border-white">
      <MapContainer center={center} zoom={14} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {processedZones.map((zone) => (
          <CircleMarker
            key={zone.id}
            center={zone.coords}
            radius={25}
            pathOptions={{
              color: zone.occupancy > 85 || zone.status === 'Critical' ? '#EF4444' : zone.occupancy >= 70 || zone.status === 'Moderate' ? '#F59E0B' : '#10B981',
              fillColor: zone.occupancy > 85 || zone.status === 'Critical' ? '#EF4444' : zone.occupancy >= 70 || zone.status === 'Moderate' ? '#F59E0B' : '#10B981',
              fillOpacity: 0.45,
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