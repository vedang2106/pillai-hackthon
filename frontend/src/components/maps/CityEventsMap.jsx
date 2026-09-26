import React, { useEffect, useRef } from 'react';
import { loadLeaflet } from '../../utils/leafletLoader';
import { ShieldCheck, MapPin, Users, Calendar } from 'lucide-react';

export default function CityEventsMap({ events = [] }) {
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    let active = true;

    loadLeaflet().then((L) => {
      if (!active || !mapContainerRef.current) return;

      // Default center: Mumbai center (19.0760, 72.8777)
      const defaultLat = events[0]?.venue?.latitude || 19.0760;
      const defaultLng = events[0]?.venue?.longitude || 72.8777;

      if (!leafletMapRef.current) {
        const map = L.map(mapContainerRef.current).setView([defaultLat, defaultLng], 11);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        leafletMapRef.current = map;
      }

      const map = leafletMapRef.current;

      // Clear existing markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      const bounds = L.latLngBounds();
      let hasValidCoords = false;

      events.forEach((evt) => {
        const lat = evt.venue?.latitude;
        const lng = evt.venue?.longitude;
        if (lat == null || lng == null || isNaN(Number(lat)) || isNaN(Number(lng))) return;

        const isVerified = evt.governmentVerified || evt.verificationStatus === 'VERIFIED';
        const color = isVerified ? '#10B981' : '#F97316'; // Emerald green for verified, Orange for pending

        const pinIcon = L.divIcon({
          className: 'custom-city-event-marker',
          html: `<div style="background-color:${color}; width:32px; height:32px; border-radius:50%; border:3px solid white; box-shadow:0 3px 10px rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; color:white; font-weight:800; font-size:14px; cursor:pointer;" title="${evt.name}">📍</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const popupContent = `
          <div style="font-family: sans-serif; padding: 4px; min-width: 200px;">
            <div style="font-size: 11px; font-weight: 800; color: ${color}; text-transform: uppercase;">
              ${isVerified ? '✓ GOVERNMENT VERIFIED' : 'PENDING VERIFICATION'}
            </div>
            <h4 style="margin: 4px 0 2px; font-size: 15px; font-weight: 800; color: #0f172a;">${evt.name}</h4>
            <p style="margin: 0 0 6px; font-size: 12px; color: #64748b;">📍 ${evt.venue?.name || 'Venue'} (${lat.toFixed(4)}, ${lng.toFixed(4)})</p>
            <p style="margin: 0 0 8px; font-size: 12px; color: #475569;">👥 Expected: <strong>${(evt.expectedAttendance || 0).toLocaleString()}</strong></p>
            <a href="/events/${evt._id}" style="display: inline-block; background: #F97316; color: white; padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 800; text-decoration: none;">View Event Portal →</a>
          </div>
        `;

        const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(map).bindPopup(popupContent);

        markersRef.current.push(marker);
        bounds.extend([lat, lng]);
        hasValidCoords = true;
      });

      if (hasValidCoords && markersRef.current.length > 1) {
        map.fitBounds(bounds, { padding: [40, 40] });
      } else if (hasValidCoords && markersRef.current.length === 1) {
        map.setView([events[0].venue.latitude, events[0].venue.longitude], 13);
      }
    });

    return () => {
      active = false;
    };
  }, [events]);

  return (
    <div className="relative w-full h-[420px] rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />
      <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 shadow-md flex items-center gap-3">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Verified Events</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Pending Events</span>
      </div>
    </div>
  );
}
