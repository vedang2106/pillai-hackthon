import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, ArrowRight, Plus, AlertCircle, ShieldCheck, AlertTriangle, Bus } from 'lucide-react';
import { eventsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CityEventsMap from '../components/maps/CityEventsMap';

export default function EventSelection() {
  const { isOrganizer } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    eventsApi
      .list()
      .then(({ data }) => setEvents(data.events ?? []))
      .catch((err) => setError(err.response?.data?.message || 'Could not load events. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">City Live Map & Events Directory</h2>
            <p className="text-slate-500 text-sm mt-1">Live events and official government traffic & safety advisories across the city.</p>
          </div>
          {isOrganizer && (
            <Link
              to="/events/new"
              className="inline-flex items-center gap-2 bg-brand-orange text-white font-extrabold px-4 py-2.5 rounded-xl hover:bg-orange-600 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Create Event
            </Link>
          )}
        </div>

        {/* City Live Map plotting all events */}
        {!loading && events.length > 0 && (
          <div className="mb-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-orange" /> City Live Events Overview Map
            </h3>
            <CityEventsMap events={events} />
          </div>
        )}

        {loading && <p className="text-slate-500 text-sm">Loading city events…</p>}
        {error && (
          <div className="flex items-start gap-2 text-red-700 bg-red-50 border border-red-200 rounded-xl p-4 text-sm mb-6">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {events.map((event) => {
            const isGovVerified = event.governmentVerified || event.verificationStatus === 'VERIFIED';
            const organizerName = event.assignedOrganizerId?.name || event.organizerId?.name || 'Event Organizer';

            return (
              <Link
                key={event._id}
                to={`/events/${event._id}`}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-brand-orange hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold uppercase tracking-wide text-brand-orange">{event.status}</span>
                    <span className="text-xs text-slate-500 font-medium">{new Date(event.date).toLocaleDateString()}</span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-orange transition-colors">
                    {event.name}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">Organized by <span className="font-semibold text-slate-700">{organizerName}</span></div>

                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-brand-orange shrink-0" />
                      {event.venue?.name}
                      {event.venue?.address ? ` · ${event.venue.address}` : ''}
                    </p>
                    <p className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-brand-orange shrink-0" />
                      {event.expectedAttendance?.toLocaleString()} expected · capacity {event.venueCapacity?.toLocaleString()}
                    </p>
                  </div>

                  {/* Verification & Government Information */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    {isGovVerified ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold border border-emerald-300">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> ✓ GOVERNMENT VERIFIED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-300">
                        PENDING VERIFICATION
                      </span>
                    )}

                    {event.officialTrafficRestrictions && (
                      <div className="text-xs text-amber-800 bg-amber-50/70 p-2 rounded-lg border border-amber-200 flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div><strong className="font-bold">Traffic Restriction:</strong> {event.officialTrafficRestrictions}</div>
                      </div>
                    )}

                    {event.officialTransportInfo && (
                      <div className="text-xs text-blue-800 bg-blue-50/70 p-2 rounded-lg border border-blue-200 flex items-start gap-1.5">
                        <Bus className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <div><strong className="font-bold">Govt Transport:</strong> {event.officialTransportInfo}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                  <span className="inline-flex items-center gap-1 text-sm font-extrabold text-brand-orange">
                    Open Live Event Portal <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {!loading && !error && events.length === 0 && (
          <div className="text-center border border-dashed border-slate-300 rounded-2xl p-12 bg-white">
            <p className="text-slate-500">No events registered yet.</p>
            {isOrganizer && (
              <Link to="/events/new" className="text-brand-orange font-bold mt-2 inline-block">
                Create your first event
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
