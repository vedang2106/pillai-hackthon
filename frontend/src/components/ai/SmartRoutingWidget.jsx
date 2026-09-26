import React, { useState } from 'react';
import { aiApi } from '../../services/api';
import SourceBadge from '../common/SourceBadge';
import { Navigation, Compass, CheckCircle, ShieldCheck } from 'lucide-react';

export default function SmartRoutingWidget() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const sampleRoutes = [
    {
      id: 'route_a',
      name: 'Direct Arterial Route A (via Central Ave)',
      distanceKm: 2.0,
      baseTimeMin: 15,
      crowdLevel: 'HIGH',
      trafficLevel: 'HEAVY',
      riskLevel: 'HIGH',
    },
    {
      id: 'route_b',
      name: 'Detour Route B (via Ring Corridor)',
      distanceKm: 2.4,
      baseTimeMin: 18,
      crowdLevel: 'LOW',
      trafficLevel: 'NORMAL',
      riskLevel: 'LOW',
    },
  ];

  const handleCalculateRoute = () => {
    setLoading(true);
    aiApi
      .getSmartRoute({
        origin: { name: 'Metro Station North' },
        destination: { name: 'Main Venue Gate' },
        availableRoutes: sampleRoutes,
      })
      .then(({ data }) => setResult(data))
      .catch(() => setResult(null))
      .finally(() => setLoading(false));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-brand-orange" />
          <h3 className="font-extrabold text-slate-900 text-lg">AI Smart Route Optimizer</h3>
        </div>
        <SourceBadge source="AI PREDICTION" />
      </div>

      <p className="text-xs text-slate-500 mb-4">
        Evaluates crowd density, traffic gridlock, and risk levels to recommend the safest, least congested path.
      </p>

      {!result && (
        <button
          onClick={handleCalculateRoute}
          disabled={loading}
          className="w-full py-3 bg-brand-orange hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Compass className="w-4 h-4" />
          {loading ? 'Calculating Crowd-Aware Smart Route...' : 'GET SMART ROUTE'}
        </button>
      )}

      {result && (
        <div className="space-y-4">
          {/* Recommended Route */}
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-extrabold text-xs text-emerald-900 uppercase flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> RECOMMENDED ROUTE
              </span>
              <span className="text-[10px] font-extrabold bg-emerald-200 text-emerald-900 px-2.5 py-0.5 rounded-full">
                Score: {result.recommendedRoute.score}
              </span>
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">{result.recommendedRoute.name}</h4>
            <div className="flex items-center gap-4 text-xs text-slate-600 mt-2">
              <span>Distance: <strong>{result.recommendedRoute.distanceKm} km</strong></span>
              <span>Perceived Time: <strong>{result.recommendedRoute.effectivePerceivedTimeMin} min</strong></span>
              <span>Crowd: <strong className="text-emerald-700">{result.recommendedRoute.crowdLevel}</strong></span>
            </div>
            <p className="text-xs text-emerald-900 font-semibold mt-3 bg-white/80 p-2.5 rounded-lg border border-emerald-200">
              "{result.recommendationReason}"
            </p>
          </div>

          {/* Alternatives */}
          {result.alternativeRoutes?.map((alt) => (
            <div key={alt.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-extrabold text-xs text-slate-700">{alt.name}</span>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-300">
                  {alt.riskLevel} RISK
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                <span>{alt.distanceKm} km</span>
                <span>Est. Time: {alt.estimatedTimeMin} min</span>
                <span>Crowd: {alt.crowdLevel}</span>
              </div>
            </div>
          ))}

          <button
            onClick={handleCalculateRoute}
            className="text-xs text-brand-orange font-bold hover:underline"
          >
            Re-calculate routes
          </button>
        </div>
      )}
    </div>
  );
}
