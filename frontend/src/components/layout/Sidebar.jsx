import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  BrainCircuit, 
  FlaskConical, 
  Bus, 
  Building2, 
  Bell, 
  BarChart3,
  ShieldAlert,
  Gamepad2,
  Layers,
  LogOut
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onExitEvent }) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'crisis-room', label: 'AI Crisis Room', icon: ShieldAlert, badge: 'Hot' },
    { id: 'survival-game', label: 'Commander Challenge', icon: Gamepad2, badge: 'Game' },
    { id: 'digital-twin', label: 'Digital Twin', icon: Layers },
    { id: 'simulator', label: 'What-If Simulator', icon: FlaskConical, badge: 'Signature' },
    { id: 'live-map', label: 'Live Heatmap', icon: Map },
    { id: 'ai-insights', label: 'AI Intelligence', icon: BrainCircuit },
    { id: 'transport', label: 'Transport Hub', icon: Bus },
    { id: 'accommodation', label: 'Accommodation', icon: Building2 },
    { id: 'alerts', label: 'Alerts Center', icon: Bell },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-white border-r border-orange-100 min-h-[calc(100vh-73px)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-1">
        <p className="text-xs font-bold text-slate-400 px-3 uppercase tracking-wider mb-3">Orchestration</p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-brand-orange text-white shadow-shiny'
                  : 'text-slate-600 hover:bg-orange-50 hover:text-brand-orange'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-white text-brand-orange' : 'bg-orange-100 text-brand-orange'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-4 border-t border-slate-100">
        <button
          onClick={onExitEvent}
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Switch Event</span>
        </button>
      </div>
    </aside>
  );
}