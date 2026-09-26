import React from 'react';
import Card from '../components/common/Card';
import { BarChart3, TrendingUp, ShieldCheck, Clock, Activity } from 'lucide-react';

export default function Analytics() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-glass">
        <div className="flex items-center space-x-3 text-brand-orange mb-2">
          <BarChart3 className="w-6 h-6" />
          <h2 className="text-2xl font-bold text-slate-900">Event Intelligence & Analytics</h2>
        </div>
        <p className="text-slate-400 text-sm">Post-event crowd dynamics, queue reduction times, and predictive model evaluation.</p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <p className="text-slate-400 text-xs font-bold uppercase">Avg Queue Time</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">14 mins</p>
          <span className="text-xs font-bold text-emerald-600 mt-1 inline-block">↓ 28% vs last event</span>
        </Card>

        <Card>
          <p className="text-slate-400 text-xs font-bold uppercase">AI Interventions</p>
          <p className="text-3xl font-extrabold text-brand-orange mt-2">07</p>
          <span className="text-xs font-bold text-slate-500 mt-1 inline-block">100% Executed</span>
        </Card>

        <Card>
          <p className="text-slate-400 text-xs font-bold uppercase">Peak Gate Density</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">84%</p>
          <span className="text-xs font-bold text-emerald-600 mt-1 inline-block">Prevented overrun</span>
        </Card>

        <Card>
          <p className="text-slate-400 text-xs font-bold uppercase">Prediction Confidence</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">94%</p>
          <span className="text-xs font-bold text-slate-500 mt-1 inline-block">Validation Score*</span>
        </Card>
      </div>

      {/* Hourly Trend Simulation Visual */}
      <Card>
        <h3 className="font-bold text-slate-800 text-lg mb-4">Hourly Crowd Density Timeline</h3>
        <div className="space-y-4">
          {[
            { time: '16:00', density: 25, label: 'Low' },
            { time: '18:00', density: 60, label: 'Moderate' },
            { time: '20:00', density: 88, label: 'Peak / Re-routing Triggered' },
            { time: '22:00', density: 45, label: 'Decreasing' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center space-x-4">
              <span className="w-12 text-xs font-bold text-slate-500">{item.time}</span>
              <div className="flex-1 bg-slate-100 h-4 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.density > 80 ? 'bg-red-500' : item.density > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${item.density}%` }}
                ></div>
              </div>
              <span className="w-32 text-xs font-bold text-slate-700">{item.density}% ({item.label})</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}