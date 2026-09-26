import React from 'react';
import Card from '../common/Card';

export default function MetricCard({ title, value, subtitle, icon: Icon, badge, badgeType = "neutral" }) {
  const badgeStyles = {
    critical: "bg-red-100 text-red-600 border-red-200",
    warning: "bg-amber-100 text-amber-600 border-amber-200",
    success: "bg-emerald-100 text-emerald-600 border-emerald-200",
    neutral: "bg-slate-100 text-slate-600 border-slate-200"
  };

  return (
    <Card className="hover:border-brand-orangeLight/40 transition-all">
      <div className="flex justify-between items-start mb-3">
        <span className="text-slate-500 text-sm font-semibold">{title}</span>
        {Icon && (
          <div className="p-2.5 bg-orange-50 text-brand-orange rounded-xl">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="flex items-baseline space-x-3">
        <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
        {badge && (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${badgeStyles[badgeType]}`}>
            {badge}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-slate-400 mt-2 font-medium">{subtitle}</p>}
    </Card>
  );
}