import React from 'react';
import Card from '../components/common/Card';
import { Bus, Train, Car, AlertCircle } from 'lucide-react';

export default function TransportIntelligence({ data }) {
  const metroLoad = data?.metroLoad || 85;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-glass flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Transport Capacity Hub</h2>
          <p className="text-slate-400 text-sm mt-1">Real-time load analytics across metro, bus, and last-mile transit[cite: 1].</p>
        </div>
        <span className="px-3 py-1 bg-orange-100 text-brand-orange rounded-full text-xs font-bold">
          Live Transit Monitoring
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-slate-700 flex items-center space-x-2">
              <Train className="w-5 h-5 text-brand-orange" />
              <span>Central Metro Station</span>
            </span>
            <span className="text-xs font-extrabold text-red-500">{metroLoad}% Load</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div className="bg-red-500 h-full rounded-full" style={{ width: `${metroLoad}%` }}></div>
          </div>
          <p className="text-xs text-slate-400 mt-3">Next departure: 8 mins (600 seats capacity)[cite: 1]</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-slate-700 flex items-center space-x-2">
              <Bus className="w-5 h-5 text-brand-orange" />
              <span>Event Shuttle Fleet</span>
            </span>
            <span className="text-xs font-extrabold text-amber-500">62% Load</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: '62%' }}></div>
          </div>
          <p className="text-xs text-slate-400 mt-3">12 Shuttles actively running routes</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-slate-700 flex items-center space-x-2">
              <Car className="w-5 h-5 text-brand-orange" />
              <span>Taxi Pickup Zones</span>
            </span>
            <span className="text-xs font-extrabold text-emerald-500">High Availability</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '30%' }}></div>
          </div>
          <p className="text-xs text-slate-400 mt-3">Avg waiting time: 4 mins</p>
        </Card>
      </div>
    </div>
  );
}