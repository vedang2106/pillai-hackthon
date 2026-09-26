import React, { useEffect, useState } from 'react';
import { aiApi } from '../../services/api';
import SourceBadge from '../common/SourceBadge';
import { Activity, ArrowRight } from 'lucide-react';

export default function CrowdRippleCard({ eventId }) {
  const [data, setData] = useState(null);
  const [activeStep, setActiveStep] = useState('CURRENT');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    aiApi
      .getCrowdRipple(eventId)
      .then(({ data }) => {
        setData(data);
        if (data?.timeline) {
          const keys = Object.keys(data.timeline);
          if (keys.length > 0) setActiveStep(keys[0]);
        }
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-pulse">
        <div className="h-5 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-24 bg-slate-100 rounded-xl"></div>
      </div>
    );
  }

  const timeline = data?.timeline || {};
  const stepKeys = Object.keys(timeline);
  const currentNodes = timeline[activeStep] || {};

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-brand-orange" />
          <h3 className="font-extrabold text-slate-900 text-lg">Crowd Ripple Propagation Model</h3>
        </div>
        <SourceBadge source="AI PREDICTION" />
      </div>

      <p className="text-xs text-slate-500 mb-4">
        NetworkX spatial graph modeling crowd pressure movement across connected transport, roads, and venue gates.
      </p>

      {/* Timeline Controls */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {stepKeys.map((key) => (
          <button
            key={key}
            onClick={() => setActiveStep(key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all border shrink-0 ${
              activeStep === key
                ? 'bg-brand-orange text-white border-brand-orange shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      {/* Nodes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {Object.values(currentNodes).map((node) => {
          let badgeBg = 'bg-emerald-100 text-emerald-800 border-emerald-300';
          if (node.risk === 'CRITICAL') badgeBg = 'bg-rose-100 text-rose-800 border-rose-300';
          else if (node.risk === 'HIGH') badgeBg = 'bg-amber-100 text-amber-800 border-amber-300';
          else if (node.risk === 'MEDIUM') badgeBg = 'bg-yellow-100 text-yellow-800 border-yellow-300';

          return (
            <div key={node.nodeId} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-extrabold text-xs text-slate-900 truncate">{node.name}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${badgeBg}`}>
                  {node.risk}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>{node.type}</span>
                <span className="font-bold text-slate-700">{node.occupancy.toLocaleString()} / {node.capacity.toLocaleString()}</span>
              </div>

              <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    node.risk === 'CRITICAL' ? 'bg-rose-600' : node.risk === 'HIGH' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(node.utilization, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
