import React, { useState, useEffect, useRef } from 'react';
import { loadLeaflet } from '../../utils/leafletLoader';
import { aiApi } from '../../services/api';
import SourceBadge from '../common/SourceBadge';
import {
  Navigation,
  Car,
  Bike,
  Bus,
  Train,
  Footprints,
  AlertTriangle,
  ShieldCheck,
  MapPin,
  Compass,
  CornerUpRight,
  CornerUpLeft,
  ArrowUp,
  Play,
  Square,
  LocateFixed,
  Search,
} from 'lucide-react';

import { geocodeAddress } from '../../utils/geocoder';

export default function VisitorSmartNavigator({ event, zones = [] }) {
  const activeRedirectGate = (zones || []).find(
    (z) => z.gateStatus === 'DANGER' || z.gateStatus === 'CLOSED' || z.gateStatus === 'REROUTED' || z.crowdLevel === 'CRITICAL' || !!z.redirectGateName
  );
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const polylineRef = useRef(null);
  const originMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const liveNavMarkerRef = useRef(null);
  const animationTimerRef = useRef(null);

  const [vehicleType, setVehicleType] = useState('FOUR_WHEELER');
  const [originName, setOriginName] = useState('Byculla Station');
  const [originLat, setOriginLat] = useState(18.9790);
  const [originLng, setOriginLng] = useState(72.8333);
  const [customSearchQuery, setCustomSearchQuery] = useState('');

  const destLat = event?.venue?.latitude || 19.076;
  const destLng = event?.venue?.longitude || 72.8777;
  const destName = event?.venue?.name || event?.name || 'Event Venue';

  const [loading, setLoading] = useState(false);
  const [routeResult, setRouteResult] = useState(null);

  // Live Navigation tracking mode states
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [simulatedWaypointIdx, setSimulatedWaypointIdx] = useState(0);

  const sampleOrigins = [
    { name: 'Byculla Station', lat: 18.9790, lng: 72.8333 },
    { name: 'Bandra West Station', lat: 19.0544, lng: 72.8402 },
    { name: 'Chhatrapati Shivaji Terminus (CST)', lat: 18.9401, lng: 72.835 },
    { name: 'Dadar Terminal', lat: 19.0178, lng: 72.8478 },
    { name: 'Andheri Metro Hub', lat: 19.1197, lng: 72.8464 },
  ];

  const fetchSmartPath = (
    vType = vehicleType,
    oLat = originLat,
    oLng = originLng,
    oName = originName
  ) => {
    setLoading(true);
    aiApi
      .calculateVisitorRoute({
        origin: { name: oName, latitude: oLat, longitude: oLng },
        destination: { name: destName, latitude: destLat, longitude: destLng },
        vehicleType: vType,
        eventId: event?._id,
      })
      .then(({ data }) => setRouteResult(data))
      .catch(() => setRouteResult(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSmartPath();
  }, [event?._id]);

  // Handle GPS Auto-detect
  const handleUseGPS = () => {
    if ('geolocation' in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setOriginLat(lat);
          setOriginLng(lng);
          setOriginName('Your Live GPS Location');
          fetchSmartPath(vehicleType, lat, lng, 'Your Live GPS Location');
        },
        () => {
          alert('Could not retrieve GPS location. Using default origin.');
          setLoading(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  // Handle Custom Location Search with Nominatim API
  const handleCustomSearchSubmit = async (e) => {
    e.preventDefault();
    if (!customSearchQuery.trim()) return;

    setLoading(true);
    try {
      const res = await geocodeAddress(customSearchQuery);
      if (res) {
        setOriginName(customSearchQuery);
        setOriginLat(res.latitude);
        setOriginLng(res.longitude);
        fetchSmartPath(vehicleType, res.latitude, res.longitude, customSearchQuery);
        if (leafletMapRef.current) {
          leafletMapRef.current.setView([res.latitude, res.longitude], 13);
        }
      } else {
        alert(`Location "${customSearchQuery}" not found. Please click pin directly on map or enter a nearby city landmark.`);
        setLoading(false);
      }
    } catch (err) {
      alert(`Geocoding search failed.`);
      setLoading(false);
    }
  };

  // Initialize & Update OpenStreetMap with Map Click Listener
  useEffect(() => {
    let active = true;

    loadLeaflet().then((L) => {
      if (!active || !mapContainerRef.current) return;

      if (!leafletMapRef.current) {
        const map = L.map(mapContainerRef.current).setView([originLat, originLng], 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        // Click anywhere on map to set custom origin
        map.on('click', (e) => {
          const clickedLat = roundCoord(e.latlng.lat);
          const clickedLng = roundCoord(e.latlng.lng);
          setOriginLat(clickedLat);
          setOriginLng(clickedLng);
          setOriginName(`Custom Map Point (${clickedLat}, ${clickedLng})`);
          fetchSmartPath(vehicleType, clickedLat, clickedLng, `Custom Map Point`);
        });

        leafletMapRef.current = map;
      }

      const map = leafletMapRef.current;

      // Clear previous elements
      if (originMarkerRef.current) originMarkerRef.current.remove();
      if (destMarkerRef.current) destMarkerRef.current.remove();
      if (polylineRef.current) polylineRef.current.remove();

      // Start Pin Icon
      const originIcon = L.divIcon({
        className: 'custom-leaflet-icon',
        html: `<div style="background-color:#F97316; width:28px; height:28px; border-radius:50%; border:3px solid white; box-shadow:0 3px 8px rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; color:white; font-weight:800; font-size:13px;">A</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      originMarkerRef.current = L.marker([originLat, originLng], { icon: originIcon })
        .addTo(map)
        .bindPopup(`<b>${originName}</b> (Click map to change starting pin)`);

      // Dest Pin Icon
      const destIcon = L.divIcon({
        className: 'custom-leaflet-icon',
        html: `<div style="background-color:#10B981; width:28px; height:28px; border-radius:50%; border:3px solid white; box-shadow:0 3px 8px rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; color:white; font-weight:800; font-size:13px;">B</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      destMarkerRef.current = L.marker([destLat, destLng], { icon: destIcon })
        .addTo(map)
        .bindPopup(`<b>${destName}</b> (Event Destination)`);

      // Polyline Path
      const waypoints = routeResult?.waypoints || [
        [originLat, originLng],
        [destLat, destLng],
      ];

      const lineColor = routeResult?.isVehicleRestricted ? '#F97316' : '#10B981';
      polylineRef.current = L.polyline(waypoints, {
        color: lineColor,
        weight: 6,
        opacity: 0.85,
        dashArray: routeResult?.isVehicleRestricted ? '10, 10' : null,
      }).addTo(map);

      // Fit bounds to show route
      const bounds = L.latLngBounds([[originLat, originLng], [destLat, destLng]]);
      map.fitBounds(bounds, { padding: [50, 50] });
    });

    return () => {
      active = false;
    };
  }, [originLat, originLng, destLat, destLng, routeResult]);

  // Live Navigation Movement Animation Timer
  useEffect(() => {
    if (!isNavigating) {
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
      if (liveNavMarkerRef.current) {
        liveNavMarkerRef.current.remove();
        liveNavMarkerRef.current = null;
      }
      return;
    }

    // Extract or interpolate 15 waypoints for smooth animation
    let waypoints = routeResult?.waypoints && routeResult.waypoints.length >= 8
      ? routeResult.waypoints
      : [];

    if (waypoints.length < 8) {
      waypoints = [];
      const numPts = 15;
      for (let i = 0; i <= numPts; i++) {
        const frac = i / numPts;
        const lat = originLat + (destLat - originLat) * frac + Math.sin(frac * Math.PI) * 0.012;
        const lng = originLng + (destLng - originLng) * frac + Math.sin(frac * Math.PI) * 0.006;
        waypoints.push([roundCoord(lat), roundCoord(lng)]);
      }
    }

    const steps = routeResult?.navigationSteps || [];

    loadLeaflet().then((L) => {
      const map = leafletMapRef.current;
      if (!map) return;

      const navIcon = L.divIcon({
        className: 'custom-leaflet-icon',
        html: `
          <div style="position:relative; width:32px; height:32px; display:flex; align-items:center; justify-content:center;">
            <div style="position:absolute; width:32px; height:32px; border-radius:50%; background:#3B82F6; opacity:0.6; transform: scale(1.3);"></div>
            <div style="background-color:#1D4ED8; width:26px; height:26px; border-radius:50%; border:3px solid white; box-shadow:0 0 14px #2563EB; display:flex; align-items:center; justify-content:center; color:white; z-index:10;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      if (!liveNavMarkerRef.current) {
        liveNavMarkerRef.current = L.marker(waypoints[0], { icon: navIcon }).addTo(map);
      } else {
        liveNavMarkerRef.current.setIcon(navIcon);
        liveNavMarkerRef.current.setLatLng(waypoints[0]);
      }

      map.setView(waypoints[0], 14);

      if (animationTimerRef.current) clearInterval(animationTimerRef.current);

      animationTimerRef.current = setInterval(() => {
        setSimulatedWaypointIdx((prevIdx) => {
          const nextIdx = prevIdx + 1;
          if (nextIdx >= waypoints.length) {
            setIsNavigating(false);
            clearInterval(animationTimerRef.current);
            return 0;
          }

          const currentCoord = waypoints[nextIdx];
          if (liveNavMarkerRef.current) {
            liveNavMarkerRef.current.setLatLng(currentCoord);
          }
          map.panTo(currentCoord, { animate: true });

          // Update active turn maneuver step based on progress
          const stepFrac = nextIdx / waypoints.length;
          const targetStep = Math.min(
            Math.floor(stepFrac * (steps.length || 1)),
            Math.max(0, steps.length - 1)
          );
          setCurrentStepIndex(targetStep);

          return nextIdx;
        });
      }, 850);
    });

    return () => {
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
    };
  }, [isNavigating, routeResult, originLat, originLng, destLat, destLng]);

  const handleToggleNavigation = () => {
    if (isNavigating) {
      setIsNavigating(false);
      setSimulatedWaypointIdx(0);
      setCurrentStepIndex(0);
    } else {
      setSimulatedWaypointIdx(0);
      setCurrentStepIndex(0);
      setIsNavigating(true);
    }
  };

  const handleModeChange = (type) => {
    setVehicleType(type);
    setIsNavigating(false);
    fetchSmartPath(type);
  };

  const handleOriginPresetSelect = (preset) => {
    setOriginName(preset.name);
    setOriginLat(preset.lat);
    setOriginLng(preset.lng);
    setIsNavigating(false);
    fetchSmartPath(vehicleType, preset.lat, preset.lng, preset.name);
  };

  const roundCoord = (val) => Math.round(val * 10000) / 10000;
  const currentStep = routeResult?.navigationSteps?.[currentStepIndex] || routeResult?.navigationSteps?.[0];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Compass className="w-6 h-6 text-brand-orange" />
            AI Visitor Smart Navigator & Turn-by-Turn Route Tracker
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time Google Maps style navigation grounded in official government advisories & ChromaDB vector restrictions.
          </p>
        </div>
        <SourceBadge source="AI PREDICTION" />
      </div>

      {/* Step 1: Starting Location Input Options */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-brand-orange" /> Step 1: Specify Starting Location
          </label>

          <button
            onClick={handleUseGPS}
            disabled={loading}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-800 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
          >
            <LocateFixed className="w-3.5 h-3.5 text-blue-600" /> Use My Live GPS Location
          </button>
        </div>

        {/* Search Bar & Custom Address Form */}
        <form onSubmit={handleCustomSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={customSearchQuery}
              onChange={(e) => setCustomSearchQuery(e.target.value)}
              placeholder="Search address or landmark (e.g. Juhu Beach, Thane, Dadar)..."
              className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-brand-orange shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all"
          >
            Search
          </button>
        </form>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">Presets:</span>
          {sampleOrigins.map((orig) => (
            <button
              key={orig.name}
              onClick={() => handleOriginPresetSelect(orig)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                originName === orig.name
                  ? 'bg-brand-orange text-white border-brand-orange shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-brand-orange'
              }`}
            >
              {orig.name}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Vehicle Mode Selector */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
        <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block flex items-center gap-1.5">
          <Navigation className="w-4 h-4 text-brand-orange" /> Step 2: Choose Transport Mode
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {[
            { type: 'FOUR_WHEELER', label: '4-Wheeler (Car)', icon: Car },
            { type: 'TWO_WHEELER', label: '2-Wheeler (Bike)', icon: Bike },
            { type: 'PUBLIC_TRANSIT', label: 'Metro / Train / Bus', icon: Train },
            { type: 'WALKING', label: 'Walking', icon: Footprints },
          ].map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.type}
                onClick={() => handleModeChange(mode.type)}
                className={`p-2.5 rounded-xl text-xs font-extrabold flex flex-col items-center gap-1 transition-all border ${
                  vehicleType === mode.type
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[11px] text-center leading-tight">{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Organizer Gate Reroute Alert Banner */}
      {activeRedirectGate && (
        <div className="bg-rose-600 text-white border border-rose-700 rounded-2xl p-4 flex items-start gap-3 shadow-md animate-pulse">
          <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <div className="font-extrabold text-white uppercase tracking-wide flex items-center gap-2">
              <span>🚨 ORGANIZER GATE REROUTE DIRECTIVE ACTIVE</span>
              <span className="bg-white text-rose-700 text-[10px] px-2 py-0.5 rounded-full font-black">
                GATE STATUS: {activeRedirectGate.gateStatus || activeRedirectGate.crowdLevel}
              </span>
            </div>
            <p className="text-rose-100 leading-relaxed font-semibold">
              {activeRedirectGate.redirectNotice || `${activeRedirectGate.name} is in Danger Zone / Heavy Congestion. Organizers recommend using alternate entry.`}
            </p>
            {activeRedirectGate.redirectGateName && (
              <p className="text-amber-300 font-extrabold text-xs pt-0.5">
                🔀 New Assigned Entry Point: {activeRedirectGate.redirectGateName}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Government Advisory Compliance Banner */}
      {routeResult?.isVehicleRestricted || routeResult?.restrictedRoads?.length > 0 ? (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <div className="font-extrabold text-amber-900 uppercase tracking-wide flex items-center gap-2">
              <span>⚠️ GOVERNMENT ADVISORY DETOUR ENFORCED</span>
              <span className="bg-amber-200 text-amber-900 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {routeResult.vectorExtractor || 'ChromaDB Vector Store'}
              </span>
            </div>
            <p className="text-slate-800 leading-relaxed font-semibold">{routeResult.advisoryReason}</p>
            {routeResult.restrictedRoads?.length > 0 && (
              <p className="text-amber-800 font-bold">
                Restricted Corridors: {routeResult.restrictedRoads.join(', ')}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs text-emerald-900">
            <span className="font-extrabold uppercase">✓ GOVERNMENT COMPLIANT ROUTE:</span> Selected mode ({vehicleType}) obeys all official traffic advisories & road directives.
          </div>
        </div>
      )}

      {/* Interactive Map & Google Maps HUD Navigation Overlay */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
        {/* Google Maps Style HUD Header Card when Live Navigating */}
        {isNavigating && currentStep && (
          <div className="absolute top-4 left-4 right-4 z-10 bg-slate-900/90 text-white p-4 rounded-2xl shadow-xl backdrop-blur-md border border-slate-700 flex items-center gap-3 animate-fadeIn">
            <div className="w-10 h-10 rounded-xl bg-brand-orange flex items-center justify-center text-white shrink-0">
              {currentStep.icon === 'right' && <CornerUpRight className="w-6 h-6" />}
              {currentStep.icon === 'left' && <CornerUpLeft className="w-6 h-6" />}
              {currentStep.icon === 'slight-right' && <CornerUpRight className="w-5 h-5" />}
              {currentStep.icon === 'warning' && <AlertTriangle className="w-6 h-6 text-amber-300" />}
              {(currentStep.icon === 'straight' || currentStep.icon === 'arrive') && <ArrowUp className="w-6 h-6" />}
            </div>

            <div className="flex-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-300">
                LIVE NAVIGATION TRACKING
              </span>
              <p className="text-xs font-extrabold text-white leading-tight mt-0.5">
                {currentStep.instruction}
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs font-bold text-slate-300">{currentStep.distance}</span>
            </div>
          </div>
        )}

        {/* Map Container */}
        <div
          ref={mapContainerRef}
          className="bg-slate-100 h-[380px] w-full relative z-0"
        />

        {/* Floating Controls Overlay */}
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
          <button
            onClick={handleToggleNavigation}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-lg transition-all flex items-center gap-2 ${
              isNavigating
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-brand-orange hover:bg-orange-600 text-white'
            }`}
          >
            {isNavigating ? (
              <>
                <Square className="w-4 h-4 fill-white" /> STOP NAVIGATION
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" /> START LIVE NAVIGATION
              </>
            )}
          </button>
        </div>
      </div>

      {/* Turn-by-Turn Navigation Step Breakdown */}
      {routeResult && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-4 text-xs font-extrabold text-slate-800">
              <span>Distance: <strong className="text-brand-orange">{routeResult.distanceKm} km</strong></span>
              <span>·</span>
              <span>Est. Time: <strong className="text-brand-orange">{routeResult.estimatedTimeMin} mins</strong></span>
            </div>
            <span className="text-[10px] font-extrabold bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full uppercase">
              Mode: {vehicleType}
            </span>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Google Maps Turn-by-Turn Maneuvers
            </h4>
            {routeResult.navigationSteps?.map((step, idx) => (
              <div
                key={step.stepNumber}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all ${
                  isNavigating && currentStepIndex === idx
                    ? 'bg-orange-100 border-brand-orange font-bold text-slate-900 shadow-sm'
                    : step.isAdvisoryWarning
                    ? 'bg-amber-100/70 border-amber-300 text-amber-950 font-bold'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-extrabold text-[11px] flex items-center justify-center shrink-0">
                    {step.stepNumber}
                  </span>
                  <p className="leading-snug">{step.instruction}</p>
                </div>
                <span className="text-slate-500 font-bold text-xs shrink-0">{step.distance}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
