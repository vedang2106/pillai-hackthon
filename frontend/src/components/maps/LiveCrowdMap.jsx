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

function crowdColor(level, utilPercent) {
  const util = Number(utilPercent);
  if (!isNaN(util)) {
    if (util > 85) return CROWD_COLORS.CRITICAL; // Red >85%
    if (util >= 70) return CROWD_COLORS.HIGH; // Orange 70-85%
    if (util >= 40) return CROWD_COLORS.MEDIUM; // Yellow 40-70%
    return CROWD_COLORS.LOW; // Green 0-40%
  }
  return CROWD_COLORS[level] || CROWD_COLORS.LOW;
}

const DEFAULT_DEMO_ZONES = [
  {
    _id: 'zone_demo_1',
    name: 'Gate A (Main Check-In)',
    latitude: 19.0760,
    longitude: 72.8777,
    capacity: 5000,
    currentOccupancy: 4200,
    utilizationPercent: 84,
    crowdLevel: 'HIGH',
    trafficLevel: 'HEAVY',
    riskLevel: 'HIGH',
    type: 'GATE',
    dataSource: 'LIVE_SENSOR',
  },
  {
    _id: 'zone_demo_2',
    name: 'Main Stage Arena',
    latitude: 19.0775,
    longitude: 72.8788,
    capacity: 15000,
    currentOccupancy: 13800,
    utilizationPercent: 92,
    crowdLevel: 'CRITICAL',
    trafficLevel: 'SLOW',
    riskLevel: 'CRITICAL',
    type: 'STAGE',
    dataSource: 'LIVE_CAMERA',
  },
  {
    _id: 'zone_demo_3',
    name: 'Food & Beverage Pavilion',
    latitude: 19.0748,
    longitude: 72.8762,
    capacity: 8000,
    currentOccupancy: 5200,
    utilizationPercent: 65,
    crowdLevel: 'MEDIUM',
    trafficLevel: 'NORMAL',
    riskLevel: 'LOW',
    type: 'FOOD',
    dataSource: 'SIMULATED',
  },
  {
    _id: 'zone_demo_4',
    name: 'South Parking Plaza',
    latitude: 19.0732,
    longitude: 72.8745,
    capacity: 6000,
    currentOccupancy: 2100,
    utilizationPercent: 35,
    crowdLevel: 'LOW',
    trafficLevel: 'NORMAL',
    riskLevel: 'LOW',
    type: 'PARKING',
    dataSource: 'SIMULATED',
  },
  {
    _id: 'zone_demo_5',
    name: 'Central Metro Transit Hub',
    latitude: 19.0788,
    longitude: 72.8805,
    capacity: 10000,
    currentOccupancy: 7800,
    utilizationPercent: 78,
    crowdLevel: 'HIGH',
    trafficLevel: 'HEAVY',
    riskLevel: 'MEDIUM',
    type: 'METRO',
    dataSource: 'PREDICTED',
  },
];

export default function LiveCrowdMap({ zones = [], venue, selectedZoneId, onSelectZone }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const circlesRef = useRef([]);
  const [useLeafletFallback, setUseLeafletFallback] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const rawToken = import.meta.env.VITE_MAPBOX_TOKEN;
  const isMapboxValid = rawToken && rawToken.startsWith('pk.') && !rawToken.includes('your_mapbox');

  // Input zones fallback
  const inputZones = Array.isArray(zones) && zones.length > 0 ? zones : DEFAULT_DEMO_ZONES;

  // Robustly filter & extract valid zones with numeric lat/lng
  const rawValidZones = inputZones
    .map((z) => {
      let lat = parseFloat(z.latitude ?? z.lat);
      let lng = parseFloat(z.longitude ?? z.lng);
      if ((isNaN(lat) || isNaN(lng)) && Array.isArray(z.coords)) {
        lat = parseFloat(z.coords[0]);
        lng = parseFloat(z.coords[1]);
      }
      if ((isNaN(lat) || isNaN(lng)) && z.location?.coordinates) {
        lng = parseFloat(z.location.coordinates[0]);
        lat = parseFloat(z.location.coordinates[1]);
      }
      const cap = Number(z.capacity) || 5000;
      const occ = Number(z.currentOccupancy ?? z.occupancy ?? Math.round(cap * 0.65));
      const util = z.utilizationPercent !== undefined ? Number(z.utilizationPercent) : Math.round((occ / cap) * 100);

      return {
        ...z,
        _id: String(z._id || z.id || z.name),
        name: z.name || 'Venue Zone',
        lat,
        lng,
        capacity: cap,
        currentOccupancy: occ,
        utilizationPercent: util,
        crowdLevel: z.crowdLevel || (util > 85 ? 'CRITICAL' : util >= 70 ? 'HIGH' : util >= 40 ? 'MEDIUM' : 'LOW'),
        trafficLevel: z.trafficLevel || (util > 80 ? 'HEAVY' : util > 50 ? 'SLOW' : 'NORMAL'),
        riskLevel: z.riskLevel || (util > 85 ? 'CRITICAL' : util >= 70 ? 'HIGH' : util >= 50 ? 'MEDIUM' : 'LOW'),
        dataSource: z.dataSource || 'SIMULATED',
      };
    })
    .filter((z) => !isNaN(z.lat) && !isNaN(z.lng) && z.lat !== 0 && z.lng !== 0);

  // Apply spatial spiderfy offset to overlapping coordinates so every zone marker is separately visible
  const coordCounts = {};
  const validZones = rawValidZones.map((z) => {
    const key = `${z.lat.toFixed(5)},${z.lng.toFixed(5)}`;
    const count = coordCounts[key] || 0;
    coordCounts[key] = count + 1;

    if (count > 0) {
      // Offset co-located zones radially (~50 meters apart)
      const angle = (count * (2 * Math.PI)) / 6;
      const radius = 0.0005; // ~50m latitude/longitude delta
      const offsetLat = z.lat + radius * Math.cos(angle);
      const offsetLng = z.lng + radius * Math.sin(angle);
      return { ...z, lat: offsetLat, lng: offsetLng };
    }
    return z;
  });

  const venueLat = parseFloat(venue?.latitude);
  const venueLng = parseFloat(venue?.longitude);
  const hasValidVenue = !isNaN(venueLat) && !isNaN(venueLng) && venueLat !== 0 && venueLng !== 0;

  const centerLat = validZones[0]?.lat ?? (hasValidVenue ? venueLat : 19.076);
  const centerLng = validZones[0]?.lng ?? (hasValidVenue ? venueLng : 72.8777);

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
          zoom: 14,
        });

        map.addControl(new mapboxgl.NavigationControl(), 'top-right');
        map.on('load', () => {
          mapRef.current = map;
          setMapReady(true);
        });

        return () => {
          markersRef.current.forEach((m) => m.remove());
          markersRef.current = [];
          map.remove();
          mapRef.current = null;
          setMapReady(false);
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
    let active = true;

    loadLeaflet().then((L) => {
      if (!active || !mapContainer.current || mapRef.current) return;

      const map = L.map(mapContainer.current).setView([centerLat, centerLng], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abc',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
      setMapReady(true);

      setTimeout(() => {
        if (mapRef.current && mapRef.current.invalidateSize) {
          mapRef.current.invalidateSize();
        }
      }, 150);
    });

    return () => {
      active = false;
      if (mapRef.current && useLeafletFallback) {
        mapRef.current.remove();
        mapRef.current = null;
        setMapReady(false);
      }
    };
  }, [useLeafletFallback]);

  // Update Markers & Bounds (Works for both Mapbox and Leaflet)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (useLeafletFallback && window.L) {
      const L = window.L;
      const bounds = L.latLngBounds();
      let hasBounds = false;

      validZones.forEach((zone) => {
        const bg = crowdColor(zone.crowdLevel, zone.utilizationPercent);
        const isSelected = selectedZoneId === zone._id;
        const util = zone.utilizationPercent ?? 0;

        const customIcon = L.divIcon({
          className: 'ef-leaflet-zone-marker',
          html: `
            <div style="display:inline-flex; align-items:center; gap:6px; background:#0F172A; padding:4px 10px 4px 5px; border-radius:20px; border:2px solid ${isSelected ? '#F97316' : '#FFFFFF'}; box-shadow:0 4px 12px rgba(0,0,0,0.4); cursor:pointer; white-space:nowrap; transform: ${isSelected ? 'scale(1.1)' : 'scale(1)'}; transition: transform 0.2s;">
              <div style="width:14px; height:14px; border-radius:50%; background:${bg}; border:2px solid #FFF; flex-shrink:0;"></div>
              <span style="color:#FFFFFF; font-size:11px; font-weight:800; font-family:system-ui;">${zone.name} (${util}%)</span>
            </div>
          `,
          iconSize: [120, 30],
          iconAnchor: [20, 15],
        });

        const popupContent = `
          <div style="font-family: system-ui, sans-serif; min-width: 190px; padding: 4px;">
            <strong style="font-size:14px; color:#171717;">${zone.name}</strong>
            <div style="font-size: 11px; color: #6B7280; margin-top: 2px;">Source: ${zone.dataSource || 'SIMULATED'}</div>
            <div style="margin-top: 8px; font-size: 12px; line-height: 1.6;">
              Crowd: <strong>${(zone.currentOccupancy ?? 0).toLocaleString()}</strong> / ${(zone.capacity ?? 1000).toLocaleString()}<br/>
              Utilization: <strong>${zone.utilizationPercent ?? 0}%</strong><br/>
              Status: <strong style="color:${bg}">${zone.crowdLevel || 'LOW'}</strong><br/>
              Risk Level: <strong>${zone.riskLevel || 'LOW'}</strong>
            </div>
          </div>
        `;

        const marker = L.marker([zone.lat, zone.lng], { icon: customIcon })
          .bindPopup(popupContent)
          .addTo(map);

        marker.on('click', () => onSelectZone?.(zone));
        markersRef.current.push(marker);
        bounds.extend([zone.lat, zone.lng]);
        hasBounds = true;
      });

      if (map.invalidateSize) {
        map.invalidateSize();
      }

      if (hasBounds && validZones.length > 1) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      } else if (hasBounds && validZones.length === 1) {
        map.setView([validZones[0].lat, validZones[0].lng], 15);
      } else if (hasValidVenue) {
        map.setView([venueLat, venueLng], 14);
      } else {
        map.setView([19.076, 72.8777], 13);
      }
    } else if (!useLeafletFallback) {
      // Mapbox GL
      const bounds = new mapboxgl.LngLatBounds();
      let hasBounds = false;

      validZones.forEach((zone) => {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'ef-zone-marker';
        const isSelected = selectedZoneId === zone._id;
        const bg = crowdColor(zone.crowdLevel, zone.utilizationPercent);
        const util = zone.utilizationPercent ?? 0;

        el.style.cssText = `
          display: inline-flex; align-items: center; gap: 6px; background: #0F172A;
          padding: 4px 10px 4px 5px; border-radius: 20px; border: 2px solid ${isSelected ? '#F97316' : '#FFFFFF'};
          box-shadow: 0 4px 12px rgba(0,0,0,0.4); cursor: pointer; white-space: nowrap;
          transform: ${isSelected ? 'scale(1.1)' : 'scale(1)'}; transition: transform 0.2s;
        `;
        el.innerHTML = `
          <div style="width:14px; height:14px; border-radius:50%; background:${bg}; border:2px solid #FFF; flex-shrink:0;"></div>
          <span style="color:#FFFFFF; font-size:11px; font-weight:800; font-family:system-ui;">${zone.name} (${util}%)</span>
        `;
        el.title = zone.name;

        el.addEventListener('click', () => onSelectZone?.(zone));

        const popupHTML = `
          <div style="font-family: system-ui, sans-serif; min-width: 190px;">
            <strong style="font-size:14px; color:#171717;">${zone.name}</strong>
            <div style="font-size: 11px; color: #6B7280; margin-top: 2px;">Source: ${zone.dataSource || 'SIMULATED'}</div>
            <div style="margin-top: 8px; font-size: 12px; line-height: 1.6;">
              Crowd: <strong>${(zone.currentOccupancy ?? 0).toLocaleString()}</strong> / ${(zone.capacity ?? 1000).toLocaleString()}<br/>
              Utilization: <strong>${zone.utilizationPercent ?? 0}%</strong><br/>
              Status: <strong style="color:${bg}">${zone.crowdLevel || 'LOW'}</strong><br/>
              Risk Level: <strong>${zone.riskLevel || 'LOW'}</strong>
            </div>
          </div>
        `;

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([zone.lng, zone.lat])
          .setPopup(new mapboxgl.Popup({ offset: 20 }).setHTML(popupHTML))
          .addTo(map);

        markersRef.current.push(marker);
        bounds.extend([zone.lng, zone.lat]);
        hasBounds = true;
      });

      if (hasBounds && validZones.length > 1) {
        map.fitBounds(bounds, { padding: 60, maxZoom: 16, duration: 800 });
      } else if (hasBounds && validZones.length === 1) {
        map.flyTo({ center: [validZones[0].lng, validZones[0].lat], zoom: 15, duration: 600 });
      } else if (hasValidVenue) {
        map.flyTo({ center: [venueLng, venueLat], zoom: 14, duration: 600 });
      }
    }
  }, [mapReady, zones, selectedZoneId, onSelectZone, venue, useLeafletFallback]);

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
