import React, { useState } from 'react';
import Card from '../common/Card';
import { Sliders, AlertCircle, ArrowRight, RefreshCw, Zap } from 'lucide-react';

export default function WhatIfSimulator({ onApplyScenario }) {
  const [visitors, setVisitors] = useState(50000);
  const [gate3Capacity, setGate3Capacity] = useState(60);
  const [metroDelay, setMetroDelay] = useState(false);

  // Calculate predicted risk dynamically based on slider values
  const predictedRisk = visitors > 55000 || gate3Capacity < 40 || metroDelay ? 'CRITICAL' : 'MODERATE';

  const handleSimulate = () => {
    onApplyScenario({
      visitors,
      gate3Capacity,
      metroDelay,
      predictedRisk
    });
  };

  return (
    <Card className="border-orange-200 bg-gradient-to-br from-white via-orange-50/20 to-white">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-brand-orange text-white rounded-xl shadow-shiny">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">AI What-If Scenario Simulator</h3>
            <p className="text-xs text-slate-400 font-medium">Test real-time event disruptions and predict crowd impact[cite: 1].</p>
          </div>
        </div>
        <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
          predictedRisk === 'CRITICAL' ? 'bg-red-100 text-red-600 border-red-200' : 'bg-amber-100 text-amber-600 border-amber-200'
        }`}>
          PREDICTED RISK: {predictedRisk}
        </span>
      </div>

      {/* Preset Scenario Quick Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <button
          onClick={() => { setGate3Capacity(0); }}
          className="p-3 bg-white border border-slate-200 hover:border-brand-orange rounded-xl text-xs font-bold text-slate-700 transition-all shadow-sm text-left"
        >
          🚨 Close Gate 3 Completely
        </button>
        <button
          onClick={() => { setVisitors(65000); }}
          className="p-3 bg-white border border-slate-200 hover:border-brand-orange rounded-xl text-xs font-bold text-slate-700 transition-all shadow-sm text-left"
        >
          📈 +15,000 Visitor Surge
        </button>
        <button
          onClick={() => { setMetroDelay(true); }}
          className="p-3 bg-white border border-slate-200 hover:border-brand-orange rounded-xl text-xs font-bold text-slate-700 transition-all shadow-sm text-left"
        >
          🚇 20-Min Metro Delay
        </button>
        <button
          onClick={() => { setVisitors(48000); setGate3Capacity(80); setMetroDelay(false); }}
          className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Parameters</span>
        </button>
      </div>

      {/* Interactive Controls */}
      <div className="space-y-4 mb-6 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
            <span>Expected Visitor Volume</span>
            <span className="text-brand-orange">{visitors.toLocaleString()} attendees</span>
          </div>
          <input
            type="range"
            min="30000"
            max="80000"
            step="1000"
            value={visitors}
            onChange={(e) => setVisitors(Number(e.target.value))}
            className="w-full accent-brand-orange cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
            <span>Gate 3 Throughput Capacity</span>
            <span className="text-brand-orange">{gate3Capacity}% operational</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={gate3Capacity}
            onChange={(e) => setGate3Capacity(Number(e.target.value))}
            className="w-full accent-brand-orange cursor-pointer"
          />
        </div>
      </div>

      {/* Action Trigger */}
      <button
        onClick={handleSimulate}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 text-sm"
      >
        <Zap className="w-4 h-4 text-brand-orange" />
        <span>Run Predictive Simulation Model</span>
      </button>
    </Card>
  );
}