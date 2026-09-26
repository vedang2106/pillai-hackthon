import React from 'react';
import Card from '../components/common/Card';
import { Building2, MapPin, Percent, DollarSign, CheckCircle2 } from 'lucide-react';

export default function AccommodationIntelligence({ data }) {
  const hotels = [
    { name: 'Grand Stay Hotel', zone: 'Zone A (Main Gate)', distance: '0.8 km', occupancy: 85, totalRooms: 200, price: '₹3,500/night', status: 'High' },
    { name: 'Pillai University Residency', zone: 'Zone B (Gate 8)', distance: '1.2 km', occupancy: 57, totalRooms: 120, price: '₹2,200/night', status: 'Moderate' },
    { name: 'City Center Inn', zone: 'Zone D (Food Court)', distance: '2.5 km', occupancy: 91, totalRooms: 150, price: '₹4,100/night', status: 'Critical' },
    { name: 'Metro Comfort Suites', zone: 'Zone C (Stage Grounds)', distance: '3.1 km', occupancy: 64, totalRooms: 180, price: '₹2,800/night', status: 'Moderate' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-glass flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-100 text-brand-orange font-bold text-xs mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Hospitality Orchestration</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Accommodation Capacity Intelligence</h2>
          <p className="text-slate-400 text-sm mt-1">Real-time hotel occupancy monitoring & event crowd distribution.</p>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center space-x-4">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Avg Hotel Load</p>
            <p className="text-xl font-extrabold text-brand-orange">74.2%</p>
          </div>
          <div className="h-8 w-[1px] bg-slate-200"></div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Rooms Available</p>
            <p className="text-xl font-extrabold text-slate-800">168</p>
          </div>
        </div>
      </div>

      {/* AI Hotel Recommendation Insight */}
      <div className="bg-gradient-to-r from-orange-500 to-brand-orange text-white p-5 rounded-2xl shadow-shiny flex items-center justify-between">
        <div>
          <h4 className="font-bold text-sm flex items-center space-x-2">
            <span>🤖 AI Accommodation Insight</span>
          </h4>
          <p className="text-orange-100 text-xs mt-1">
            Hotels within 1 km are reaching 85%+ capacity. Recommending visitors to reserve stays in Zone B (Pillai Residency) to balance zone congestion.
          </p>
        </div>
      </div>

      {/* Hotel Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hotels.map((hotel, idx) => (
          <Card key={idx} className="hover:border-brand-orangeLight/40 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{hotel.name}</h3>
                <p className="text-xs text-slate-400 flex items-center space-x-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-orange" />
                  <span>{hotel.zone} • {hotel.distance} away</span>
                </p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                hotel.status === 'Critical' ? 'bg-red-100 text-red-600 border-red-200' :
                hotel.status === 'High' ? 'bg-amber-100 text-amber-600 border-amber-200' :
                'bg-emerald-100 text-emerald-600 border-emerald-200'
              }`}>
                {hotel.occupancy}% Occupied
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Occupancy Progress</span>
                  <span>{hotel.occupancy}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${
                      hotel.occupancy > 85 ? 'bg-red-500' : hotel.occupancy > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${hotel.occupancy}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">{hotel.price}</span>
                <span className="text-slate-400">Total Capacity: {hotel.totalRooms} rooms</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}