import React, { useEffect, useState } from 'react';
import { ticketsApi, zonesApi } from '../../services/api';
import { QrCode, ShieldCheck, CheckCircle2, AlertTriangle, Search, Loader2, Users, Flame, LayoutGrid, Bell, Radio, MessageSquare, Send, Sparkles, Star, Tag, ThumbsUp, Award } from 'lucide-react';
import io from 'socket.io-client';
import axios from 'axios';

export function getCongestionBadge(utilPercent) {
  const util = Number(utilPercent) || 0;
  if (util > 85) {
    return {
      label: '🚨 EXTREME DANGER (>85%)',
      colorClass: 'bg-rose-600 text-white border-rose-400 animate-pulse font-black',
      barColor: 'bg-rose-600',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500',
      level: 'CRITICAL',
    };
  } else if (util >= 70) {
    return {
      label: '🟧 HIGH CONGESTION (70-85%)',
      colorClass: 'bg-orange-500 text-slate-950 font-black border-orange-300',
      barColor: 'bg-orange-500',
      badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500',
      level: 'HIGH',
    };
  } else if (util >= 40) {
    return {
      label: '🟡 MODERATE (40-70%)',
      colorClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50 font-bold',
      barColor: 'bg-yellow-400',
      badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500',
      level: 'MEDIUM',
    };
  }
  return {
    label: '🟢 NORMAL (0-40%)',
    colorClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-700 font-bold',
    barColor: 'bg-emerald-500',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500',
    level: 'LOW',
  };
}

export default function GateGuardScannerWidget({ eventId, zones: propZones }) {
  const [activeTab, setActiveTab] = useState('SCANNER'); // 'SCANNER' | 'ZONE_GRID' | 'ALERTS'
  const [riskFilter, setRiskFilter] = useState('ALL'); // 'ALL' | 'NORMAL' | 'MODERATE' | 'HIGH' | 'CRITICAL'
  const [scanInput, setScanInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');

  const [zones, setZones] = useState(propZones || []);
  const [alerts, setAlerts] = useState([]);

  // Social Signals & AI Sentiment state
  const [socialSignals, setSocialSignals] = useState([]);
  const [aiReport, setAiReport] = useState(null);
  const [commentVisitorName, setCommentVisitorName] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [commentRating, setCommentRating] = useState(5);
  const [submittingComment, setSubmittingComment] = useState(false);

  const currentEventId = eventId || '66f54c98c70f45a2aade5011';

  const fetchSocialSignals = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/social/event/${currentEventId}`);
      if (res.data) {
        setSocialSignals(res.data.signals || []);
        setAiReport(res.data.aiReport);
      }
    } catch (err) {
      console.warn('Failed to fetch social signals in hub:', err.message);
    }
  };

  const handlePostHubComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    setSubmittingComment(true);
    try {
      await axios.post('http://localhost:5000/api/social/comments', {
        eventId: currentEventId,
        visitorName: commentVisitorName || 'Attendee / Gate Guard',
        comment: newCommentText,
        rating: Number(commentRating),
      });
      setNewCommentText('');
      fetchSocialSignals();
    } catch (err) {
      console.error('Failed to post comment from hub:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Sync propZones if parent provides/updates them
  useEffect(() => {
    if (propZones && Array.isArray(propZones)) {
      setZones(propZones);
    }
  }, [propZones]);

  // Fetch zones & social signals on mount & set up socket listener for live updates
  useEffect(() => {
    fetchSocialSignals();

    if (!eventId) return;

    const fetchZones = () => {
      zonesApi.listByEvent(eventId).then(({ data }) => {
        setZones(data.zones || []);
      }).catch(() => {});
    };

    if (!propZones || propZones.length === 0) {
      fetchZones();
    }

    // Socket.IO real-time connection
    const socket = io(import.meta.env.VITE_API_URL || '', {
      transports: ['websocket', 'polling'],
    });

    socket.emit('join:event', eventId);

    const handleZoneUpdate = (updatedZone) => {
      if (updatedZone && updatedZone._id) {
        setZones((prevZones) => {
          const index = prevZones.findIndex((z) => String(z._id) === String(updatedZone._id));
          if (index >= 0) {
            const next = [...prevZones];
            next[index] = updatedZone;
            return next;
          }
          return [...prevZones, updatedZone];
        });
      } else {
        fetchZones();
      }
    };

    socket.on('zone:update', handleZoneUpdate);
    socket.on('zone:updated', fetchZones);
    socket.on('zones:updated', fetchZones);

    socket.on('organizer:alert', (newAlert) => {
      setAlerts((prev) => [newAlert, ...prev]);
    });

    socket.on('alert:new', (newAlert) => {
      setAlerts((prev) => [newAlert, ...prev]);
    });

    socket.on('social:new_comment', () => {
      fetchSocialSignals();
    });

    return () => {
      socket.disconnect();
    };
  }, [eventId]);

  async function handleScan(e) {
    if (e) e.preventDefault();
    if (!scanInput.trim()) return;

    setError('');
    setScanResult(null);
    setScanning(true);

    try {
      const { data } = await ticketsApi.scan({
        ticketId: scanInput.trim(),
        eventId,
      });

      setScanResult(data);
      setScanInput('');

      if (data.alert) {
        setAlerts((prev) => [data.alert, ...prev]);
      }

      // Refresh zone grid after scan
      zonesApi.listByEvent(eventId).then(({ data: zData }) => {
        setZones(zData.zones || []);
      }).catch(() => {});

    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or unverified ticket code.');
    } finally {
      setScanning(false);
    }
  }

  // Derive real-time overcrowding alerts dynamically for any zone at >= 70% or > 85% capacity
  const derivedAlerts = zones
    .filter((z) => (z.utilizationPercent || 0) >= 70)
    .map((z) => {
      const util = z.utilizationPercent || 0;
      const isExtreme = util > 85;
      return {
        _id: `zone-alert-${z._id}`,
        title: isExtreme
          ? `🚨 EXTREME DANGER: ${z.name.toUpperCase()} (>85%)`
          : `⚠️ HIGH CONGESTION: ${z.name.toUpperCase()} (70-85%)`,
        message: isExtreme
          ? `CRITICAL OVERCROWDING ALERT! ${z.name} reached ${z.currentOccupancy}/${z.capacity} (${util}%). Immediate crowd redirection required!`
          : `HIGH CROWD WARNING! ${z.name} reached ${z.currentOccupancy}/${z.capacity} (${util}%). Monitor gate flow.`,
        severity: isExtreme ? 'CRITICAL' : 'HIGH',
        createdAt: z.lastUpdated || new Date().toISOString(),
        zoneName: z.name,
      };
    });

  // Combine socket alerts and derived alerts (deduplicating by title)
  const combinedAlerts = [...derivedAlerts];
  alerts.forEach((a) => {
    if (!combinedAlerts.some((item) => item.title === a.title)) {
      combinedAlerts.push(a);
    }
  });

  // Count high risk / critical zones
  const normalZones = zones.filter((z) => (z.utilizationPercent || 0) < 40);
  const moderateZones = zones.filter((z) => (z.utilizationPercent || 0) >= 40 && (z.utilizationPercent || 0) < 70);
  const highCongestionZones = zones.filter((z) => (z.utilizationPercent || 0) >= 70 && (z.utilizationPercent || 0) <= 85);
  const criticalZones = zones.filter((z) => (z.utilizationPercent || 0) > 85);

  const dangerousZones = [...criticalZones, ...highCongestionZones];

  // Filtered zones list based on riskFilter tab selection
  const filteredZones = zones.filter((z) => {
    const util = z.utilizationPercent || 0;
    if (riskFilter === 'NORMAL') return util < 40;
    if (riskFilter === 'MODERATE') return util >= 40 && util < 70;
    if (riskFilter === 'HIGH') return util >= 70 && util <= 85;
    if (riskFilter === 'CRITICAL') return util > 85;
    return true; // 'ALL'
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-white">
      {/* Header Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded-md inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Security & Gate Operations
          </span>
          <h3 className="text-xl font-black text-white mt-1">Organizer Gate Guard & Zone Congestion Hub</h3>
        </div>

        {/* Tab Selector Navigation */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('SCANNER')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'SCANNER'
                ? 'bg-brand-orange text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            Ticket Scanner
          </button>

          <button
            onClick={() => setActiveTab('ZONE_GRID')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 relative ${
              activeTab === 'ZONE_GRID'
                ? 'bg-brand-orange text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            All Zones Live ({zones.length})
            {dangerousZones.length > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping absolute -top-0.5 -right-0.5" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('ALERTS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 relative ${
              activeTab === 'ALERTS'
                ? 'bg-brand-orange text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            Alerts ({combinedAlerts.length})
            {combinedAlerts.length > 0 && (
              <span className="bg-rose-500 text-white font-extrabold text-[10px] px-1.5 py-0.2 rounded-full ml-1 animate-pulse">
                {combinedAlerts.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* PROMINENT REAL-TIME DANGER WARNING BANNER FOR ALL DANGEROUS ZONES */}
      {dangerousZones.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-950/90 border border-rose-600 text-rose-100 animate-in fade-in shadow-lg">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="font-extrabold text-sm uppercase tracking-wide flex items-center gap-2 text-rose-300">
              <Flame className="w-5 h-5 text-rose-400 animate-bounce" />
              🚨 ATTENTION: {dangerousZones.length} ZONE(S) CURRENTLY IN DANGER!
            </span>
            <button
              onClick={() => {
                setActiveTab('ZONE_GRID');
                setRiskFilter('HIGH');
              }}
              className="text-[11px] font-bold bg-rose-800 hover:bg-rose-700 text-white px-3 py-1 rounded-xl shadow-sm transition-all"
            >
              Filter Dangerous Zones →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
            {dangerousZones.map((z) => {
              const util = z.utilizationPercent || 0;
              const isExtreme = util > 85;
              return (
                <div
                  key={z._id}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                    isExtreme ? 'bg-rose-900/90 border-rose-500' : 'bg-orange-950/90 border-orange-600'
                  }`}
                >
                  <div>
                    <span className="font-black text-white">{z.name}</span>
                    <span className="text-[10px] block opacity-80">
                      Occupancy: {z.currentOccupancy ?? 0} / {z.capacity ?? 1000}
                    </span>
                  </div>
                  <span className="font-mono font-black text-sm px-2 py-1 rounded-lg bg-black/40">
                    {util}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 1: TICKET SCANNER */}
      {activeTab === 'SCANNER' && (
        <div className="space-y-4">
          <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <QrCode className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                placeholder="Scan QR Code or Enter Ticket ID (e.g. TKT-8F92A1)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-brand-orange font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={scanning || !scanInput.trim()}
              className="px-6 py-3 bg-brand-orange hover:bg-orange-600 text-white font-extrabold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Scan & Validate
            </button>
          </form>

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-bold flex items-start gap-2 animate-in fade-in">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-extrabold uppercase tracking-wide text-rose-400">CHECK-IN REJECTED</div>
                <div className="mt-0.5">{error}</div>
              </div>
            </div>
          )}

          {/* Valid Scan Result Banner */}
          {scanResult && (
            <div className="p-5 rounded-2xl bg-emerald-950/70 border border-emerald-700/80 space-y-3 animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" /> {scanResult.message}
                </span>
                <span className="text-[10px] text-emerald-300 font-mono">
                  {new Date(scanResult.ticket?.checkedInAt).toLocaleTimeString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/80 p-3 rounded-xl border border-emerald-900/50">
                <div>
                  <span className="text-slate-400 font-medium block">Visitor Name</span>
                  <span className="font-extrabold text-white text-sm">{scanResult.ticket?.visitorName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Ticket Tier</span>
                  <span className="font-bold text-brand-orange text-sm">{scanResult.ticket?.tierName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Verified Ticket ID</span>
                  <span className="font-mono font-bold text-slate-200">{scanResult.ticket?.ticketId}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Assigned Gate</span>
                  <span className="font-extrabold text-emerald-400">📍 {scanResult.ticket?.entryZoneName}</span>
                </div>
              </div>

              {/* Live Zone Status Badge */}
              {scanResult.zoneStatus && (
                <div className="pt-2 border-t border-emerald-900/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>
                      {scanResult.zoneStatus.zoneName} Occupancy:{' '}
                      <strong className="text-white">
                        {scanResult.zoneStatus.currentOccupancy}/{scanResult.zoneStatus.capacity}
                      </strong>{' '}
                      ({scanResult.zoneStatus.utilizationPercent}%)
                    </span>
                  </div>

                  <span className={`px-3 py-1 rounded-full border ${getCongestionBadge(scanResult.zoneStatus.utilizationPercent).colorClass}`}>
                    {getCongestionBadge(scanResult.zoneStatus.utilizationPercent).label}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LIVE ZONE CONGESTION GRID */}
      {activeTab === 'ZONE_GRID' && (
        <div className="space-y-4">
          {/* Interactive Filter Toolbar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-center mb-3">
            <button
              onClick={() => setRiskFilter('ALL')}
              className={`p-2.5 rounded-xl transition-all border ${
                riskFilter === 'ALL'
                  ? 'bg-slate-800 border-white text-white font-black shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="block font-bold">All Zones</span>
              <span className="text-[10px] font-mono">({zones.length})</span>
            </button>

            <button
              onClick={() => setRiskFilter('NORMAL')}
              className={`p-2.5 rounded-xl transition-all border ${
                riskFilter === 'NORMAL'
                  ? 'bg-emerald-900/90 border-emerald-400 text-emerald-200 font-black shadow-md'
                  : 'bg-emerald-950/40 border-emerald-900/60 text-emerald-400 hover:bg-emerald-900/60'
              }`}
            >
              <span className="block font-bold">🟢 Normal</span>
              <span className="text-[10px]">0-39% ({normalZones.length})</span>
            </button>

            <button
              onClick={() => setRiskFilter('MODERATE')}
              className={`p-2.5 rounded-xl transition-all border ${
                riskFilter === 'MODERATE'
                  ? 'bg-yellow-900/90 border-yellow-400 text-yellow-200 font-black shadow-md'
                  : 'bg-yellow-950/40 border-yellow-900/60 text-yellow-400 hover:bg-yellow-900/60'
              }`}
            >
              <span className="block font-bold">🟡 Moderate</span>
              <span className="text-[10px]">40-69% ({moderateZones.length})</span>
            </button>

            <button
              onClick={() => setRiskFilter('HIGH')}
              className={`p-2.5 rounded-xl transition-all border ${
                riskFilter === 'HIGH'
                  ? 'bg-orange-900/90 border-orange-400 text-orange-200 font-black shadow-md'
                  : 'bg-orange-950/40 border-orange-900/60 text-orange-400 hover:bg-orange-900/60'
              }`}
            >
              <span className="block font-bold">🟧 High Congestion</span>
              <span className="text-[10px]">70-85% ({highCongestionZones.length})</span>
            </button>

            <button
              onClick={() => setRiskFilter('CRITICAL')}
              className={`p-2.5 rounded-xl transition-all border ${
                riskFilter === 'CRITICAL'
                  ? 'bg-rose-900/90 border-rose-400 text-rose-200 font-black shadow-md animate-pulse'
                  : 'bg-rose-950/40 border-rose-900/60 text-rose-400 hover:bg-rose-900/60'
              }`}
            >
              <span className="block font-bold">🚨 Extreme Danger</span>
              <span className="text-[10px]">&gt;85% ({criticalZones.length})</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredZones.map((zone) => {
              const util = zone.utilizationPercent || 0;
              const badge = getCongestionBadge(util);

              return (
                <div key={zone._id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-white">{zone.name}</h4>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">{zone.type}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${badge.badgeColor}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs text-slate-300 font-semibold">
                    <span>Occupancy</span>
                    <span>
                      {zone.currentOccupancy?.toLocaleString() ?? 0} / {zone.capacity?.toLocaleString() ?? 1000} ({util}%)
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${badge.barColor}`}
                      style={{ width: `${Math.min(100, util)}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {filteredZones.length === 0 && (
              <div className="col-span-full text-center py-8 text-slate-500 text-xs bg-slate-950/50 rounded-2xl border border-slate-800">
                No zones match the selected congestion filter ({riskFilter}).
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: OVERCROWDING ALERTS & VISITOR AI SIGNALS */}
      {activeTab === 'ALERTS' && (
        <div className="space-y-6">
          {/* Section 1: Live Congestion & Safety Alerts */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Zone Safety & Overcrowding Alerts ({combinedAlerts.length})
            </h4>
            {combinedAlerts.length === 0 ? (
              <div className="text-center py-4 text-slate-500 text-xs bg-slate-950/50 rounded-2xl border border-slate-800">
                No overcrowding alerts triggered yet. Alerts will appear here in real-time when any zone crosses 70% or 85% capacity.
              </div>
            ) : (
              combinedAlerts.map((a, i) => (
                <div
                  key={a._id || i}
                  className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
                    a.severity === 'CRITICAL'
                      ? 'bg-rose-950/80 border-rose-800 text-rose-200'
                      : 'bg-orange-950/80 border-orange-800 text-orange-200'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
                  <div>
                    <div className="font-black text-sm uppercase tracking-wide">{a.title}</div>
                    <div className="mt-1 font-medium">{a.message}</div>
                    <div className="text-[10px] opacity-75 mt-1">
                      {a.createdAt ? new Date(a.createdAt).toLocaleTimeString() : 'Just now'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Section 2: Visitor Social Signals & AI Topic Analytics */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div>
                <h4 className="font-black text-sm text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-brand-orange" />
                  Visitor Social Signal Feed & AI Topic Analysis
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time attendee comments analyzed by EventFlow AI for topic detection & management scoring.
                </p>
              </div>

              {aiReport && (
                <div className="bg-gradient-to-r from-orange-950 to-amber-950 p-3 rounded-xl border border-orange-700/80 flex items-center gap-3 shrink-0">
                  <Sparkles className="w-5 h-5 text-brand-orange animate-pulse" />
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">AI Management Grade</p>
                    <span className="text-lg font-black text-brand-orange">
                      {aiReport.overallGrade} ({aiReport.overallScore}/100)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* AI Management Advice */}
            {aiReport && aiReport.aiAdviceForNextEvent && (
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-orange-500/30 flex items-start gap-2.5 text-xs text-orange-200">
                <Sparkles className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">AI Recommendation for Event Management:</span>
                  <span>"{aiReport.aiAdviceForNextEvent}"</span>
                </div>
              </div>
            )}

            {/* Hub Comment Form */}
            <form onSubmit={handlePostHubComment} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <ThumbsUp className="w-3.5 h-3.5 text-brand-orange" />
                Submit Visitor / Staff Experience Report
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Visitor Name (Optional)"
                  value={commentVisitorName}
                  onChange={(e) => setCommentVisitorName(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-brand-orange"
                />
                <select
                  value={commentRating}
                  onChange={(e) => setCommentRating(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-brand-orange font-medium"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5/5 - Excellent Flow)</option>
                  <option value={4}>⭐⭐⭐⭐ (4/5 - Good Flow)</option>
                  <option value={3}>⭐⭐⭐ (3/5 - Minor Delays)</option>
                  <option value={2}>⭐⭐ (2/5 - Heavy Bottleneck)</option>
                  <option value={1}>⭐ (1/5 - Poor Experience)</option>
                </select>
              </div>
              <textarea
                rows={2}
                placeholder="e.g. 'Gate 1 checkin is super fast! But washrooms near Stage B need cleanup.'"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-orange"
                required
              />
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">🤖 AI extracts topics & calculates sentiment upon submission.</span>
                <button
                  type="submit"
                  disabled={submittingComment}
                  className="bg-brand-orange hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submittingComment ? 'Posting...' : 'Submit Report'}
                </button>
              </div>
            </form>

            {/* Social Signal Feed List */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {socialSignals.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs bg-slate-950/40 rounded-2xl border border-slate-800">
                  No visitor comments submitted yet. Submit a comment above to trigger AI topic extraction!
                </div>
              ) : (
                socialSignals.map((c, i) => (
                  <div key={c._id || i} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-brand-orange/20 text-brand-orange font-black flex items-center justify-center text-[10px]">
                          {c.visitorName ? c.visitorName[0] : 'V'}
                        </div>
                        <span className="font-extrabold text-white">{c.visitorName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                            c.sentiment === 'POSITIVE'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : c.sentiment === 'NEGATIVE'
                              ? 'bg-rose-950 text-rose-300 border-rose-800'
                              : 'bg-amber-950 text-amber-300 border-amber-800'
                          }`}
                        >
                          {c.sentiment}
                        </span>
                        <span className="font-bold text-amber-400">{'⭐'.repeat(c.rating || 4)}</span>
                      </div>
                    </div>

                    <p className="text-slate-200 font-medium pl-8">"{c.comment}"</p>

                    <div className="pl-8 pt-1 flex flex-wrap items-center justify-between gap-1.5 border-t border-slate-900 text-[10px]">
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-slate-500 font-bold">AI Topics:</span>
                        {(c.topics || ['GENERAL_MANAGEMENT']).map((t, idx) => (
                          <span key={idx} className="bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800 font-mono font-bold">
                            #{t}
                          </span>
                        ))}
                      </div>
                      {c.aiSummary && (
                        <span className="text-brand-orange font-semibold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> {c.aiSummary}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
