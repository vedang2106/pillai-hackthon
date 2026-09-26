import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import LiveCrowdMap from '../components/maps/LiveCrowdMap';
import SourceBadge from '../components/common/SourceBadge';
import { useZones } from '../hooks/useZones';
import { eventsApi, healthApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, AlertTriangle, ShieldAlert, Bus, PhoneCall, Building, Edit3 } from 'lucide-react';
import LlmAssistantWidget from '../components/ai/LlmAssistantWidget';
import VisitorSmartNavigator from '../components/ai/VisitorSmartNavigator';
import VisitorTicketPurchase from '../components/tickets/VisitorTicketPurchase';
import GateGuardScannerWidget from '../components/tickets/GateGuardScannerWidget';

function aggregateKpis(zones, event) {
  const totalCrowd = zones.reduce((s, z) => s + (z.currentOccupancy || 0), 0);
  const avgUtil =
    zones.length > 0
      ? Math.round(zones.reduce((s, z) => s + (z.utilizationPercent || 0), 0) / zones.length)
      : 0;
  const highRisk = zones.filter((z) => z.riskLevel === 'HIGH' || z.riskLevel === 'CRITICAL').length;
  return {
    totalCrowd,
    avgUtil,
    highRisk,
    zoneCount: zones.length,
    expected: event?.expectedAttendance ?? null,
  };
}

export default function OrganizerOverview() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { isGovernment } = useAuth();
  const { zones, loading, error } = useZones(eventId);
  const [event, setEvent] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [apiHealth, setApiHealth] = useState(null);

  useEffect(() => {
    eventsApi.get(eventId).then(({ data }) => setEvent(data.event)).catch(() => setEvent(null));
    healthApi.check().then(({ data }) => setApiHealth(data)).catch(() => setApiHealth({ ok: false }));
  }, [eventId]);

  const kpis = useMemo(() => aggregateKpis(zones, event), [zones, event]);
  const isGovVerified = event?.governmentVerified || event?.verificationStatus === 'VERIFIED';
  const organizerName = event?.assignedOrganizerId?.name || event?.organizerId?.name || 'Organizer';

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Pending Verification Banner for Government */}
      {!isGovVerified && (
        <div className="mb-6 bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-extrabold text-amber-900 text-sm">Status: PENDING VERIFICATION</span>
              <p className="text-xs text-amber-700">This event has been submitted by the organizer and is awaiting official government verification & traffic directives.</p>
            </div>
          </div>
          {isGovernment && (
            <button
              onClick={() => navigate(`/government/events/${eventId}/review`)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-all shrink-0 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" /> Review & Verify Event
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/events" className="text-sm text-brand-orange font-bold hover:underline">
            ← All events
          </Link>

          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-3xl font-extrabold text-slate-900">{event?.name ?? 'Event Dashboard'}</h1>
            {isGovVerified ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full border border-emerald-300 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> ✓ GOVERNMENT VERIFIED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full border border-amber-300">
                PENDING VERIFICATION
              </span>
            )}
          </div>

          <p className="text-slate-500 text-sm mt-1 flex items-center gap-3 flex-wrap">
            <span>Category: <strong className="text-slate-700">{event?.category || 'General'}</strong></span>
            <span>·</span>
            <span>Organized by: <strong className="text-slate-700">{organizerName}</strong></span>
            <span>·</span>
            <SourceBadge source="SIMULATED" />
            {apiHealth && (
              <span className="text-xs text-slate-400">API · MongoDB {apiHealth.mongodb}</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isGovernment && (
            <button
              onClick={() => navigate(`/government/events/${eventId}/review`)}
              className="border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3.5 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Edit3 className="w-4 h-4 text-emerald-600" /> Edit Govt Advisories
            </button>
          )}
          <Link
            to={`/events/${eventId}/zones`}
            className="border border-slate-200 hover:border-brand-orange text-xs font-extrabold px-4 py-2.5 rounded-xl bg-white shadow-sm transition-all"
          >
            Manage Venue Zones
          </Link>
        </div>
      </div>

      {/* Official Government Directives / Advisory Banner */}
      {(event?.officialTrafficRestrictions || event?.officialRoadClosures || event?.officialTransportInfo || event?.emergencyInfo) && (
        <div className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-extrabold text-slate-900">Official Government Advisories & Public Directives</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {event?.officialTrafficRestrictions && (
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5">
                <div className="font-extrabold text-amber-900 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Traffic Restrictions
                </div>
                <div className="text-slate-700 leading-relaxed">{event.officialTrafficRestrictions}</div>
              </div>
            )}

            {event?.officialRoadClosures && (
              <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-3.5">
                <div className="font-extrabold text-rose-900 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Road Closures
                </div>
                <div className="text-slate-700 leading-relaxed">{event.officialRoadClosures}</div>
              </div>
            )}

            {event?.officialTransportInfo && (
              <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5">
                <div className="font-extrabold text-blue-900 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                  <Bus className="w-3.5 h-3.5 text-blue-600" /> Public Transport Info
                </div>
                <div className="text-slate-700 leading-relaxed">{event.officialTransportInfo}</div>
              </div>
            )}

            {event?.emergencyInfo && (
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5">
                <div className="font-extrabold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-600" /> Emergency & Control
                </div>
                <div className="text-slate-700 leading-relaxed">{event.emergencyInfo}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {[
          { label: 'Current crowd (all zones)', value: kpis.totalCrowd.toLocaleString() },
          { label: 'Avg utilization', value: `${kpis.avgUtil}%` },
          { label: 'High risk zones', value: kpis.highRisk },
          { label: 'Active zones', value: kpis.zoneCount },
        ].map((card) => (
          <div key={card.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{card.label}</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{loading ? '—' : card.value}</p>
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {/* Visitor Ticket Purchase & QR Code Generator */}
      <div className="mt-8">
        <VisitorTicketPurchase event={event} />
      </div>

      {/* Security Gate Guard QR Scanner */}
      <div className="mt-8">
        <GateGuardScannerWidget eventId={eventId} />
      </div>

      {/* Visitor Smart Navigator & Turn-by-Turn Route Tracker (ChromaDB Vector Advisory Compliance) */}
      <div className="mt-8">
        <VisitorSmartNavigator event={event} />
      </div>

      {/* Map & Zone Details */}
      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <h2 className="font-bold text-lg mb-3 text-slate-900">Live crowd map</h2>
          <LiveCrowdMap
            zones={zones}
            venue={event?.venue}
            selectedZoneId={selectedZone?._id}
            onSelectZone={setSelectedZone}
          />
        </div>
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="font-bold text-lg mb-3">Zone detail</h2>
            {!selectedZone && <p className="text-sm text-slate-500">Select a zone on the map.</p>}
            {selectedZone && (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Name</dt>
                  <dd className="font-semibold text-right">{selectedZone.name}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Crowd / capacity</dt>
                  <dd className="font-semibold">
                    {selectedZone.currentOccupancy?.toLocaleString()} / {selectedZone.capacity?.toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Utilization</dt>
                  <dd>{selectedZone.utilizationPercent}%</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Traffic</dt>
                  <dd>{selectedZone.trafficLevel}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Risk</dt>
                  <dd className="font-semibold text-brand-orange">{selectedZone.riskLevel}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Source</dt>
                  <dd>{selectedZone.dataSource}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Last updated</dt>
                  <dd>{selectedZone.lastUpdated ? new Date(selectedZone.lastUpdated).toLocaleString() : '—'}</dd>
                </div>
              </dl>
            )}
          </div>

          {/* Grounded AI Assistant */}
          <LlmAssistantWidget eventId={eventId} />
        </div>
      </div>
    </div>
  );
}
