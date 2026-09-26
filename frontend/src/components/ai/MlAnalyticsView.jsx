import React, { useEffect, useState } from 'react';
import { aiApi } from '../../services/api';
import SourceBadge from '../common/SourceBadge';
import { BarChart3, CheckCircle2, AlertCircle } from 'lucide-react';

export default function MlAnalyticsView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    aiApi
      .getMlAnalytics()
      .then(({ data }) => setData(data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-pulse">
        <div className="h-5 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-32 bg-slate-100 rounded-xl"></div>
      </div>
    );
  }

  if (data?.status === 'INSUFFICIENT_DATA') {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-orange" />
            <h3 className="font-extrabold text-slate-900 text-lg">ML Analytics & Diagnostic Engine</h3>
          </div>
          <SourceBadge source="AI PREDICTION" />
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-xs text-amber-900 font-extrabold">{data.message}</p>
        </div>
      </div>
    );
  }

  const d = data?.demandMetrics || {};
  const r = data?.riskMetrics || {};
  const t = data?.trainingDetails || {};

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-brand-orange" />
          <h3 className="font-extrabold text-slate-900 text-lg">ML Analytics & Diagnostic Engine</h3>
        </div>
        <SourceBadge source="AI PREDICTION" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Demand Metrics */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Demand Forecasting Metrics</h4>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">MAE</span>
              <span className="text-lg font-extrabold text-slate-900">{d.MAE ?? '—'}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">RMSE</span>
              <span className="text-lg font-extrabold text-slate-900">{d.RMSE ?? '—'}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">R² SCORE</span>
              <span className="text-lg font-extrabold text-emerald-600">{d.R2 ?? '—'}</span>
            </div>
          </div>
        </div>

        {/* Risk Metrics */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Risk Detection Classifier</h4>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">PRECISION</span>
              <span className="text-lg font-extrabold text-slate-900">{r.Precision ?? '—'}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">RECALL</span>
              <span className="text-lg font-extrabold text-slate-900">{r.Recall ?? '—'}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">F1 SCORE</span>
              <span className="text-lg font-extrabold text-emerald-600">{r.F1Score ?? '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Model Metadata */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap justify-between items-center text-xs text-slate-500 gap-2">
        <span>Model Version: <strong className="text-slate-700">{data?.modelVersion}</strong></span>
        <span>Training Samples: <strong className="text-slate-700">{t.trainingDataSize}</strong></span>
        <span>Training Time: <strong className="text-slate-700">{t.trainingTimeSec}s</strong></span>
      </div>
    </div>
  );
}
