import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventsApi } from '../services/api';
import { ShieldCheck, Plus, CheckCircle, Clock, Users, Building, MapPin, AlertCircle, RefreshCw, Radio } from 'lucide-react';
import CityEventsMap from '../components/maps/CityEventsMap';
import MultiEventIntelligenceCard from '../components/ai/MultiEventIntelligenceCard';
import DigitalTwinViewer from '../components/ai/DigitalTwinViewer';
import LlmAssistantWidget from '../components/ai/LlmAssistantWidget';
import MlAnalyticsView from '../components/ai/MlAnalyticsView';
import CrowdRippleCard from '../components/ai/CrowdRippleCard';
import RecommendationsPanel from '../components/ai/RecommendationsPanel';
import WhatIfSimulatorCard from '../components/ai/WhatIfSimulatorCard';

export default function GovernmentDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({ metrics: {}, events: [], organizers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [selectedOrganizer, setSelectedOrganizer] = useState({});

  function fetchOverview() {
    setLoading(true);
    eventsApi
      .getGovernmentOverview()
      .then(({ data: res }) => setData(res))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load government dashboard'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchOverview();
  }, []);

  async function handleVerify(eventId) {
    setActionLoading((prev) => ({ ...prev, [eventId]: true }));
    try {
      await eventsApi.verify(eventId);
      fetchOverview();
    } catch (err) {
      alert(err.response?.data?.message || 'Verification failed');
    } finally {
      setActionLoading((prev) => ({ ...prev, [eventId]: false }));
    }
  }

  async function handleAssignOrganizer(eventId) {
    const organizerId = selectedOrganizer[eventId];
    if (!organizerId) {
      alert('Please select an organizer to assign');
      return;
    }
    setActionLoading((prev) => ({ ...prev, [eventId]: true }));
    try {
      await eventsApi.assignOrganizer(eventId, organizerId);
      fetchOverview();
    } catch (err) {
      alert(err.response?.data?.message || 'Organizer assignment failed');
    } finally {
      setActionLoading((prev) => ({ ...prev, [eventId]: false }));
    }
  }

  const { metrics, events = [], organizers = [] } = data;
  const sampleEventId = events[0]?._id;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Government Command Portal
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            City-Wide Event & Authority Intelligence
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Official government supervision, event verification, and organizer orchestration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOverview}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/events"
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-xs text-slate-700 shadow-sm transition-all"
          >
            City Events Directory
          </Link>
          <Link
            to="/government/events/new"
            className="px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Create Official Event
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total City Events</span>
            <Building className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{metrics.totalEvents ?? 0}</p>
          <span className="text-xs text-slate-500 mt-1 block">Registered in database</span>
        </div>

        <div className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-sm bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Verified Events</span>
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-700 mt-2">{metrics.governmentVerified ?? 0}</p>
          <span className="text-xs text-emerald-600 font-medium mt-1 block">✓ Government Verified</span>
        </div>

        <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-sm bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Pending Verification</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl font-extrabold text-amber-700 mt-2">{metrics.pendingApprovals ?? 0}</p>
          <span className="text-xs text-amber-600 font-medium mt-1 block">Requires authority review</span>
        </div>

        <div className="bg-white border border-rose-200 rounded-2xl p-5 shadow-sm bg-rose-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Live Events</span>
            <Radio className="w-5 h-5 text-rose-600 animate-pulse" />
          </div>
          <p className="text-3xl font-extrabold text-rose-700 mt-2">{metrics.liveEvents ?? 0}</p>
          <span className="text-xs text-rose-600 font-medium mt-1 block">Active crowd operations</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unassigned</span>
            <Users className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{metrics.unassignedEvents ?? 0}</p>
          <span className="text-xs text-slate-500 mt-1 block">No assigned organizer</span>
        </div>
      </div>

      {/* City-Wide Interactive Map of All Events */}
      <div className="mb-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-orange" />
              City Live Map — Active Events Locations
            </h2>
            <p className="text-xs text-slate-500">Interactive geographic visualization of all city events and coordinates</p>
          </div>
          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            {events.length} Events Plotted
          </span>
        </div>
        <CityEventsMap events={events} />
      </div>

      {/* Events Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Official City Event Directory</h2>
            <p className="text-xs text-slate-500">Government oversight and verified event authorization</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
            {events.length} Events Total
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading event data from MongoDB database...</div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No events registered in the database yet.{' '}
            <Link to="/government/events/new" className="text-brand-orange font-bold">
              Create the first official event
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Event & Category</th>
                  <th className="px-6 py-3">Verification Badge</th>
                  <th className="px-6 py-3">Venue & Coordinates</th>
                  <th className="px-6 py-3">Attendance</th>
                  <th className="px-6 py-3">Assigned Organizer</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((evt) => {
                  const isGovVerified = evt.governmentVerified || evt.verificationStatus === 'VERIFIED';
                  const organizerName = evt.assignedOrganizerId?.name || evt.organizerId?.name || 'Unassigned';

                  return (
                    <tr key={evt._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{evt.name}</div>
                        <div className="text-xs text-slate-500">
                          {evt.category || 'General'} · Source: <span className="font-semibold">{evt.source || 'ORGANIZER'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isGovVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold border border-emerald-300">
                            ✓ GOVERNMENT VERIFIED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300">
                            PENDING VERIFICATION
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                          {evt.venue?.name || 'Venue TBD'}
                        </div>
                        {evt.venue?.latitude != null && evt.venue?.longitude != null && (
                          <div className="text-[11px] text-slate-400">
                            {evt.venue.latitude.toFixed(4)}, {evt.venue.longitude.toFixed(4)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">
                          {evt.expectedAttendance?.toLocaleString() || 0}
                        </div>
                        <div className="text-xs text-slate-400">Expected</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-semibold text-slate-700">{organizerName}</div>
                        {!evt.assignedOrganizerId && (
                          <div className="mt-1.5 flex items-center gap-1">
                            <select
                              value={selectedOrganizer[evt._id] || ''}
                              onChange={(e) =>
                                setSelectedOrganizer((prev) => ({ ...prev, [evt._id]: e.target.value }))
                              }
                              className="text-xs rounded-lg border border-slate-200 px-2 py-1 bg-white"
                            >
                              <option value="">Assign Organizer...</option>
                              {organizers.map((o) => (
                                <option key={o._id} value={o._id}>
                                  {o.name}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleAssignOrganizer(evt._id)}
                              disabled={actionLoading[evt._id]}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
                            >
                              Assign
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            evt.status === 'LIVE'
                              ? 'bg-rose-100 text-rose-700 border border-rose-300'
                              : evt.status === 'APPROVED' || evt.status === 'SCHEDULED'
                              ? 'bg-blue-100 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {evt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/government/events/${evt._id}/review`)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Review & Add Govt Info
                          </button>
                          <button
                            onClick={() => navigate(`/events/${evt._id}`)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all"
                          >
                            Inspect
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* City-Wide AI Intelligence Suite */}
      <div className="mt-10 space-y-8">
        <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-brand-orange" />
          City-Wide Event Intelligence & Operational Platform
        </h2>

        <MultiEventIntelligenceCard />

        {/* Crowd Ripple Propagation & AI Operational Recommendations */}
        <div className="grid lg:grid-cols-2 gap-6">
          <CrowdRippleCard eventId={sampleEventId} />
          <RecommendationsPanel eventId={sampleEventId} role="GOVERNMENT" />
        </div>

      </div>
    </div>
  );
}

