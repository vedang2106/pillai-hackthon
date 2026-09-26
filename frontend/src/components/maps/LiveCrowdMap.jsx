import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { loadLeaflet } from '../../utils/leafletLoader';

const CROWD_COLORS = {
  LOW: '#22C55E',
  MEDIUM: '#EAB308',
  HIGH: '#F97316',
  CRITICAL: '#EF4444',
};

function crowdColor(level) {
  return CROWD_COLORS[level] || CROWD_COLORS.LOW;
}

export default function LiveCrowdMap({ zones = [], venue, selectedZoneId, onSelectZone }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [useLeafletFallback, setUseLeafletFallback] = useState(false);

  const rawToken = import.meta.env.VITE_MAPBOX_TOKEN;
  const isMapboxValid = rawToken && rawToken.startsWith('pk.') && !rawToken.includes('your_mapbox');

  const centerLng = venue?.longitude ?? zones[0]?.longitude ?? 72.8777;
  const centerLat = venue?.latitude ?? zones[0]?.latitude ?? 19.076;

  // Initialize Mapbox if valid token
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    if (isMapboxValid) {
      try {
        mapboxgl.accessToken = rawToken;
        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [centerLng, centerLat],
          zoom: 13.5,
        });

        map.addControl(new mapboxgl.NavigationControl(), 'top-right');
        mapRef.current = map;

        return () => {
          markersRef.current.forEach((m) => m.remove());
          markersRef.current = [];
          map.remove();
          mapRef.current = null;
        };
      } catch (e) {
        setUseLeafletFallback(true);
      }
    } else {
      setUseLeafletFallback(true);
    }
  }, [isMapboxValid, rawToken]);

  // Leaflet Fallback Loader
  useEffect(() => {
    if (!useLeafletFallback || !mapContainer.current || mapRef.current) return;

    loadLeaflet().then((L) => {
      if (!mapContainer.current || mapRef.current) return;

      const map = L.map(mapContainer.current).setView([centerLat, centerLng], 13.5);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abc',
        maxZoom: 19,
      }).addTo(map);
    });

    return () => {
      if (mapRef.current && useLeafletFallback) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [useLeafletFallback]);

  // Update Markers (Works for both Mapbox and Leaflet)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (useLeafletFallback && window.L) {
      const L = window.L;
      zones.forEach((zone) => {
        const bg = crowdColor(zone.crowdLevel);
        const customIcon = L.divIcon({
          className: 'ef-leaflet-zone-marker',
          html: `<div style="width:28px;height:28px;border-radius:50%;border:3px solid #fff;background:${bg};box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:pointer;${selectedZoneId === zone._id ? 'outline:3px solid #F97316;' : ''}"></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const popupContent = `
          <div style="font-family: system-ui; min-width: 180px; padding: 4px;">
            <strong style="font-size:14px; color:#171717;">${zone.name}</strong>
            <div style="font-size: 11px; color: #6B7280; margin-top: 2px;">Source: ${zone.dataSource || 'SIMULATED'}</div>
            <div style="margin-top: 8px; font-size: 12px; line-height: 1.5;">
              Crowd: <strong>${zone.currentOccupancy?.toLocaleString() ?? 0}</strong> / ${zone.capacity?.toLocaleString()}<br/>
              Utilization: <strong>${zone.utilizationPercent ?? 0}%</strong><br/>
              Level: <strong style="color:${bg}">${zone.crowdLevel}</strong><br/>
              Risk: <strong>${zone.riskLevel}</strong>
            </div>
          </div>
        `;

        const marker = L.marker([zone.latitude, zone.longitude], { icon: customIcon })
          .bindPopup(popupContent)
          .addTo(map);

        marker.on('click', () => onSelectZone?.(zone));
        markersRef.current.push(marker);
      });

      if (zones.length > 0) {
        const bounds = L.latLngBounds(zones.map((z) => [z.latitude, z.longitude]));
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      } else if (venue?.latitude != null && venue?.longitude != null) {
        map.setView([venue.latitude, venue.longitude], 13.5);
      }
    } else if (!useLeafletFallback) {
      zones.forEach((zone) => {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'ef-zone-marker';
        el.style.cssText = `
          width: 28px; height: 28px; border-radius: 50%; border: 3px solid #fff;
          background: ${crowdColor(zone.crowdLevel)};
          box-shadow: 0 2px 8px rgba(0,0,0,0.2); cursor: pointer;
          ${selectedZoneId === zone._id ? 'outline: 3px solid #F97316;' : ''}
        `;
        el.title = zone.name;

        el.addEventListener('click', () => onSelectZone?.(zone));

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([zone.longitude, zone.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 20 }).setHTML(`
              <div style="font-family: system-ui; min-width: 180px;">
                <strong>${zone.name}</strong>
                <div style="font-size: 12px; color: #6B7280; margin-top: 4px;">Source: ${zone.dataSource || 'SIMULATED'}</div>
                <div style="margin-top: 8px; font-size: 13px;">
                  Crowd: <strong>${zone.currentOccupancy?.toLocaleString() ?? 0}</strong> / ${zone.capacity?.toLocaleString()}<br/>
                  Utilization: <strong>${zone.utilizationPercent ?? 0}%</strong><br/>
                  Level: <strong>${zone.crowdLevel}</strong><br/>
                  Risk: <strong>${zone.riskLevel}</strong>
                </div>
              </div>
            `)
          )
          .addTo(map);

        markersRef.current.push(marker);
      });

      if (zones.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        zones.forEach((z) => bounds.extend([z.longitude, z.latitude]));
        map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 800 });
      } else if (venue?.latitude != null && venue?.longitude != null) {
        map.flyTo({ center: [venue.longitude, venue.latitude], zoom: 13.5, duration: 600 });
      }
    }
  }, [zones, selectedZoneId, onSelectZone, venue, useLeafletFallback]);

  return (
    <div className="relative w-full h-[420px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      <div ref={mapContainer} className="absolute inset-0 z-0 bg-slate-100" />
      <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 shadow-md">
        <span className="font-extrabold text-slate-900">Live Crowd Legend:</span>{' '}
        <span className="text-emerald-600 font-bold">LOW</span> · <span className="text-yellow-600 font-bold">MEDIUM</span> ·{' '}
        <span className="text-brand-orange font-bold">HIGH</span> · <span className="text-red-600 font-bold">CRITICAL</span>
      </div>
    </div>
  );
}
