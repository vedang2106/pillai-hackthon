import React, { useState } from 'react';
import Card from '../common/Card';
import { AlertOctagon, ShieldAlert, Zap, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';

export default function AICrisisRoom() {
  const [executed, setExecuted] = useState(false);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-brand-orange to-red-600 p-6 rounded-2xl text-white shadow-shiny flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
            <AlertOctagon className="w-8 h-8 animate-pulse text-white" />
          </div>
          <div>
            <span className="bg-white text-red-600 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              LIVE EMERGENCY CONTROL ROOM
            </span>
            <h2 className="text-2xl font-extrabold mt-1">AI Crisis Command Center</h2>
          </div>
        </div>

        {executed && (
          <button
            onClick={() => setExecuted(false)}
            className="bg-white/20 hover:bg-white/30 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Crisis Demo</span>
          </button>
        )}
      </div>

      {/* Critical Incident Summary */}
      <Card className="border-2 border-red-200 bg-red-50/30">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 text-red-600 font-bold text-sm mb-1">
              <ShieldAlert className="w-5 h-5" />
              <span>🔴 CRITICAL INCIDENT REPORTED</span>
            </div>
            <h3 className="text-xl font-black text-slate-900">Gate 2 Stampede Threat & Metro Delay</h3>
            <p className="text-slate-600 text-sm mt-1">
              Queue growth at +38%/5min with incoming heavy rain (74%) and Metro Line 1 delay.
            </p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-red-200 text-center min-w-[140px]">
            <p className="text-xs text-slate-400 font-bold uppercase">Expected Reduction</p>
            <p className="text-2xl font-black text-emerald-600">31% Crowd</p>
          </div>
        </div>
      </Card>

      {/* Real-time Before vs After Impact Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gate Status Visualizer */}
        <Card className="space-y-4">
          <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider flex items-center space-x-2">
            <span>Live Zone Density Visualizer</span>
          </h4>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-700">Gate 2 (Primary Entrance)</span>
              <span className={executed ? 'text-amber-600 font-extrabold' : 'text-red-600 font-extrabold'}>
                {executed ? '61% (Moderate)' : '92% (CRITICAL)'}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${executed ? 'bg-amber-500' : 'bg-red-600'}`}
                style={{ width: executed ? '61%' : '92%' }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-700">Gate 4 (Secondary Entrance)</span>
              <span className={executed ? 'text-amber-600 font-extrabold' : 'text-emerald-600 font-extrabold'}>
                {executed ? '58% (Moderate)' : '41% (Low)'}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${executed ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: executed ? '58%' : '41%' }}
              ></div>
            </div>
          </div>

          {executed && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-800 text-xs font-bold animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>AI Intervention Executed: Overall Event Risk ↓ 27%</span>
            </div>
          )}
        </Card>

        {/* AI Action Plan Execution Box */}
        <Card className="flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider mb-3">
              Generated AI Action Plan
            </h4>

            <ul className="space-y-2 text-xs font-semibold text-slate-700">
              <li className="flex items-center space-x-2 p-2 bg-slate-50 rounded-lg">
                <span className="text-brand-orange font-bold">1.</span>
                <span>Redirect 40% incoming visitors $\rightarrow$ Gate 4</span>
              </li>
              <li className="flex items-center space-x-2 p-2 bg-slate-50 rounded-lg">
                <span className="text-brand-orange font-bold">2.</span>
                <span>Open secondary security lane at Zone B[cite: 1]</span>
              </li>
              <li className="flex items-center space-x-2 p-2 bg-slate-50 rounded-lg">
                <span className="text-brand-orange font-bold">3.</span>
                <span>Push mobile alert to attendees within 500m of Gate 2[cite: 1]</span>
              </li>
              <li className="flex items-center space-x-2 p-2 bg-slate-50 rounded-lg">
                <span className="text-brand-orange font-bold">4.</span>
                <span>Deploy Security Team S3 to clear bottleneck[cite: 1]</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => setExecuted(true)}
            disabled={executed}
            className={`mt-6 w-full py-3.5 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center space-x-2 ${
              executed
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-brand-orange hover:bg-brand-orangeHover text-white shadow-shiny active:scale-95'
            }`}
          >
            {executed ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>AI Plan Executed Successfully</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 fill-current" />
                <span>EXECUTE AI ACTION PLAN NOW</span>
              </>
            )}
          </button>
        </Card>
      </div>
    </div>
  );
}