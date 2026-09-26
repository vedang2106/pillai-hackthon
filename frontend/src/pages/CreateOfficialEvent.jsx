import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsApi, authApi } from '../services/api';
import LocationPickerMap from '../components/maps/LocationPickerMap';
import { geocodeAddress } from '../utils/geocoder';
import { ShieldCheck, MapPin, Calendar, Clock, Users, Building, AlertTriangle, ArrowLeft, Search, Loader2 } from 'lucide-react';

export default function CreateOfficialEvent() {
  const navigate = useNavigate();
  const [organizers, setOrganizers] = useState([]);
  const [loadingOrganizers, setLoadingOrganizers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeMsg, setGeocodeMsg] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'Concert',
    date: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    startTime: '18:00',
    endTime: '23:00',
    venueName: '',
    venueAddress: '',
    latitude: 19.0760,
    longitude: 72.8777,
    expectedAttendance: 10000,
    venueCapacity: 15000,
    assignedOrganizerId: '',
    officialTrafficRestrictions: '',
    officialRoadClosures: '',
    officialTransportInfo: '',
    emergencyInfo: '',
    status: 'APPROVED',
  });

  useEffect(() => {
    authApi
      .getOrganizers()
      .then(({ data }) => setOrganizers(data.organizers || []))
      .catch(() => setOrganizers([]))
      .finally(() => setLoadingOrganizers(false));
  }, []);

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
      const payload = {
        name: form.name,
        description: form.description,
        category: form.category,
        date: form.date,
        endDate: form.endDate,
        startTime: form.startTime,
        endTime: form.endTime,
        venue: {
          name: form.venueName,
          address: form.venueAddress,
          latitude: form.latitude,
          longitude: form.longitude,
        },
        expectedAttendance: Number(form.expectedAttendance),
        venueCapacity: Number(form.venueCapacity) || Number(form.expectedAttendance),
        assignedOrganizerId: form.assignedOrganizerId || null,
        officialTrafficRestrictions: form.officialTrafficRestrictions,
        officialRoadClosures: form.officialRoadClosures,
        officialTransportInfo: form.officialTransportInfo,
        emergencyInfo: form.emergencyInfo,
        status: form.status,
      };

      await eventsApi.createOfficial(payload);
      navigate('/government');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to create official event');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <button
        onClick={() => navigate('/government')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand-orange mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Government Dashboard
      </button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" /> Government Verified Authority
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Official Event</h1>
          <p className="text-slate-500 text-sm mt-1">
            Publish an official government-verified event and set city operational parameters.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Section 1: Basic Event Information */}
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Building className="w-4 h-4 text-brand-orange" /> Basic Event Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Event Name *
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="e.g. City Cultural Festival 2026"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                <option value="Concert">Music Concert</option>
                <option value="Sports">Sports Match</option>
                <option value="Festival">Cultural Festival</option>
                <option value="Conference">Public Conference</option>
                <option value="Public Assembly">Public Assembly</option>
                <option value="Exhibition">Exhibition & Trade</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Event Description
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder="Provide details about the official event..."
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Date & Time */}
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-orange" /> Date & Schedule
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => update('date', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => update('endDate', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Start Time *</label>
              <input
                type="time"
                required
                value={form.startTime}
                onChange={(e) => update('startTime', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">End Time *</label>
              <input
                type="time"
                required
                value={form.endTime}
                onChange={(e) => update('endTime', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Map Location & Venue Selection */}
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-orange" /> Map-Based Venue Location
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Venue Name *</label>
                <input
                  required
                  value={form.venueName}
                  onChange={(e) => update('venueName', e.target.value)}
                  onBlur={() => handleAutoGeocode()}
                  placeholder="e.g. Wankhede Stadium / Byculla / BKC"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Venue Address</label>
                <div className="flex gap-2">
                  <input
                    value={form.venueAddress}
                    onChange={(e) => update('venueAddress', e.target.value)}
                    onBlur={() => handleAutoGeocode()}
                    placeholder="e.g. Churchgate, Mumbai, Maharashtra"
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

            {/* Interactive Mapbox Map */}
            <LocationPickerMap
              latitude={form.latitude}
              longitude={form.longitude}
              onChangeLocation={handleLocationChange}
            />

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div><span className="font-semibold text-slate-600">Captured Latitude:</span> {form.latitude}</div>
              <div><span className="font-semibold text-slate-600">Captured Longitude:</span> {form.longitude}</div>
            </div>
          </div>
        </div>

        {/* Section 4: Attendance & Assigned Organizer */}
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-orange" /> Attendance & Organizer Connection
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Expected Attendance *</label>
              <input
                type="number"
                required
                min={1}
                value={form.expectedAttendance}
                onChange={(e) => update('expectedAttendance', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Max Venue Capacity</label>
              <input
                type="number"
                min={1}
                value={form.venueCapacity}
                onChange={(e) => update('venueCapacity', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Assign Event Organizer</label>
              <select
                value={form.assignedOrganizerId}
                onChange={(e) => update('assignedOrganizerId', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-white"
                disabled={loadingOrganizers}
              >
                <option value="">-- Select Registered Organizer --</option>
                {organizers.map((org) => (
                  <option key={org._id || org.id} value={org._id || org.id}>
                    {org.name} ({org.email})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 5: Official Traffic & Emergency Info */}
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-brand-orange" /> Traffic Restrictions & Emergency Setup
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Traffic Restrictions</label>
              <input
                value={form.officialTrafficRestrictions}
                onChange={(e) => update('officialTrafficRestrictions', e.target.value)}
                placeholder="e.g. Heavy vehicles prohibited near venue from 4 PM"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Road Closures</label>
              <input
                value={form.officialRoadClosures}
                onChange={(e) => update('officialRoadClosures', e.target.value)}
                placeholder="e.g. Road A and Promenade closed for pedestrians"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Official Transport Info</label>
              <input
                value={form.officialTransportInfo}
                onChange={(e) => update('officialTransportInfo', e.target.value)}
                placeholder="e.g. Extra shuttle buses operating from Metro Station B"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Emergency / Control Info</label>
              <input
                value={form.emergencyInfo}
                onChange={(e) => update('emergencyInfo', e.target.value)}
                placeholder="e.g. Medical desk at Gate 2, Police Control Room 100"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/government')}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-brand-orange hover:bg-orange-600 text-white font-bold text-sm shadow-md transition-all disabled:opacity-60 flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            {submitting ? 'Publishing Event...' : 'Publish Official Event'}
          </button>
        </div>
      </form>
    </div>
  );
}
