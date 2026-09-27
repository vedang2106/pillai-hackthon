import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import LiveCrowdMap from '../components/maps/LiveCrowdMap';
import SourceBadge from '../components/common/SourceBadge';
import { useZones } from '../hooks/useZones';
import { eventsApi, healthApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, AlertTriangle, ShieldAlert, Bus, PhoneCall, Building, Edit3, X, Check, 
  CloudRain, FlaskConical, LayoutDashboard, QrCode, Map, Bot, ArrowLeft, Ticket, Layers, MessageSquare
} from 'lucide-react';
import LlmAssistantWidget from '../components/ai/LlmAssistantWidget';
import VisitorSmartNavigator from '../components/ai/VisitorSmartNavigator';
import VisitorTicketPurchase from '../components/tickets/VisitorTicketPurchase';
import VisitorVenueWeatherCard from '../components/visitor/VisitorVenueWeatherCard';
import VisitorCommentSection from '../components/visitor/VisitorCommentSection';
import GateGuardScannerWidget from '../components/tickets/GateGuardScannerWidget';
import CrowdRippleCard from '../components/ai/CrowdRippleCard';
import RecommendationsPanel from '../components/ai/RecommendationsPanel';
import VisitorFeedbackAnalyticsPanel from '../components/ai/VisitorFeedbackAnalyticsPanel';
import WhatIfSimulator from './WhatIfSimulator';
import PillNav from '../components/common/PillNav';
import OrganizerGateManager from '../components/dashboard/OrganizerGateManager';

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
  const { user, isOrganizer, isGovernment } = useAuth();
  const { zones, loading, error } = useZones(eventId);
  const [event, setEvent] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [apiHealth, setApiHealth] = useState(null);

  // Active Navigation Tab: Defaults to 'overview' for Government, 'weather' for Organizers
  const [activeNav, setActiveNav] = useState(isGovernment ? 'overview' : 'weather');

  const fallbackZones = useMemo(() => [
    { _id: 'z1', name: 'Gate A (Main Check-In)', capacity: 5000, currentOccupancy: 4200, utilizationPercent: 84, crowdLevel: 'HIGH', trafficLevel: 'HEAVY', riskLevel: 'HIGH', type: 'GATE', dataSource: 'LIVE_SENSOR' },
    { _id: 'z2', name: 'Main Stage Arena', capacity: 15000, currentOccupancy: 13800, utilizationPercent: 92, crowdLevel: 'CRITICAL', trafficLevel: 'SLOW', riskLevel: 'CRITICAL', type: 'STAGE', dataSource: 'LIVE_CAMERA' },
    { _id: 'z3', name: 'Food & Beverage Pavilion', capacity: 8000, currentOccupancy: 5200, utilizationPercent: 65, crowdLevel: 'MEDIUM', trafficLevel: 'NORMAL', riskLevel: 'LOW', type: 'FOOD', dataSource: 'SIMULATED' },
    { _id: 'z4', name: 'South Parking Plaza', capacity: 6000, currentOccupancy: 2100, utilizationPercent: 35, crowdLevel: 'LOW', trafficLevel: 'NORMAL', riskLevel: 'LOW', type: 'PARKING', dataSource: 'SIMULATED' },
    { _id: 'z5', name: 'Central Metro Transit Hub', capacity: 10000, currentOccupancy: 7800, utilizationPercent: 78, crowdLevel: 'HIGH', trafficLevel: 'HEAVY', riskLevel: 'MEDIUM', type: 'METRO', dataSource: 'PREDICTED' },
  ], []);

  const displayZones = (zones && zones.length > 0) ? zones : fallbackZones;

  useEffect(() => {
    if (!selectedZone && displayZones.length > 0) {
      setSelectedZone(displayZones[0]);
    }
  }, [displayZones, selectedZone]);

  useEffect(() => {
    if (isGovernment && (activeNav === 'weather' || activeNav === 'tickets')) {
      setActiveNav('overview');
    }
  }, [isGovernment, activeNav]);

  // Edit Event Modal State for Organizer
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    category: 'Music',
    expectedAttendance: 1000,
    venueName: '',
    description: '',
    status: 'LIVE',
  });

  useEffect(() => {
    eventsApi.get(eventId).then(({ data }) => {
      const evt = data.event;
      setEvent(evt);
      if (evt) {
        setEditForm({
          name: evt.name || '',
          category: evt.category || 'General',
          expectedAttendance: evt.expectedAttendance || 1000,
          venueName: evt.venue?.name || '',
          description: evt.description || '',
          status: evt.status || 'LIVE',
        });
      }
    }).catch(() => setEvent(null));
    healthApi.check().then(({ data }) => setApiHealth(data)).catch(() => setApiHealth({ ok: false }));
  }, [eventId]);

  async function handleSaveEventInfo(e) {
    e.preventDefault();
    setSavingEvent(true);
    try {
      const { data } = await eventsApi.update(eventId, {
        name: editForm.name,
        category: editForm.category,
        expectedAttendance: Number(editForm.expectedAttendance),
        venue: { ...event?.venue, name: editForm.venueName },
        description: editForm.description,
        status: editForm.status,
      });
      setEvent(data.event || { ...event, ...editForm, venue: { ...event?.venue, name: editForm.venueName } });
      setIsEditingEvent(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update event info');
    } finally {
      setSavingEvent(false);
    }
  }

  const kpis = useMemo(() => aggregateKpis(zones, event), [zones, event]);
  const isGovVerified = event?.governmentVerified || event?.verificationStatus === 'VERIFIED';
  const organizerName = event?.assignedOrganizerId?.name || event?.organizerId?.name || 'Organizer';
  const isVisitorMode = !isOrganizer && !isGovernment;

  // Build dynamic PillNav items based on user role
  const pillNavItems = [
    {
      id: 'city-directory',
      label: isGovernment ? 'Govt Dashboard' : 'City Directory',
      icon: ArrowLeft,
      isBackLink: true,
      to: isGovernment ? '/government' : '/events',
    },
    ...(isOrganizer ? [
      {
        id: 'weather',
        label: '🌧️ Weather Digital Twin',
        icon: CloudRain,
        iconColor: 'text-amber-300',
        badge: 'LIVE API',
      },
    ] : []),
    {
      id: 'zones',
      label: '🗺️ Live Map & Zones',
      icon: Map,
      iconColor: 'text-sky-400',
    },
    ...(isOrganizer ? [
      {
        id: 'tickets',
        label: '🎟️ Ticket Scanner & Check-In',
        icon: QrCode,
        iconColor: 'text-emerald-400',
      },
    ] : []),
    {
      id: 'overview',
      label: '📊 Overview & Advisories',
      icon: LayoutDashboard,
      iconColor: 'text-indigo-400',
    },
    ...(!isGovernment ? [
      {
        id: 'ai',
        label: '🤖 AI Assistant & Analytics',
        icon: Bot,
        iconColor: 'text-purple-400',
      },
    ] : []),
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Pending Verification Banner */}
      {!isGovVerified && (
        <div className="mb-6 bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-extrabold text-amber-900 text-sm">Status: PENDING VERIFICATION</span>
              <p className="text-xs text-amber-700">Submitted event awaiting official government verification & traffic directives.</p>
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

      {/* Main Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
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
            <span>Venue: <strong className="text-slate-700">{event?.venue?.name || 'Main Venue'}</strong></span>
            <span>·</span>
            <span>Category: <strong className="text-slate-700">{event?.category || 'General'}</strong></span>
            <span>·</span>
            <span>Organized by: <strong className="text-slate-700">{organizerName}</strong></span>
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

          {isOrganizer && (
            <>
              <button
                onClick={() => setIsEditingEvent(true)}
                className="border border-slate-200 hover:border-brand-orange text-xs font-extrabold px-3.5 py-2.5 rounded-xl bg-white shadow-sm transition-all flex items-center gap-1.5 text-slate-700"
              >
                <Edit3 className="w-4 h-4 text-brand-orange" /> Edit Event Info
              </button>
              <Link
                to={`/events/${eventId}/zones`}
                className="border border-slate-200 hover:border-brand-orange text-xs font-extrabold px-4 py-2.5 rounded-xl bg-white shadow-sm transition-all text-slate-700"
              >
                Manage Venue Zones
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ROLE-BASED CONDITIONAL LAYOUT */}
      {isVisitorMode ? (
        /* ================= VISITOR ROLE VIEW ================= */
        <div className="space-y-8 mt-4">
          <VisitorVenueWeatherCard event={event} />
          <VisitorTicketPurchase event={event} />
          <VisitorSmartNavigator event={event} zones={displayZones} />
          <VisitorCommentSection eventId={eventId || event?._id} allowSubmission={true} />

          {(event?.officialTrafficRestrictions || event?.officialRoadClosures || event?.officialTransportInfo || event?.emergencyInfo) && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-extrabold text-slate-900">Official Government Advisories & Public Directives</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {event?.officialTrafficRestrictions && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
                    <div className="font-extrabold text-amber-900 uppercase flex items-center gap-1.5 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Traffic Restrictions
                    </div>
                    <div className="text-slate-700 leading-relaxed">{event.officialTrafficRestrictions}</div>
                  </div>
                )}

                {event?.officialRoadClosures && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5">
                    <div className="font-extrabold text-rose-900 uppercase flex items-center gap-1.5 mb-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Road Closures
                    </div>
                    <div className="text-slate-700 leading-relaxed">{event.officialRoadClosures}</div>
                  </div>
                )}

                {event?.officialTransportInfo && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5">
                    <div className="font-extrabold text-blue-900 uppercase flex items-center gap-1.5 mb-1">
                      <Bus className="w-3.5 h-3.5 text-blue-600" /> Public Transport Info
                    </div>
                    <div className="text-slate-700 leading-relaxed">{event.officialTransportInfo}</div>
                  </div>
                )}

                {event?.emergencyInfo && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5">
                    <div className="font-extrabold text-emerald-900 uppercase flex items-center gap-1.5 mb-1">
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-600" /> Emergency & Control
                    </div>
                    <div className="text-slate-700 leading-relaxed">{event.emergencyInfo}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="font-extrabold text-lg mb-3 text-slate-900">Live Crowd Map & Venue Zones</h2>
            <LiveCrowdMap zones={zones} venue={event?.venue} selectedZoneId={selectedZone?._id} onSelectZone={setSelectedZone} />
          </div>
        </div>
      ) : (
        /* ================= ORGANIZER & GOVERNMENT ROLE VIEW ================= */
        <>
          {/* EVENT PILLNAV NAVBAR */}
          <PillNav
            items={pillNavItems}
            activeId={activeNav}
            onChange={(id) => setActiveNav(id)}
            className="mb-8"
          />

          {/* TAB 1: WEATHER DIGITAL TWIN (ORGANIZER ONLY) */}
          {activeNav === 'weather' && isOrganizer && (
            <div className="space-y-6">
              <WhatIfSimulator data={{ event, eventId, zones }} />
            </div>
          )}

          {/* TAB 2: LIVE MAP & VENUE ZONES */}
          {activeNav === 'zones' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Map className="w-5 h-5 text-brand-orange" /> Live Venue Crowd Map & Zone Telemetry
                </h2>
                {isOrganizer && (
                  <Link
                    to={`/events/${eventId}/zones`}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Layers className="w-4 h-4 text-brand-orange" /> Edit Venue Zones Configuration
                  </Link>
                )}
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <LiveCrowdMap
                    zones={displayZones}
                    venue={event?.venue}
                    selectedZoneId={selectedZone?._id}
                    onSelectZone={setSelectedZone}
                  />
                </div>
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <h3 className="font-bold text-base text-slate-900">Zone Telemetry Detail</h3>
                      <span className="text-[10px] font-bold bg-orange-100 text-brand-orange px-2 py-0.5 rounded-full uppercase">
                        {selectedZone?.dataSource || 'LIVE SENSOR'}
                      </span>
                    </div>

                    {/* Interactive Zone Selection Pills */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Monitored Zone:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {displayZones.map((z) => (
                          <button
                            key={z._id}
                            onClick={() => setSelectedZone(z)}
                            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all border ${
                              selectedZone?._id === z._id
                                ? 'bg-brand-orange text-white border-brand-orange shadow-sm'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {z.name} ({z.utilizationPercent}%)
                          </button>
                        ))}
                      </div>
                    </div>

                    {!selectedZone && <p className="text-sm text-slate-500">Select a zone above or on the map to inspect live metrics.</p>}
                    {selectedZone && (
                      <dl className="space-y-2.5 text-sm pt-2 border-t border-slate-100">
                        <div className="flex justify-between gap-2">
                          <dt className="text-slate-500">Monitored Zone</dt>
                          <dd className="font-bold text-right text-slate-900">{selectedZone.name}</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-slate-500">Live Crowd Occupancy</dt>
                          <dd className="font-bold text-slate-900 font-mono">
                            {(selectedZone.currentOccupancy ?? 0).toLocaleString()} / {(selectedZone.capacity ?? 5000).toLocaleString()}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-slate-500">Capacity Utilization</dt>
                          <dd className="font-extrabold text-brand-orange text-base">{selectedZone.utilizationPercent}%</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-slate-500">Egress Traffic Speed</dt>
                          <dd className="font-semibold text-slate-800">{selectedZone.trafficLevel || 'NORMAL'}</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-slate-500">AI Safety Risk Rating</dt>
                          <dd className={`font-black uppercase ${
                            selectedZone.riskLevel === 'CRITICAL' ? 'text-red-600 animate-pulse' : selectedZone.riskLevel === 'HIGH' ? 'text-orange-600' : 'text-emerald-600'
                          }`}>
                            {selectedZone.riskLevel || 'LOW'}
                          </dd>
                        </div>
                      </dl>
                    )}
                  </div>
                </div>
              </div>

              {isOrganizer && (
                <OrganizerGateManager eventId={eventId} zones={displayZones} />
              )}
            </div>
          )}

          {/* TAB 3: TICKET SCANNER & CHECK-IN (ORGANIZER ONLY) */}
          {activeNav === 'tickets' && isOrganizer && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 p-6 rounded-2xl text-white shadow-xl border border-slate-800">
                <h2 className="text-2xl font-black flex items-center gap-2">
                  <QrCode className="w-6 h-6 text-emerald-400" /> Gate Guard Check-In & Ticket Scanner
                </h2>
                <p className="text-slate-400 text-xs mt-1">Scan visitor QR codes at entry gates to record live attendance and update zone occupancy.</p>
              </div>

              <GateGuardScannerWidget eventId={eventId} zones={zones} />
            </div>
          )}



          {/* TAB 4: OVERVIEW & ADVISORIES */}
          {activeNav === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

              {/* VISITOR FEEDBACK & AI MANAGEMENT ANALYTICS */}
              {!isGovernment && <VisitorFeedbackAnalyticsPanel eventId={eventId} />}

              {(event?.officialTrafficRestrictions || event?.officialRoadClosures || event?.officialTransportInfo || event?.emergencyInfo) && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-base font-extrabold text-slate-900">Official Government Advisories & Public Directives</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    {event?.officialTrafficRestrictions && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
                        <div className="font-extrabold text-amber-900 uppercase flex items-center gap-1.5 mb-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Traffic Restrictions
                        </div>
                        <div className="text-slate-700 leading-relaxed">{event.officialTrafficRestrictions}</div>
                      </div>
                    )}

                    {event?.officialRoadClosures && (
                      <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5">
                        <div className="font-extrabold text-rose-900 uppercase flex items-center gap-1.5 mb-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Road Closures
                        </div>
                        <div className="text-slate-700 leading-relaxed">{event.officialRoadClosures}</div>
                      </div>
                    )}

                    {event?.officialTransportInfo && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5">
                        <div className="font-extrabold text-blue-900 uppercase flex items-center gap-1.5 mb-1">
                          <Bus className="w-3.5 h-3.5 text-blue-600" /> Public Transport Info
                        </div>
                        <div className="text-slate-700 leading-relaxed">{event.officialTransportInfo}</div>
                      </div>
                    )}

                    {event?.emergencyInfo && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5">
                        <div className="font-extrabold text-emerald-900 uppercase flex items-center gap-1.5 mb-1">
                          <PhoneCall className="w-3.5 h-3.5 text-emerald-600" /> Emergency & Control
                        </div>
                        <div className="text-slate-700 leading-relaxed">{event.emergencyInfo}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: AI INTELLIGENCE & ASSISTANT */}
          {activeNav === 'ai' && (
            <div className="space-y-8">
              <CrowdRippleCard eventId={eventId} />

              <RecommendationsPanel eventId={eventId} role={isGovernment ? 'GOVERNMENT' : 'ORGANIZER'} />

              <div className="max-w-xl">
                <LlmAssistantWidget eventId={eventId} />
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Event Information Modal */}
      {isEditingEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-brand-orange" /> Edit Event Information
              </h3>
              <button onClick={() => setIsEditingEvent(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEventInfo} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Event Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white"
                  >
                    <option value="Music Festival">Music Festival</option>
                    <option value="Conference">Conference</option>
                    <option value="Sports">Sports</option>
                    <option value="Exhibition">Exhibition</option>
                    <option value="Cultural">Cultural</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Expected Attendance</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={editForm.expectedAttendance}
                    onChange={(e) => setEditForm({ ...editForm, expectedAttendance: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Venue Name</label>
                <input
                  type="text"
                  required
                  value={editForm.venueName}
                  onChange={(e) => setEditForm({ ...editForm, venueName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingEvent(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEvent}
                  className="px-5 py-2 rounded-xl bg-brand-orange hover:bg-orange-600 text-white font-extrabold shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> {savingEvent ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
