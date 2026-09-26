import React, { useState } from 'react';
import { ticketsApi } from '../../services/api';
import { QrCode, ShieldCheck, CheckCircle2, AlertTriangle, Search, Loader2, Users, Flame, RefreshCw } from 'lucide-react';

export default function GateGuardScannerWidget({ eventId }) {
  const [scanInput, setScanInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');

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
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or unverified ticket code.');
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-white">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded-md inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Security Gate Scanner
          </span>
          <h3 className="text-xl font-black text-white mt-1">Gate Guard QR Scanner & Ticket Check-in</h3>
          <p className="text-slate-400 text-xs mt-0.5">
            Scan visitor QR Code / Ticket ID to grant gate entry and calculate real-time extreme danger levels.
          </p>
        </div>
      </div>

      <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-2 mb-4">
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

      {/* Scan Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-bold flex items-start gap-2 animate-in fade-in duration-150">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-extrabold uppercase tracking-wide text-rose-400">CHECK-IN REJECTED</div>
            <div className="mt-0.5">{error}</div>
          </div>
        </div>
      )}

      {/* Valid Scan Result Banner */}
      {scanResult && (
        <div className="p-5 rounded-2xl bg-emerald-950/70 border border-emerald-700/80 space-y-3 animate-in zoom-in-95 duration-200">
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

          {/* Live Zone Occupancy & Danger Level Alert */}
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

              <span
                className={`px-3 py-1 rounded-full font-black text-xs flex items-center gap-1 ${
                  scanResult.zoneStatus.riskLevel === 'CRITICAL'
                    ? 'bg-rose-600 text-white animate-pulse border border-rose-400'
                    : scanResult.zoneStatus.riskLevel === 'HIGH'
                    ? 'bg-amber-500 text-slate-950 font-extrabold'
                    : 'bg-emerald-800 text-emerald-100'
                }`}
              >
                {scanResult.zoneStatus.riskLevel === 'CRITICAL' && <Flame className="w-3.5 h-3.5 fill-current" />}
                {scanResult.zoneStatus.dangerStatus}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
