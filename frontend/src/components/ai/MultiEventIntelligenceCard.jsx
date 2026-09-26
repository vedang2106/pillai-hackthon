import React, { useEffect, useState } from 'react';
import { aiApi } from '../../services/api';
import SourceBadge from '../common/SourceBadge';
import { Layers, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function MultiEventIntelligenceCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    aiApi
      .getMultiEvent()
      .then(({ data }) => setData(data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-pulse">
        <div className="h-5 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-20 bg-slate-100 rounded-xl"></div>
      </div>
    );
  }

  const interactions = data?.interactions || [];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-brand-orange" />
          <h3 className="font-extrabold text-slate-900 text-lg">City Multi-Event Overlap Intelligence</h3>
        </div>
        <SourceBadge source="AI PREDICTION" />
      </div>

      <p className="text-xs text-slate-500 mb-4">
        Monitors cross-event proximity, shared transport hubs, and overlapping departure wave windows across the city.
      </p>

      {interactions.length === 0 ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-xs text-emerald-800 font-extrabold">
            NO CONCURRENT OVERLAPS DETECTED: City event footprints maintain safe physical & transport buffer distances.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {interactions.map((item, idx) => (
            <div key={idx} className="bg-amber-50 border border-amber-300 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-extrabold text-amber-900 text-sm flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> {item.title}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-200 text-amber-900 border border-amber-300">
                  {item.severity}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{item.details}</p>
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 pt-1">
                <span>Distance: <strong className="text-slate-800">{item.distanceKm} km</strong></span>
                <span>·</span>
                <span>Combined Crowd: <strong className="text-slate-800">{item.combinedExpectedAttendance?.toLocaleString()}</strong></span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-amber-200 text-xs text-amber-900 font-semibold">
                <strong>Government Directive:</strong> {item.recommendedAction}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
