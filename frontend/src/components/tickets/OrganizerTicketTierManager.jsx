import React, { useEffect, useState } from 'react';
import { ticketsApi } from '../../services/api';
import { Ticket, Plus, Trash2, Save, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

export default function OrganizerTicketTierManager({ eventId, zones = [] }) {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const [newTier, setNewTier] = useState({
    name: '',
    price: '499',
    totalQuantity: '1000',
    entryZoneId: '',
    entryZoneName: 'Gate 1 Main Entry',
  });

  const gateZones = zones.filter((z) => z.type === 'GATE') || zones;

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    ticketsApi
      .getTiers(eventId)
      .then(({ data }) => {
        setTiers(data.tiers || []);
        if (gateZones.length > 0) {
          setNewTier((prev) => ({
            ...prev,
            entryZoneId: gateZones[0]._id,
            entryZoneName: gateZones[0].name,
          }));
        }
      })
      .catch(() => setTiers([]))
      .finally(() => setLoading(false));
  }, [eventId]);

  async function handleAddTier(e) {
    e.preventDefault();
    if (!newTier.name.trim()) return;

    const selectedZone = zones.find((z) => z._id === newTier.entryZoneId);
    const updated = [
      ...tiers,
      {
        name: newTier.name.trim(),
        price: Number(newTier.price) || 0,
        totalQuantity: Number(newTier.totalQuantity) || 500,
        soldQuantity: 0,
        entryZoneId: newTier.entryZoneId || (selectedZone ? selectedZone._id : null),
        entryZoneName: selectedZone ? selectedZone.name : newTier.entryZoneName,
      },
    ];

    setTiers(updated);
    setNewTier({
      name: '',
      price: '499',
      totalQuantity: '1000',
      entryZoneId: gateZones[0]?._id || '',
      entryZoneName: gateZones[0]?.name || 'Gate 1 Main Entry',
    });

    // Auto-save to DB & trigger Socket.IO live update
    try {
      setSaving(true);
      const { data } = await ticketsApi.saveTiers(eventId, updated);
      setTiers(data.tiers);
      setMsg('✓ Ticket tier added & published live to visitors!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish ticket tier.');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveTier(index) {
    const updated = tiers.filter((_, i) => i !== index);
    setTiers(updated);
    try {
      setSaving(true);
      const { data } = await ticketsApi.saveTiers(eventId, updated);
      setTiers(data.tiers);
      setMsg('✓ Ticket tier removed & updated live!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update ticket tiers.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveTiers() {
    setSaving(true);
    setMsg('');
    setError('');
    try {
      const { data } = await ticketsApi.saveTiers(eventId, tiers);
      setTiers(data.tiers);
      setMsg('✓ Ticket Tiers and Zone Entry mappings saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save ticket tiers.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-center text-slate-500 text-sm py-4">Loading ticket configuration...</div>;
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-brand-orange" /> Ticket Tier & Zone Entry Configuration
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Define ticket tiers, price, slot capacity, and assign specific entry gates per ticket type.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveTiers}
          disabled={saving || tiers.length === 0}
          className="px-5 py-2.5 bg-brand-orange hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {msg}
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" /> {error}
        </div>
      )}

      {/* Add New Tier Form */}
      <form onSubmit={handleAddTier} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Add Custom Ticket Tier</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Tier Name</label>
            <input
              required
              value={newTier.name}
              onChange={(e) => setNewTier({ ...newTier, name: e.target.value })}
              placeholder="e.g. Normal Pass / VIP Access"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Price (₹)</label>
            <input
              required
              type="number"
              min={0}
              value={newTier.price}
              onChange={(e) => setNewTier({ ...newTier, price: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Total Slots / Capacity</label>
            <input
              required
              type="number"
              min={1}
              value={newTier.totalQuantity}
              onChange={(e) => setNewTier({ ...newTier, totalQuantity: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Assigned Entry Gate</label>
            <select
              value={newTier.entryZoneId}
              onChange={(e) => {
                const z = zones.find((item) => item._id === e.target.value);
                setNewTier({
                  ...newTier,
                  entryZoneId: e.target.value,
                  entryZoneName: z ? z.name : 'Gate 1 Main Entry',
                });
              }}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-slate-50 font-medium"
            >
              {zones.map((z) => (
                <option key={z._id} value={z._id}>
                  {z.name} ({z.type})
                </option>
              ))}
              {zones.length === 0 && <option value="">Gate 1 Main Entry</option>}
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Ticket Tier
          </button>
        </div>
      </form>

      {/* Configured Tiers List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Event Ticket Tiers ({tiers.length})</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tiers.map((tier, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-start justify-between">
              <div>
                <span className="text-xs font-extrabold text-slate-900">{tier.name}</span>
                <div className="text-xl font-black text-brand-orange mt-1">₹{tier.price}</div>
                <div className="text-xs text-slate-600 mt-2 space-y-1">
                  <div>Slots: <strong>{tier.totalQuantity} total</strong> ({tier.soldQuantity || 0} sold)</div>
                  <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Entry: {tier.entryZoneName}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveTier(idx)}
                className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                title="Remove Tier"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
