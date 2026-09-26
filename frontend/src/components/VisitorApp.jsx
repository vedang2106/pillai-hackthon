import React from 'react';
import { Navigation, Compass, MapPin, CheckCircle } from 'lucide-react';

export default function VisitorApp({ data }) {
  const isCongested = data.zones[0].occupancy > 80;

  return (
    <div className="max-w-md mx-auto bg-white rounded-3xl border border-orange-100 shadow-shiny overflow-hidden">
      {/* Mobile Header */}
      <div className="bg-gradient-to-r from-brand-orange to-brand-orangeLight p-6 text-white text-center">
        <Compass className="w-10 h-10 mx-auto mb-2 animate-pulse" />
        <h2 className="text-xl font-bold">EventFlow Visitor Guide</h2>
        <p className="text-xs text-orange-100 mt-1">Less crowd. More experience![cite: 1]</p>
      </div>

      <div className="p-6 space-y-5">
        {/* Active Route Suggestion Card */}
        <div className={`p-5 rounded-2xl border ${
          isCongested ? 'bg-orange-50 border-orange-300' : 'bg-emerald-50 border-emerald-300'
        }`}>
          <div className="flex items-center space-x-3 mb-2">
            <Navigation className={`w-5 h-5 ${isCongested ? 'text-brand-orange' : 'text-emerald-600'}`} />
            <h3 className="font-bold text-slate-800">Smart Route Recommendation</h3>
          </div>
          <p className="text-sm font-semibold text-slate-700">
            {isCongested 
              ? '⚠️ Main Gate congested! Go to Gate 8 — 8 min walk (Less Crowd)' 
              : '✅ Main Gate is operating normally. Estimated wait time: 3 mins'}
          </p>
        </div>

        {/* Alternative Stay Finder */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1">
              <MapPin className="w-4 h-4 text-brand-orange" /> Nearby Stays
            </h4>
            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">85% booked</span>
          </div>
          <div className="space-y-2">
            <div className="p-2.5 bg-slate-50 rounded-xl flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-slate-800">Grand Stay Hotel</p>
                <p className="text-slate-400">Zone B • 1.2 km away</p>
              </div>
              <span className="font-bold text-brand-orange">₹3,500/night</span>
            </div>
          </div>
        </div>

        {/* Live Transit Updates */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="font-bold text-slate-800 text-sm mb-2">Transit Real-Time Update</h4>
          <div className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-xl">
            <span className="text-slate-600">Metro Line 1 (Central)</span>
            <span className="font-bold text-emerald-600">Next Train in 8 mins</span>
          </div>
        </div>
      </div>
    </div>
  );
}