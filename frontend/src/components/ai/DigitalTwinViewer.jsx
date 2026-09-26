import React, { useEffect, useState } from 'react';
import { aiApi } from '../../services/api';
import SourceBadge from '../common/SourceBadge';
import { Cpu, RefreshCw } from 'lucide-react';

export default function DigitalTwinViewer() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTwinState = () => {
    setLoading(true);
    aiApi
      .getDigitalTwin()
      .then(({ data }) => setData(data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTwinState();
  }, []);

  const objects = data?.digitalTwin || [];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-brand-orange" />
          <h3 className="font-extrabold text-slate-900 text-lg">City & Venue Digital Twin</h3>
        </div>
        <div className="flex items-center gap-2">
          <SourceBadge source="SIMULATED" />
          <button
            onClick={fetchTwinState}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            title="Refresh Digital Twin State"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-500 mb-4">
        Synchronized live model tracking occupancy, flow rates (in/out visitors/min), and capacity limits.
      </p>

      {objects.length === 0 ? (
        <p className="text-sm text-slate-500">No digital twin nodes active.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {objects.map((obj) => (
            <div key={obj.objectId} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-slate-900 truncate">{obj.name}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                    obj.status === 'CONGESTED' ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}
                >
                  {obj.status}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Category: {obj.category}</span>
                <span className="font-bold text-slate-700">{obj.utilizationPercent}%</span>
              </div>
              <div className="text-[11px] text-slate-600 flex justify-between pt-1 border-t border-slate-200">
                <span>In: +{obj.incomingFlowRatePerMin}/m</span>
                <span>Out: -{obj.outgoingFlowRatePerMin}/m</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
