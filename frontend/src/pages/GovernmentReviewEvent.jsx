import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventsApi } from '../services/api';
import { ShieldCheck, MapPin, Calendar, Clock, Users, AlertTriangle, Bus, ShieldAlert, ArrowLeft, CheckCircle } from 'lucide-react';

export default function GovernmentReviewEvent() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [form, setForm] = useState({
    officialTrafficRestrictions: '',
    officialRoadClosures: '',
    officialTransportInfo: '',
    emergencyInfo: '',
    status: 'APPROVED',
  });

  useEffect(() => {
    eventsApi
      .get(eventId)
      .then(({ data }) => {
        const evt = data.event;
        setEvent(evt);
        if (evt) {
          setForm({
            officialTrafficRestrictions: evt.officialTrafficRestrictions || '',
            officialRoadClosures: evt.officialRoadClosures || '',
            officialTransportInfo: evt.officialTransportInfo || '',
            emergencyInfo: evt.emergencyInfo || '',
            status: evt.status || 'APPROVED',
          });
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load event'))
      .finally(() => setLoading(false));
  }, [eventId]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      // First update government fields
      await eventsApi.update(eventId, {
        officialTrafficRestrictions: form.officialTrafficRestrictions,
        officialRoadClosures: form.officialRoadClosures,
        officialTransportInfo: form.officialTransportInfo,
        emergencyInfo: form.emergencyInfo,
        status: form.status,
      });

      // Next verify event
      await eventsApi.verify(eventId);

      setSuccessMsg('Government advisory updated & event verified successfully!');
      setTimeout(() => navigate('/government'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update government information');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto p-12 text-center text-slate-500">Loading event for government review...</div>;
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-slate-500">
        Event not found.{' '}
        <Link to="/government" className="text-brand-orange font-bold">
          Return to Government Dashboard
        </Link>
      </div>
    );
  }

  const organizerName = event.assignedOrganizerId?.name || event.organizerId?.name || 'Organizer';
  const organizerEmail = event.assignedOrganizerId?.email || event.organizerId?.email || '';

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <button
        onClick={() => navigate('/government')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand-orange mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Government Dashboard
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Government Review & Verification Portal
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Review Event & Add Government Directives
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Review organizer-submitted details and add official traffic restrictions, road closures, and emergency information.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600" /> {successMsg}
        </div>
      )}

      {/* Read-Only Organizer Submitted Info Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Organizer Submitted Event</span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">{event.name}</h2>
          </div>
          {event.governmentVerified || event.verificationStatus === 'VERIFIED' ? (
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full border border-emerald-300">
              ✓ GOVERNMENT VERIFIED
            </span>
          ) : (
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full border border-amber-300">
              PENDING VERIFICATION
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Organized By</span>
            <div className="font-bold text-slate-800 mt-1">{organizerName}</div>
            {organizerEmail && <div className="text-xs text-slate-500">{organizerEmail}</div>}
          </div>

          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Category & Date</span>
            <div className="font-semibold text-slate-800 mt-1 flex items-center gap-1">
              <Calendar className="w-4 h-4 text-brand-orange" />
              {new Date(event.date).toLocaleDateString()}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5" /> {event.startTime} - {event.endTime}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Attendance & Venue</span>
            <div className="font-semibold text-slate-800 mt-1 flex items-center gap-1">
              <Users className="w-4 h-4 text-brand-orange" />
              {event.expectedAttendance?.toLocaleString()} expected
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-brand-orange" />
              {event.venue?.name} {event.venue?.address ? `(${event.venue.address})` : ''}
            </div>
          </div>
        </div>

        {event.description && (
          <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-600">
            <span className="font-bold text-slate-700">Description:</span> {event.description}
          </div>
        )}
      </div>

      {/* Form: Add Official Government Directives & Info */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" /> Government Official Advisories & Restrictions
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Enter official traffic rules, road closures, public transport information, and emergency contacts. This information will be displayed to all users.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Official Traffic Restrictions
              </label>
              <textarea
                rows={2}
                value={form.officialTrafficRestrictions}
                onChange={(e) => update('officialTrafficRestrictions', e.target.value)}
                placeholder="e.g. Heavy commercial vehicles prohibited near venue corridor from 4:00 PM to 11:30 PM."
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-500" /> Official Road Closures
              </label>
              <textarea
                rows={2}
                value={form.officialRoadClosures}
                onChange={(e) => update('officialRoadClosures', e.target.value)}
                placeholder="e.g. Main Access Avenue closed for non-permitted vehicles. Pedestrian walkway active."
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Bus className="w-4 h-4 text-blue-500" /> Official Public Transport Information
              </label>
              <textarea
                rows={2}
                value={form.officialTransportInfo}
                onChange={(e) => update('officialTransportInfo', e.target.value)}
                placeholder="e.g. Special shuttle buses running every 8 mins from Central Station. Metro hours extended to 1:00 AM."
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Emergency & Control Room Setup
              </label>
              <textarea
                rows={2}
                value={form.emergencyInfo}
                onChange={(e) => update('emergencyInfo', e.target.value)}
                placeholder="e.g. Police Control Booth at Gate 1. Medical Assistance Desk & Ambulance at Gate 4. Helpline: 100 / 108."
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Official Event Approval Status
              </label>
              <select
                value={form.status}
                onChange={(e) => update('status', e.target.value)}
                className="w-full md:w-1/2 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-white"
              >
                <option value="APPROVED">APPROVED (Official & Active)</option>
                <option value="LIVE">LIVE (Event Currently Ongoing)</option>
                <option value="PENDING">PENDING (Under Review)</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
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
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-all disabled:opacity-60 flex items-center gap-2"
          >
            <ShieldCheck className="w-4.5 h-4.5" />
            {submitting ? 'Verifying & Saving...' : 'Approve & Publish Government Verification'}
          </button>
        </div>
      </form>
    </div>
  );
}
