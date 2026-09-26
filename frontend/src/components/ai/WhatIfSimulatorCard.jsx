import React, { useState } from 'react';
import { aiApi } from '../../services/api';
import SourceBadge from '../common/SourceBadge';
import { Sliders, Play, AlertCircle } from 'lucide-react';

export default function WhatIfSimulatorCard({ eventId }) {
  const [surge, setSurge] = useState(25);
  const [transitCapacity, setTransitCapacity] = useState(100);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleRunSimulation = () => {
    if (!eventId) return;
    setLoading(true);
    aiApi
      .runWhatIf(eventId, {
        attendanceSurgePercent: surge,
        transitCapacityFactor: transitCapacity / 100.0,
      })
      .then(({ data }) => setResult(data))
      .catch(() => setResult(null))
      .finally(() => setLoading(false));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-brand-orange" />
          <h3 className="font-extrabold text-slate-900 text-lg">What-If Scenario Simulator</h3>
        </div>
        <SourceBadge source="SIMULATED" />
      </div>

      <p className="text-xs text-slate-500 mb-4">
        Test hypothetical operational perturbations (surge in attendance, transit bottleneck) without altering production data.
      </p>

      {/* Control Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs">
        <div>
          <label className="font-bold text-slate-700 block mb-1">
            Attendance Surge: <span className="text-brand-orange">+{surge}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={surge}
            onChange={(e) => setSurge(Number(e.target.value))}
            className="w-full accent-brand-orange cursor-pointer"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">
            Transit Operational Capacity: <span className="text-brand-orange">{transitCapacity}%</span>
          </label>
          <input
            type="range"
            min="20"
            max="100"
            value={transitCapacity}
            onChange={(e) => setTransitCapacity(Number(e.target.value))}
            className="w-full accent-brand-orange cursor-pointer"
          />
        </div>
      </div>

      <button
        onClick={handleRunSimulation}
        disabled={loading}
        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
      >
        <Play className="w-4 h-4 fill-white" />
        {loading ? 'Running Predictive Simulation...' : 'RUN SCENARIO SIMULATION'}
      </button>

      {result && (
        <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 flex items-start gap-2 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="font-semibold">{result.comparisonSummary}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <span className="text-slate-400 font-bold uppercase tracking-wider block">CURRENT STATE</span>
              <span className="text-lg font-extrabold text-slate-900">
                {result.currentStateRisks?.filter((r) => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL').length} High/Critical Zones
              </span>
            </div>
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl">
              <span className="text-rose-600 font-bold uppercase tracking-wider block">SIMULATED STATE</span>
              <span className="text-lg font-extrabold text-rose-900">
                {result.simulatedStateRisks?.filter((r) => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL').length} High/Critical Zones
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
