import React, { useEffect, useState } from 'react';
import { aiApi } from '../../services/api';
import SourceBadge from '../common/SourceBadge';
import { AlertTriangle, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

export default function RiskAlertsCard({ eventId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    aiApi
      .getRiskDetection(eventId)
      .then(({ data }) => setData(data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-pulse">
        <div className="h-5 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-16 bg-slate-100 rounded-xl"></div>
      </div>
    );
  }

  const risks = data?.risks || [];
  const highOrCritical = risks.filter((r) => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL');

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-brand-orange" />
          <h3 className="font-extrabold text-slate-900 text-lg">Real-Time Risk Detection & Alerts</h3>
        </div>
        <SourceBadge source="AI PREDICTION" />
      </div>

      {risks.length === 0 ? (
        <p className="text-sm text-slate-500">No risk evaluation data available.</p>
      ) : highOrCritical.length === 0 ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs text-emerald-800">
            <span className="font-extrabold text-emerald-900">ALL ZONES LOW/MEDIUM RISK:</span> Operating smoothly within safe capacity parameters.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {highOrCritical.map((r, idx) => (
            <div
              key={r.zoneId || idx}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                r.riskLevel === 'CRITICAL'
                  ? 'bg-rose-50 border-rose-300 text-rose-900'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    className={`w-4 h-4 shrink-0 ${r.riskLevel === 'CRITICAL' ? 'text-rose-600' : 'text-amber-600'}`}
                  />
                  <span className="font-extrabold text-sm uppercase">{r.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                      r.riskLevel === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    {r.riskLevel} RISK ({r.riskScore} PTS)
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{r.reason}</p>
              </div>

              {r.predictedTimeToThreshold != null && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white/80 px-3 py-1.5 rounded-lg border border-slate-200 shrink-0">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Threshold in ~{r.predictedTimeToThreshold}m</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
