import React, { useState } from 'react';
import Card from '../common/Card';
import { Layers, Sliders, Play, ArrowDown, Activity } from 'lucide-react';

export default function AIDigitalTwin() {
  const [crowdCount, setCrowdCount] = useState(10000);
  const [rain, setRain] = useState(20);
  const [metroDelay, setMetroDelay] = useState(5);

  const calculateRisk = () => {
    return Math.min(100, Math.round((crowdCount / 15000) * 50 + (rain / 100) * 25 + (metroDelay / 20) * 25));
  };

  const riskScore = calculateRisk();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-glass flex justify-between items-center">
        <div>
          <span className="bg-orange-100 text-brand-orange font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            ADVANCED AI ARCHITECTURE
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-1">AI Event Digital Twin</h2>
          <p className="text-slate-400 text-xs mt-1">Simulate multi-variable environmental pressures and trace system propagation[cite: 1].</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Panel */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-brand-orange" />
              <span>Environmental Conditions</span>
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Attendee Density</span>
                  <span className="text-brand-orange">{crowdCount.toLocaleString()} visitors</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="20000"
                  step="500"
                  value={crowdCount}
                  onChange={(e) => setCrowdCount(Number(e.target.value))}
                  className="w-full accent-brand-orange"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Rain Probability</span>
                  <span className="text-brand-orange">{rain}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={rain}
                  onChange={(e) => setRain(Number(e.target.value))}
                  className="w-full accent-brand-orange"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Metro Line Delay</span>
                  <span className="text-brand-orange">{metroDelay} mins</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={metroDelay}
                  onChange={(e) => setMetroDelay(Number(e.target.value))}
                  className="w-full accent-brand-orange"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* System Propagation Pipeline */}
        <div className="lg:col-span-7">
          <Card className="h-full flex flex-col justify-between">
            <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center justify-between">
              <span>Digital Twin Propagation Cascade</span>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                riskScore > 75 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
              }`}>
                Risk Score: {riskScore}%
              </span>
            </h3>

            <div className="space-y-2 text-xs font-bold">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                <span>1. Condition Shift Input</span>
                <span className="text-brand-orange">Visitors: +{Math.round((crowdCount/10000)*100 - 100)}%</span>
              </div>
              <ArrowDown className="w-4 h-4 text-slate-400 mx-auto" />
              
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                <span>2. Gate Bottleneck Detection</span>
                <span className={riskScore > 70 ? 'text-red-600' : 'text-emerald-600'}>
                  {riskScore > 70 ? 'Gate 2 Over capacity (CRITICAL)' : 'Gate 2 Capacity Normal'}
                </span>
              </div>
              <ArrowDown className="w-4 h-4 text-slate-400 mx-auto" />

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                <span>3. Dynamic Rerouting Engine</span>
                <span className="text-brand-orange">
                  {riskScore > 70 ? 'Activated (Redirecting to Gate 4)' : 'Standby'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}