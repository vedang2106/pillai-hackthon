import React from 'react';
import LiveMap from './LiveMap';
import { AlertTriangle, Users, Train, Hotel, RefreshCw } from 'lucide-react';

export default function OrganizerDashboard({ data, triggerSurge, resetDemo }) {
  return (
    <div className="space-y-6">
      {/* Action Banner / Simulation Bar */}
      <div className="bg-gradient-to-r from-orange-500 via-brand-orange to-brand-orangeLight p-6 rounded-2xl text-white shadow-shiny flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Organizer Analytics Engine</h2>
          <p className="text-orange-100 text-sm mt-1">Real-time zone density and AI risk predictions.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={triggerSurge}
            className="bg-white text-brand-orange hover:bg-orange-50 font-bold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
          >
            ⚡ Simulate Zone Surge (Demo)
          </button>
          <button
            onClick={resetDemo}
            className="bg-orange-600 hover:bg-orange-700 text-white p-2.5 rounded-xl transition-all"
            title="Reset Simulation"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-glass">
          <div className="flex items-center space-x-3 text-brand-orange mb-2">
            <Users className="w-5 h-5" />
            <h3 className="font-semibold text-slate-700">Main Venue Density</h3>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{data.zones[0].occupancy}%</p>
          <span className={`text-xs font-bold px-2 py-1 rounded-full mt-2 inline-block ${
            data.zones[0].occupancy > 80 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
          }`}>
            {data.zones[0].status}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-glass">
          <div className="flex items-center space-x-3 text-brand-orange mb-2">
            <Train className="w-5 h-5" />
            <h3 className="font-semibold text-slate-700">Metro Transit Load</h3>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{data.metroLoad}%</p>
          <p className="text-xs text-slate-400 mt-2">Capacity limit: 3,000 riders/hr</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-glass">
          <div className="flex items-center space-x-3 text-brand-orange mb-2">
            <Hotel className="w-5 h-5" />
            <h3 className="font-semibold text-slate-700">Zone Hotel Occupancy</h3>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{data.hotelOccupancy}%</p>
          <p className="text-xs text-slate-400 mt-2">Avg price: ₹3,500/night[cite: 1]</p>
        </div>
      </div>

      {/* AI Risk Alert & Live Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-orange-100 shadow-glass">
          <h3 className="font-bold text-slate-800 text-lg mb-4">Live Zone Heatmap</h3>
          <LiveMap zones={data.zones} />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-glass flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-brand-orange mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-slate-800 text-lg">AI Risk Prediction</h3>
            </div>
            
            <div className={`p-4 rounded-xl border ${
              data.zones[0].occupancy > 80 
                ? 'bg-red-50 border-red-200 text-red-800' 
                : 'bg-orange-50 border-orange-200 text-orange-800'
            }`}>
              <p className="text-sm font-semibold">{data.aiAlert.message}</p>
              <p className="text-xs mt-2 text-slate-500">Triggered: Just now</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recommended Action</h4>
            <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
              {data.aiAlert.recommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}