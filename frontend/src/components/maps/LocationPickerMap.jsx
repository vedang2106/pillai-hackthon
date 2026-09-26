import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { loadLeaflet } from '../../utils/leafletLoader';

export default function LocationPickerMap({ latitude, longitude, onChangeLocation }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [useLeafletFallback, setUseLeafletFallback] = useState(false);

  const rawToken = import.meta.env.VITE_MAPBOX_TOKEN;
  const isMapboxValid = rawToken && rawToken.startsWith('pk.') && !rawToken.includes('your_mapbox');

  // Initial coordinates
  const initialLng = longitude != null && !isNaN(Number(longitude)) ? Number(longitude) : 72.8777;
  const initialLat = latitude != null && !isNaN(Number(latitude)) ? Number(latitude) : 19.076;

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    if (isMapboxValid) {
      try {
        mapboxgl.accessToken = rawToken;
        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [initialLng, initialLat],
          zoom: 13,
        });

        map.addControl(new mapboxgl.NavigationControl(), 'top-right');
        mapRef.current = map;

        const marker = new mapboxgl.Marker({ draggable: true, color: '#F97316' })
          .setLngLat([initialLng, initialLat])
          .addTo(map);

        markerRef.current = marker;

        marker.on('dragend', () => {
          const lngLat = marker.getLngLat();
          onChangeLocation?.({ latitude: lngLat.lat, longitude: lngLat.lng });
        });

        map.on('click', (e) => {
          marker.setLngLat(e.lngLat);
          onChangeLocation?.({ latitude: e.lngLat.lat, longitude: e.lngLat.lng });
        });

        return () => {
          marker.remove();
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

      const map = L.map(mapContainer.current).setView([initialLat, initialLng], 13);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abc',
        maxZoom: 19,
      }).addTo(map);

      const customIcon = L.divIcon({
        className: 'ef-leaflet-marker',
        html: `<div style="width:24px;height:24px;background:#F97316;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:pointer;"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([initialLat, initialLng], { draggable: true, icon: customIcon }).addTo(map);
      markerRef.current = marker;

      marker.on('dragend', () => {
        const latLng = marker.getLatLng();
        onChangeLocation?.({ latitude: latLng.lat, longitude: latLng.lng });
      });

      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        onChangeLocation?.({ latitude: e.latlng.lat, longitude: e.latlng.lng });
      });
    });

    return () => {
      if (mapRef.current && useLeafletFallback) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [useLeafletFallback]);

  // Handle prop updates
  useEffect(() => {
    if (!mapRef.current || latitude == null || longitude == null) return;
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (isNaN(lat) || isNaN(lng)) return;

    if (!useLeafletFallback && markerRef.current?.setLngLat) {
      markerRef.current.setLngLat([lng, lat]);
      mapRef.current.flyTo({ center: [lng, lat], zoom: 14, duration: 400 });
    } else if (useLeafletFallback && markerRef.current?.setLatLng) {
      markerRef.current.setLatLng([lat, lng]);
      mapRef.current.setView([lat, lng], 14);
    }
  }, [latitude, longitude, useLeafletFallback]);

  return (
    <div className="relative w-full h-72 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      <div ref={mapContainer} className="absolute inset-0 z-0 bg-slate-100" />
      <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-md flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        Click map or drag marker to set exact venue location
      </div>
    </div>
  );
}
