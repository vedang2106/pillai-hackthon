import React from 'react';
import { Link } from 'react-router-dom';

export default function PillNav({ items, activeId, onChange, className = '' }) {
  return (
    <div className={`w-full flex items-center justify-center ${className}`}>
      <nav className="bg-slate-950/95 backdrop-blur-xl border border-slate-800/90 rounded-full p-1.5 shadow-2xl inline-flex items-center gap-1.5 max-w-full overflow-x-auto no-scrollbar">
        {items.map((item) => {
          const isActive = activeId === item.id;
          const Icon = item.icon;

          if (item.isBackLink && item.to) {
            return (
              <React.Fragment key={item.id}>
                <Link
                  to={item.to}
                  className="px-4 py-2 rounded-full text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all flex items-center gap-2 border border-slate-800/80 shrink-0"
                >
                  {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{item.label}</span>
                </Link>
                <div className="h-4 w-px bg-slate-800/80 shrink-0 mx-1" />
              </React.Fragment>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onChange && onChange(item.id)}
              className={`relative px-4 py-2 rounded-full text-xs font-extrabold transition-all duration-300 flex items-center gap-2 shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-brand-orange via-amber-500 to-brand-orange text-white shadow-lg shadow-orange-500/25 ring-1 ring-orange-400/30 scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/90'
              }`}
            >
              {Icon && (
                <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110 text-white' : item.iconColor || 'text-slate-400'}`} />
              )}
              <span>{item.label}</span>
              {item.badge && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-brand-orange/20 text-brand-orange'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
