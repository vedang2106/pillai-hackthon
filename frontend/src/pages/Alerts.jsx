import React from 'react';
import Card from '../components/common/Card';
import { Bell, AlertTriangle, CheckCircle, Info, Clock } from 'lucide-react';

export default function Alerts() {
  const alertsList = [
    {
      id: 1,
      type: 'critical',
      title: 'Gate 3 Congestion Risk Predicted',
      desc: 'Occupancy reaching 82%. AI recommends redirecting visitors to Gate 1.',
      time: '2 mins ago',
      status: 'Active'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Central Metro Station Load Exceeding 85%',
      desc: 'Increased wait times anticipated. Extra shuttles dispatched[cite: 1].',
      time: '12 mins ago',
      status: 'In Progress'
    },
    {
      id: 3,
      type: 'success',
      title: 'North Zone Gate Flow Resolved',
      desc: 'Rerouting successfully reduced Gate A congestion back to 35%[cite: 1].',
      time: '25 mins ago',
      status: 'Resolved'
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-glass flex justify-between items-center">
        <div className="flex items-center space-x-3 text-brand-orange">
          <Bell className="w-6 h-6" />
          <h2 className="text-2xl font-bold text-slate-900">Incident & Alerts Center</h2>
        </div>
        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
          1 Active Critical Alert
        </span>
      </div>

      <div className="space-y-4">
        {alertsList.map((alert) => (
          <Card key={alert.id} className={`border-l-4 ${
            alert.type === 'critical' ? 'border-l-red-500' :
            alert.type === 'warning' ? 'border-l-amber-500' : 'border-l-emerald-500'
          }`}>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-slate-900">{alert.title}</h3>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    alert.type === 'critical' ? 'bg-red-100 text-red-600' :
                    alert.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {alert.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600 font-medium">{alert.desc}</p>
              </div>
              <span className="text-xs text-slate-400 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{alert.time}</span>
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}