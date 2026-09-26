import React, { useState } from 'react';
import Card from '../common/Card';
import { Gamepad2, ShieldAlert, Award, ArrowRight, RotateCcw } from 'lucide-react';

export default function EventSurvivalChallenge() {
  const [stage, setStage] = useState(1);
  const [selectedDecision, setSelectedDecision] = useState(null);

  const decisions = [
    { id: 'A', text: 'Close Gate 2 completely', riskChange: '+45% Zone Chaos', score: -20 },
    { id: 'B', text: 'Redirect visitors to Gate 4', riskChange: '-34% Crowd Density', score: +50, isRecommended: true },
    { id: 'C', text: 'Increase security & keep Gate 2 open', riskChange: '-10% Queue Time', score: +10 }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl text-white shadow-glass flex justify-between items-center">
        <div>
          <span className="bg-brand-orange text-white font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
            JUDGE DEMO MODE
          </span>
          <h2 className="text-2xl font-black mt-2 flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-brand-orange" />
            <span>Event Commander Survival Challenge</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">Can you keep the mega-event safe under pressure?[cite: 1]</p>
        </div>

        {selectedDecision && (
          <button
            onClick={() => setSelectedDecision(null)}
            className="bg-slate-800 hover:bg-slate-700 text-xs font-bold px-3 py-2 rounded-xl text-slate-300 flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        )}
      </div>

      {/* Scenario Briefing Card */}
      <Card className="border-2 border-orange-200 bg-orange-50/20">
        <div className="flex items-start space-x-3">
          <ShieldAlert className="w-6 h-6 text-brand-orange flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">⚠️ MINUTE 47 — MULTIPLE INCIDENT DISRUPTION</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
              Heavy rain incoming (80% probability). Gate 2 crowd density spiked to 88%. Metro Line 1 experiences a 15-minute operational delay[cite: 1]. 8,000 additional visitors arriving in 20 minutes[cite: 1].
            </p>
          </div>
        </div>
      </Card>

      {/* Decision Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {decisions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelectedDecision(opt)}
            className={`p-5 rounded-2xl text-left border transition-all flex flex-col justify-between ${
              selectedDecision?.id === opt.id
                ? 'bg-brand-orange text-white border-brand-orange shadow-shiny scale-105'
                : 'bg-white text-slate-800 border-slate-200 hover:border-brand-orangeLight'
            }`}
          >
            <div>
              <span className={`text-xs font-black px-2 py-1 rounded-md mb-3 inline-block ${
                selectedDecision?.id === opt.id ? 'bg-white text-brand-orange' : 'bg-slate-100 text-slate-700'
              }`}>
                OPTION {opt.id}
              </span>
              <p className="font-bold text-sm leading-snug">{opt.text}</p>
            </div>

            <p className={`text-xs font-extrabold mt-4 ${
              selectedDecision?.id === opt.id ? 'text-orange-100' : 'text-slate-400'
            }`}>
              Impact: {opt.riskChange}
            </p>
          </button>
        ))}
      </div>

      {/* Consequence Output */}
      {selectedDecision && (
        <Card className="bg-slate-900 text-white border-slate-800 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <h4 className="font-extrabold text-sm uppercase tracking-wider flex items-center space-x-2 text-brand-orange">
              <Award className="w-5 h-5" />
              <span>AI Simulation Assessment Results</span>
            </h4>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              selectedDecision.isRecommended ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40'
            }`}>
              {selectedDecision.isRecommended ? '✓ OPTIMAL AI DECISION' : '⚠️ HIGH RISK SELECTION'}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-slate-800/60 rounded-xl">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Gate 2 Density</p>
              <p className="text-xl font-extrabold text-emerald-400">↓ 34%</p>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Gate 4 Load</p>
              <p className="text-xl font-extrabold text-amber-400">↑ 18%</p>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Average Entry Time</p>
              <p className="text-xl font-extrabold text-emerald-400">↓ 21%</p>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Security Risk Index</p>
              <p className="text-xl font-extrabold text-emerald-400">↓ 26%</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}