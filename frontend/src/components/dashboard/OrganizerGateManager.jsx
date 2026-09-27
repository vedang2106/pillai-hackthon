import React, { useState } from 'react';
import { zonesApi } from '../../services/api';
import { AlertTriangle, ArrowRight, CheckCircle2, ShieldAlert, Sparkles, RefreshCw, Send } from 'lucide-react';

export default function OrganizerGateManager({ eventId, zones, onRefresh }) {
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [gateStatus, setGateStatus] = useState('DANGER');
  const [redirectGateName, setRedirectGateName] = useState('');
  const [redirectNotice, setRedirectNotice] = useState('');
  const [reason, setReason] = useState('High crowd density / Zone danger alert');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Get list of available gates
  const gateZones = (zones || []).filter((z) => z.type === 'GATE' || z.name.toLowerCase().includes('gate'));
  const allZones = zones || [];

  const selectedZone = allZones.find((z) => z._id === selectedZoneId) || allZones[0];

  // Initialize form when selected zone changes
  const handleSelectZone = (zId) => {
    setSelectedZoneId(zId);
    const z = allZones.find((item) => item._id === zId);
    if (z) {
      setGateStatus(z.gateStatus || (z.crowdLevel === 'CRITICAL' ? 'DANGER' : 'OPEN'));
      setRedirectGateName(z.redirectGateName || '');
      setRedirectNotice(z.redirectNotice || '');
      setReason(z.gateChangeReason || 'High crowd density / Zone danger alert');
    }
  };

  // Preset 1-click danger action
  const handleQuickDangerReroute = async (z, targetGateName) => {
    setSubmitting(true);
    setSuccessMsg('');
    try {
      const notice = `⚠️ ATTENTION: ${z.name} is in DANGER/CLOSED due to crowd surge. Please proceed to ${targetGateName} immediately.`;
      await zonesApi.update(z._id, {
        gateStatus: 'DANGER',
        crowdLevel: 'CRITICAL',
        riskLevel: 'CRITICAL',
        redirectGateName: targetGateName,
        redirectNotice: notice,
        gateChangeReason: 'Organizer Emergency Reroute Directive',
      });
      setSuccessMsg(`Successfully marked ${z.name} as DANGER & broadcasted reroute to ${targetGateName}!`);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update gate');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearReroute = async (z) => {
    setSubmitting(true);
    setSuccessMsg('');
    try {
      await zonesApi.update(z._id, {
        gateStatus: 'OPEN',
        crowdLevel: 'LOW',
        riskLevel: 'LOW',
        redirectGateName: '',
        redirectNotice: '',
        gateChangeReason: 'Gate normalized by organizer',
      });
      setSuccessMsg(`Reset ${z.name} to Normal OPEN status.`);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to clear gate reroute');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedZone) return;
    setSubmitting(true);
    setSuccessMsg('');

    try {
      await zonesApi.update(selectedZone._id, {
        gateStatus,
        redirectGateName,
        redirectNotice,
        gateChangeReason: reason,
        ...(gateStatus === 'DANGER' ? { crowdLevel: 'CRITICAL', riskLevel: 'CRITICAL' } : {}),
      });
      setSuccessMsg(`Broadcasted Gate status change for ${selectedZone.name} to all Visitors!`);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save gate status');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-600" />
            Danger Zone & Gate Reroute Control (Organizer Side)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            If a zone/gate becomes dangerous or congested, change entry gates here to instantly update visitor navigation apps.
          </p>
        </div>
        <span className="text-[10px] font-extrabold uppercase px-3 py-1 bg-rose-100 text-rose-800 rounded-full border border-rose-200 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-rose-600" /> Live WebSocket Sync
        </span>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-xs font-bold text-emerald-900 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Live Zone Danger Overview Cards */}
      <div className="space-y-3">
        <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
          Active Venue Gates Telemetry
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {allZones.map((z) => {
            const isDanger = z.gateStatus === 'DANGER' || z.crowdLevel === 'CRITICAL' || z.utilizationPercent >= 80;
            const hasReroute = !!z.redirectGateName;
            const targetGateName = (gateZones.find((g) => g._id !== z._id)?.name) || 'Gate B (South)';

            return (
              <div
                key={z._id}
                className={`p-4 rounded-2xl border transition-all ${
                  isDanger
                    ? 'bg-rose-50/90 border-rose-300 shadow-sm'
                    : hasReroute
                    ? 'bg-amber-50 border-amber-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="font-extrabold text-sm text-slate-900">{z.name}</h5>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{z.type}</span>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isDanger
                        ? 'bg-rose-600 text-white animate-pulse'
                        : z.crowdLevel === 'HIGH'
                        ? 'bg-amber-500 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {z.gateStatus || z.crowdLevel}
                  </span>
                </div>

                <div className="text-xs space-y-1 text-slate-600 mb-3">
                  <p>Occupancy: <strong>{z.currentOccupancy || 0} / {z.capacity || 1000}</strong> ({z.utilizationPercent || 0}%)</p>
                  {hasReroute && (
                    <p className="text-amber-900 font-extrabold flex items-center gap-1">
                      <ArrowRight className="w-3.5 h-3.5 text-amber-600" /> Redirecting to: {z.redirectGateName}
                    </p>
                  )}
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  {isDanger || hasReroute ? (
                    <button
                      onClick={() => handleClearReroute(z)}
                      disabled={submitting}
                      className="w-full py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Reset to Normal
                    </button>
                  ) : (
                    <button
                      onClick={() => handleQuickDangerReroute(z, targetGateName)}
                      disabled={submitting}
                      className="w-full py-1.5 px-2 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> Mark Danger & Reroute
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Gate Reroute Form */}
      <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
        <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-brand-orange" />
          Custom Gate Status & Reroute Broadcast Configurator
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Select Target Gate to Modify */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Affected Gate/Zone</label>
            <select
              value={selectedZoneId || selectedZone?._id || ''}
              onChange={(e) => handleSelectZone(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-brand-orange"
            >
              {allZones.map((z) => (
                <option key={z._id} value={z._id}>
                  {z.name} ({z.crowdLevel} - {z.utilizationPercent}%)
                </option>
              ))}
            </select>
          </div>

          {/* Gate Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Set Gate Status</label>
            <select
              value={gateStatus}
              onChange={(e) => setGateStatus(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-extrabold focus:outline-none focus:border-brand-orange text-slate-800"
            >
              <option value="OPEN">🟢 OPEN (Operating Normally)</option>
              <option value="CONGESTED">🟡 CONGESTED (Heavy Traffic)</option>
              <option value="DANGER">🚨 DANGER (Extreme Congestion)</option>
              <option value="CLOSED">⛔ CLOSED (No Entry)</option>
              <option value="REROUTED">🔀 REROUTED (Visitors Redirected)</option>
            </select>
          </div>

          {/* New Redirect Target Gate */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Redirect Visitors To Gate</label>
            <input
              type="text"
              placeholder="e.g. Gate 8 / East Entrance"
              value={redirectGateName}
              onChange={(e) => setRedirectGateName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-orange"
            />
          </div>
        </div>

        {/* Public Visitor Broadcast Notice */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Public Announcement Notice for Visitor App</label>
          <textarea
            rows={2}
            placeholder="e.g. '⚠️ Gate A is overcrowded. Security has opened Gate 8 for faster entry. 6 min walk.'"
            value={redirectNotice}
            onChange={(e) => setRedirectNotice(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-brand-orange"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto px-6 py-2.5 bg-brand-orange hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {submitting ? 'Broadcasting Gate Change...' : 'Save & Broadcast Gate Reroute to Visitors'}
        </button>
      </form>
    </div>
  );
}
