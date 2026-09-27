import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useZones } from '../hooks/useZones';
import { zonesApi, eventsApi } from '../services/api';
import { useEffect } from 'react';
import OrganizerTicketTierManager from '../components/tickets/OrganizerTicketTierManager';
import OrganizerGateManager from '../components/dashboard/OrganizerGateManager';

const ZONE_TYPES = ['GATE', 'VENUE', 'STAGE', 'FOOD', 'PARKING', 'RAIL', 'BUS', 'METRO', 'HOTEL', 'ROAD', 'OTHER'];

export default function ManageZones() {
  const { eventId } = useParams();
  const { isOrganizer } = useAuth();
  const { zones, loading, error, refresh } = useZones(eventId);
  const [event, setEvent] = useState(null);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({
    name: '',
    latitude: '',
    longitude: '',
    capacity: '1000',
    type: 'GATE',
  });

  useEffect(() => {
    eventsApi.get(eventId).then(({ data }) => setEvent(data.event)).catch(() => setEvent(null));
  }, [eventId]);

  async function addZone(e) {
    e.preventDefault();
    setFormError('');

    const latVal = form.latitude ? parseFloat(form.latitude) : event?.venue?.latitude ?? 19.076;
    const lngVal = form.longitude ? parseFloat(form.longitude) : event?.venue?.longitude ?? 72.8777;

    try {
      await zonesApi.create({
        eventId,
        name: form.name,
        latitude: latVal,
        longitude: lngVal,
        capacity: parseInt(form.capacity, 10) || 1000,
        type: form.type,
      });
      setForm({ name: '', latitude: '', longitude: '', capacity: '1000', type: 'GATE' });
      refresh();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add zone');
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link to={`/events/${eventId}`} className="text-sm text-ef-primary font-medium">
        ← Event dashboard
      </Link>
      <h1 className="text-2xl font-bold mt-3">Zone management</h1>
      <p className="text-ef-muted text-sm">
        {event?.name ? `${event.name} — ` : ''}All zone metrics load from the API (simulation engine updates in Phase 9).
      </p>

      <form onSubmit={addZone} className="mt-6 grid md:grid-cols-5 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
        {formError && <p className="md:col-span-5 text-sm font-semibold text-red-600 bg-red-50 p-2 rounded">{formError}</p>}
        <input required placeholder="Zone name (e.g. Gate A)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white" />
        <input placeholder="Latitude (optional)" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white" />
        <input placeholder="Longitude (optional)" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white" />
        <input required type="number" min={1} placeholder="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white" />
        <div className="flex gap-2">
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="flex-1 border border-slate-200 rounded-lg px-2 py-2 text-sm bg-white font-medium">
            {ZONE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button type="submit" className="bg-brand-orange hover:bg-orange-600 text-white px-4 rounded-lg text-sm font-extrabold shadow-sm">
            Add Zone
          </button>
        </div>
      </form>

      {loading && <p className="mt-8 text-ef-muted text-sm">Loading zones…</p>}
      {error && <p className="mt-8 text-red-600 text-sm">{error}</p>}

      <ul className="mt-6 space-y-2">
        {zones.map((z) => (
          <li key={z._id} className="flex flex-wrap items-center justify-between gap-2 border border-ef-border rounded-xl px-4 py-3 bg-white">
            <div>
              <p className="font-semibold">{z.name}</p>
              <p className="text-xs text-ef-muted">
                {z.type} · {z.currentOccupancy}/{z.capacity} · {z.utilizationPercent}% · {z.dataSource}
              </p>
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-orange-50 text-ef-primary">{z.crowdLevel}</span>
          </li>
        ))}
        {!loading && zones.length === 0 && !error && (
          <li className="text-sm text-ef-muted border border-dashed border-ef-border rounded-xl p-6 text-center">
            No zones yet. Add zones above or run <code className="text-xs bg-ef-muted-bg px-1 rounded">npm run seed</code> in backend.
          </li>
        )}
      </ul>

      {/* Danger Zone & Gate Reroute Management */}
      <div className="mt-10">
        <OrganizerGateManager eventId={eventId} zones={zones} onRefresh={refresh} />
      </div>

      {/* Ticket Tier & Zone Entry Configuration Section */}
      <div className="mt-10">
        <OrganizerTicketTierManager eventId={eventId} zones={zones} />
      </div>
    </div>
  );
}
