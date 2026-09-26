import React, { useEffect, useState } from 'react';
import { aiApi } from '../../services/api';
import SourceBadge from '../common/SourceBadge';
import { LogOut, Bus, Car, Train } from 'lucide-react';

export default function ExitWaveCard({ eventId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    aiApi
      .getExitWave(eventId)
      .then(({ data }) => setData(data))
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

  const timeline = data?.timeline || [];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <LogOut className="w-5 h-5 text-brand-orange" />
          <h3 className="font-extrabold text-slate-900 text-lg">Event Exit Wave AI Forecast</h3>
        </div>
        <SourceBadge source="AI PREDICTION" />
      </div>

      <p className="text-xs text-slate-500 mb-4">
        Predicts visitor egress dispersal patterns across gates, parking lots, and transit platforms upon event completion.
      </p>

      {timeline.length === 0 ? (
        <p className="text-sm text-slate-500">No exit wave forecast data available.</p>
      ) : (
        <div className="space-y-3">
          {timeline.map((item, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-slate-900 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[10px] font-extrabold">{item.interval}</span>
                  {item.phase}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                    item.riskLevel === 'CRITICAL'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : item.riskLevel === 'HIGH'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}
                >
                  {item.riskLevel} SURGE
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-400 font-bold text-[10px] block">VENUE EXIT</span>
                  <span className="font-bold text-slate-800">{item.venueExitCrowd.toLocaleString()}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 font-bold text-[10px] block">METRO / RAIL</span>
                    <span className="font-bold text-slate-800">{item.metroRailDemandCrowd.toLocaleString()}</span>
                  </div>
                  <Train className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 font-bold text-[10px] block">ROAD ARTERIAL</span>
                    <span className="font-bold text-slate-800">{item.roadDemandCrowd.toLocaleString()}</span>
                  </div>
                  <Car className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 font-bold text-[10px] block">BUS / SHUTTLE</span>
                    <span className="font-bold text-slate-800">{item.busRideshareCrowd.toLocaleString()}</span>
                  </div>
                  <Bus className="w-3.5 h-3.5 text-emerald-500" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
