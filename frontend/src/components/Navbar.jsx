import React from 'react';
import { ShieldAlert, User, Zap, RefreshCw } from 'lucide-react';

export default function Navbar({ currentMode, setMode, eventName, onChangeEvent }) {
  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50 px-6 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Brand Logo & Event Name */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onChangeEvent}>
            <div className="p-2 bg-gradient-to-tr from-brand-orange to-brand-orangeLight rounded-xl shadow-shiny text-white">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                EventFlow <span className="text-brand-orange">AI</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">Smarter Events • Happier Cities[cite: 1]</p>
            </div>
          </div>

          {eventName && (
            <button
              onClick={onChangeEvent}
              className="hidden sm:flex items-center space-x-2 bg-orange-50 text-brand-orange font-bold text-xs px-3 py-1.5 rounded-lg border border-orange-200 hover:bg-orange-100 transition-all"
            >
              <span>● {eventName}</span>
              <RefreshCw className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* View Switcher Toggle */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
          <button
            onClick={() => setMode('organizer')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              currentMode === 'organizer'
                ? 'bg-white text-brand-orange shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Organizer Portal[cite: 1]</span>
          </button>
          <button
            onClick={() => setMode('visitor')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              currentMode === 'visitor'
                ? 'bg-white text-brand-orange shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Visitor Guidance[cite: 1]</span>
          </button>
        </div>
      </div>
    </nav>
  );
}