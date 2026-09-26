import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LocationPickerMap from '../components/maps/LocationPickerMap';
import { geocodeAddress } from '../utils/geocoder';
import { ArrowLeft, Calendar, MapPin, Users, Building, AlertCircle, Search, Loader2 } from 'lucide-react';

export default function CreateEvent() {
  const { isOrganizer } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeMsg, setGeocodeMsg] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'Concert',
    date: new Date().toISOString().slice(0, 10),
    startTime: '18:00',
    endTime: '23:00',
    venueName: '',
    venueAddress: '',
    latitude: 19.076,
    longitude: 72.8777,
    expectedAttendance: '10000',
    venueCapacity: '15000',
  });

  if (!isOrganizer) {
    return (
      <div className="max-w-lg mx-auto px-6 py-16 text-center">
        <p className="text-slate-500">Organizer role required to create events.</p>
        <Link to="/register" className="text-brand-orange font-bold mt-4 inline-block">
          Register as organizer
        </Link>
      </div>
    );
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleAutoGeocode(queryStr) {
    const query = queryStr || `${form.venueName} ${form.venueAddress}`.trim();
    if (!query) return;

    setGeocoding(true);
    setGeocodeMsg('');
    try {
      const res = await geocodeAddress(query);
      if (res) {
        setForm((f) => ({
          ...f,
          latitude: res.latitude,
          longitude: res.longitude,
        }));
        setGeocodeMsg(`✓ Map centered at: ${res.displayName.slice(0, 60)}...`);
      } else {
        setGeocodeMsg('Location not found. Click map to set pin manually.');
      }
    } catch (e) {
      setGeocodeMsg('Could not geocode address. Please set pin on map.');
    } finally {
      setGeocoding(false);
    }
  }

  function handleLocationChange({ latitude, longitude }) {
    setForm((f) => ({
      ...f,
      latitude: Number(latitude.toFixed(6)),
      longitude: Number(longitude.toFixed(6)),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await eventsApi.create({
        name: form.name,
        description: form.description,
        category: form.category,
        date: new Date(form.date).toISOString(),
        startTime: form.startTime,
        endTime: form.endTime,
        venue: {
          name: form.venueName,
          address: form.venueAddress,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
        },
        expectedAttendance: parseInt(form.expectedAttendance, 10),
        venueCapacity: parseInt(form.venueCapacity, 10),
        status: 'PENDING',
      });
      navigate(`/events/${data.event._id}/zones`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create event');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link to="/events" className="inline-flex items-center gap-1.5 text-sm text-slate-600 font-semibold hover:text-brand-orange mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to events
      </Link>
      <h1 className="text-3xl font-extrabold text-slate-900">Create Event (Organizer)</h1>
      <p className="text-slate-500 text-sm mt-1">Submit event details. Government authorities can verify & publish traffic advisories.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <div>
          <h2 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Building className="w-4 h-4 text-brand-orange" /> Event Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Event Name *</label>
              <input required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Summer Music Fest 2026" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Category</label>
              <select value={form.category} onChange={(e) => update('category', e.target.value)} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-white">
                <option value="Concert">Concert</option>
                <option value="Sports">Sports</option>
                <option value="Festival">Festival</option>
                <option value="Conference">Conference</option>
                <option value="Exhibition">Exhibition</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Event Description</label>
              <textarea rows={2} value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Provide event summary..." className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-orange" /> Schedule
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Date *</label>
              <input required type="date" value={form.date} onChange={(e) => update('date', e.target.value)} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Start Time *</label>
              <input required type="time" value={form.startTime} onChange={(e) => update('startTime', e.target.value)} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">End Time *</label>
              <input required type="time" value={form.endTime} onChange={(e) => update('endTime', e.target.value)} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-orange" /> Location Picker
          </h2>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Venue Name *</label>
                <input
                  required
                  value={form.venueName}
                  onChange={(e) => {
                    update('venueName', e.target.value);
                  }}
                  onBlur={() => handleAutoGeocode()}
                  placeholder="e.g. Wankhede Stadium, Byculla, BKC..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Venue Address</label>
                <div className="flex gap-2">
                  <input
                    value={form.venueAddress}
                    onChange={(e) => {
                      update('venueAddress', e.target.value);
                    }}
                    onBlur={() => handleAutoGeocode()}
                    placeholder="e.g. BKC, Mumbai"
                    className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleAutoGeocode()}
                    disabled={geocoding}
                    className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0"
                    title="Find address on map"
                  >
                    {geocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Locate
                  </button>
                </div>
              </div>
            </div>

            {geocodeMsg && (
              <p className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${geocodeMsg.startsWith('✓') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                {geocodeMsg}
              </p>
            )}

            <LocationPickerMap latitude={form.latitude} longitude={form.longitude} onChangeLocation={handleLocationChange} />
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-orange" /> Attendance & Capacity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Expected Attendance *</label>
              <input required type="number" min={1} value={form.expectedAttendance} onChange={(e) => update('expectedAttendance', e.target.value)} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Venue Max Capacity *</label>
              <input required type="number" min={1} value={form.venueCapacity} onChange={(e) => update('venueCapacity', e.target.value)} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={submitting} className="w-full bg-brand-orange hover:bg-orange-600 text-white font-extrabold py-3 rounded-xl shadow-md transition-all disabled:opacity-60">
          {submitting ? 'Creating Event...' : 'Create Event & Define Venue Zones'}
        </button>
      </form>
    </div>
  );
}
