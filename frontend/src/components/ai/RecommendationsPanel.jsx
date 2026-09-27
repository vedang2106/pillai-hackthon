import React, { useEffect, useState } from 'react';
import { aiApi } from '../../services/api';
import SourceBadge from '../common/SourceBadge';
import { Lightbulb, UserCheck, ShieldCheck, Building } from 'lucide-react';

export default function RecommendationsPanel({ eventId, role = 'ORGANIZER', showRoleTabs = false }) {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState(role);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveTab(role);
  }, [role]);

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    aiApi
      .getRecommendations(eventId)
      .then(({ data }) => setData(data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-pulse">
        <div className="h-5 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-24 bg-slate-100 rounded-xl"></div>
      </div>
    );
  }

  const recsForRole = data?.[activeTab] || [];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-brand-orange" />
          <h3 className="font-extrabold text-slate-900 text-lg">AI Operational Recommendations</h3>
        </div>
        <SourceBadge source="AI PREDICTION" />
      </div>

      {/* Role Tabs - Only shown if explicitly enabled */}
      {showRoleTabs && (
        <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
          {[
            { key: 'ORGANIZER', label: 'Organizer', icon: Building },
            { key: 'GOVERNMENT', label: 'Government', icon: ShieldCheck },
            { key: 'VISITOR', label: 'Visitor', icon: UserCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                  activeTab === tab.key
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="space-y-3">
        {recsForRole.length === 0 ? (
          <p className="text-sm text-slate-500">No active recommendations for this role.</p>
        ) : (
          recsForRole.map((r, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-extrabold text-sm text-slate-900">{r.title}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold border bg-amber-100 text-amber-800 border-amber-300">
                  {r.severity} SEVERITY
                </span>
              </div>
              <p className="text-xs text-slate-600">{r.reason}</p>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 font-semibold space-y-1">
                <div><strong>Action:</strong> {r.action}</div>
                <div className="text-emerald-700"><strong>Expected Impact:</strong> {r.expectedImpact}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
