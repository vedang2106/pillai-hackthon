import React, { useEffect, useState } from 'react';
import { eventsApi } from '../../services/api';
import SourceBadge from '../common/SourceBadge';
import { BrainCircuit, TrendingUp, Clock, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

export default function DemandForecastCard({ eventId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedZoneIndex, setSelectedZoneIndex] = useState(0);

  function fetchForecasts() {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    eventsApi
      .getDemandPredictions(eventId)
      .then(({ data: res }) => {
        setData(res);
        if (res.predictions && res.predictions.length > 0) {
          setSelectedZoneIndex(0);
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Could not load AI demand prediction');
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchForecasts();
  }, [eventId]);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-center gap-3 text-slate-500 text-sm">
        <RefreshCw className="w-4 h-4 animate-spin text-brand-orange" />
        <span>Computing XGBoost AI Demand Predictions...</span>
      </div>
    );
  }

  if (error || !data || !data.predictions || data.predictions.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
            <BrainCircuit className="w-5 h-5 text-brand-orange" />
            AI Demand Prediction (XGBoost Engine)
          </div>
          <SourceBadge source="AI PREDICTION" />
        </div>
        <p className="text-xs text-slate-500">
          {error || 'Insufficient live zone data to generate dynamic XGBoost predictions. Add zones to view predictions.'}
        </p>
      </div>
    );
  }

  const predictions = data.predictions || [];
  const currentZone = predictions[selectedZoneIndex] || predictions[0];
  const forecasts = currentZone?.forecasts || [];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-orange" />
            <h3 className="text-lg font-extrabold text-slate-900">AI Crowd Demand Forecast</h3>
            <SourceBadge source="AI PREDICTION" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Engine: <strong className="text-slate-700">{data.modelVersion || 'XGBoost Regressor'}</strong> · Confidence: <strong className="text-emerald-700">{currentZone.confidence || 'HIGH'}</strong>
          </p>
        </div>

        {/* Zone Selector */}
        {predictions.length > 1 && (
          <select
            value={selectedZoneIndex}
            onChange={(e) => setSelectedZoneIndex(Number(e.target.value))}
            className="text-xs font-bold rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-slate-800"
          >
            {predictions.map((p, idx) => (
              <option key={p.zoneId} value={idx}>
                {p.name} ({p.currentCrowd?.toLocaleString()} / {p.zoneCapacity?.toLocaleString()})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Selected Zone Overview */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
        {/* Current State */}
        <div className="md:col-span-1 bg-slate-50 border border-slate-200 rounded-xl p-4">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Current Crowd</span>
          <div className="text-3xl font-black text-slate-900 mt-1">
            {currentZone.currentCrowd?.toLocaleString()}
          </div>
          <div className="text-xs font-semibold text-slate-500 mt-1">
            Utilization: <strong className="text-slate-800">{currentZone.currentUtilization}%</strong>
          </div>
        </div>

        {/* Forecast Columns (+5 MIN, +10 MIN, +15 MIN, +30 MIN) */}
        <div className="md:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {forecasts.map((fc) => {
            const isIncrease = fc.predictedCrowd >= currentZone.currentCrowd;
            return (
              <div
                key={fc.timeOffsetMinutes}
                className="bg-white border border-slate-200 rounded-xl p-3.5 hover:border-brand-orange transition-all shadow-xs"
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase">
                  <span>+{fc.timeOffsetMinutes} MIN</span>
                  <Clock className="w-3.5 h-3.5 text-brand-orange" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900 mt-1.5 flex items-center gap-1">
                  {fc.predictedCrowd?.toLocaleString()}
                  <TrendingUp className={`w-4 h-4 ${isIncrease ? 'text-amber-500' : 'text-emerald-500'}`} />
                </div>
                <div className="text-xs font-medium text-slate-500 mt-1">
                  Predicted: <strong className="text-slate-800">{fc.predictedUtilization}%</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Dynamic ML Feature Matrix calculated live from MongoDB state</span>
        <button
          onClick={fetchForecasts}
          className="text-brand-orange font-bold hover:underline flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" /> Refresh AI Predictions
        </button>
      </div>
    </div>
  );
}
