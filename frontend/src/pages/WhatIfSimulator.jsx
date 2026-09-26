import React, { useState } from 'react';
import Card from '../components/common/Card';
import { FlaskConical, Sliders, AlertTriangle, ArrowRight, Play, CheckCircle2 } from 'lucide-react';

export default function WhatIfSimulator({ data }) {
  // Simulator Controls State
  const [visitors, setVisitors] = useState(48000);
  const [gate3Capacity, setGate3Capacity] = useState(100); // percentage
  const [metroDelay, setMetroDelay] = useState(0); // minutes
  const [shuttleCount, setShuttleCount] = useState(10);

  // Quick Preset Scenarios
  const applyPreset = (type) => {
    if (type === 'gate_close') {
      setGate3Capacity(20);
      setVisitors(52000);
    } else if (type === 'surge') {
      setVisitors(65000);
    } else if (type === 'metro_delay') {
      setMetroDelay(25);
      setVisitors(50000);
    }
  };

  // Prediction Calculations based on sliders
  const isCritical = visitors > 55000 || gate3Capacity < 40 || metroDelay > 15;
  const predictedGate3Density = Math.min(100, Math.round((visitors / 48000) * (100 / (gate3Capacity / 100)) * 75));
  const predictedMetroLoad = Math.min(100, Math.round((visitors / 48000) * 70 + metroDelay * 1.2));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl text-white shadow-glass flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-orange/20 border border-brand-orange/40 text-brand-orangeLight font-bold text-xs mb-2">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Interactive Scenario Engine</span>
          </div>
          <h2 className="text-2xl font-bold">AI What-If Simulator</h2>
          <p className="text-slate-400 text-sm mt-1">Test potential disruptions and generate proactive mitigation strategies.</p>
        </div>

        {/* Preset Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => applyPreset('gate_close')}
            className="bg-slate-800 hover:bg-slate-700 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 text-slate-200 transition-all"
          >
            🚫 Gate 3 Closure
          </button>
          <button
            onClick={() => applyPreset('surge')}
            className="bg-slate-800 hover:bg-slate-700 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 text-slate-200 transition-all"
          >
            ⚡ +15,000 Visitors
          </button>
          <button
            onClick={() => applyPreset('metro_delay')}
            className="bg-slate-800 hover:bg-slate-700 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 text-slate-200 transition-all"
          >
            🚆 Metro Delay (25 min)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sliders & Controls */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <div className="flex items-center space-x-2 text-brand-orange font-bold text-sm mb-6">
              <Sliders className="w-4 h-4" />
              <span>Adjust Disruption Parameters</span>
            </div>

            {/* Slider 1: Expected Visitors */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-slate-600">Expected Visitors</span>
                <span className="text-brand-orange font-bold">{visitors.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="30000"
                max="75000"
                step="1000"
                value={visitors}
                onChange={(e) => setVisitors(Number(e.target.value))}
                className="w-full accent-brand-orange cursor-pointer"
              />
            </div>

            {/* Slider 2: Gate 3 Capacity */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-slate-600">Gate 3 Capacity Limit</span>
                <span className="text-brand-orange font-bold">{gate3Capacity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={gate3Capacity}
                onChange={(e) => setGate3Capacity(Number(e.target.value))}
                className="w-full accent-brand-orange cursor-pointer"
              />
            </div>

            {/* Slider 3: Metro Delay */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-slate-600">Metro Line Delay</span>
                <span className="text-brand-orange font-bold">{metroDelay} mins</span>
              </div>
              <input
                type="range"
                min="0"
                max="45"
                step="5"
                value={metroDelay}
                onChange={(e) => setMetroDelay(Number(e.target.value))}
                className="w-full accent-brand-orange cursor-pointer"
              />
            </div>
          </Card>
        </div>

        {/* Right Column: AI Predicted Impact */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 text-lg">AI Impact Prediction Output</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  isCritical ? 'bg-red-100 text-red-600 border-red-200' : 'bg-emerald-100 text-emerald-600 border-emerald-200'
                }`}>
                  {isCritical ? 'CRITICAL RISK DETECTED' : 'SYSTEM STABLE'}
                </span>
              </div>

              {/* Impact Comparison Bars */}
              <div className="space-y-4 mb-8">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                    <span>Predicted Gate 3 Density</span>
                    <span>{predictedGate3Density}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        predictedGate3Density > 85 ? 'bg-red-500' : predictedGate3Density > 65 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${predictedGate3Density}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                    <span>Predicted Metro Transit Saturation</span>
                    <span>{predictedMetroLoad}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        predictedMetroLoad > 85 ? 'bg-red-500' : predictedMetroLoad > 65 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${predictedMetroLoad}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Recommended Action Box */}
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
                <h4 className="text-sm font-bold text-brand-orange uppercase tracking-wider mb-2 flex items-center space-x-2">
                  <Play className="w-4 h-4 fill-current" />
                  <span>AI Recommended Intervention</span>
                </h4>
                <p className="text-slate-800 font-semibold text-sm">
                  {isCritical 
                    ? `Redirect ~${Math.round((visitors * 0.15))} visitors from Gate 3 to Gate 1. Dispatch 5 additional shuttle buses to relieve Metro station queue.`
                    : 'Current flow parameters are within safe thresholds. No rerouting needed[cite: 1].'}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => alert("Intervention plan broadcasted to Visitor App and Security Personnel!")}
                className="bg-brand-orange hover:bg-brand-orangeHover text-white font-bold px-6 py-3 rounded-xl shadow-shiny text-sm transition-all flex items-center space-x-2"
              >
                <span>Deploy AI Mitigation Plan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}