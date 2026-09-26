import React, { useEffect, useState } from 'react';
import { ticketsApi } from '../../services/api';
import QrCodeSvg from '../common/QrCodeSvg';
import { Ticket, CheckCircle2, AlertCircle, ShieldCheck, MapPin, Download, X, QrCode } from 'lucide-react';

export default function VisitorTicketPurchase({ event }) {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState(null);
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');
  const [purchasedTickets, setPurchasedTickets] = useState([]);
  const [activeTicketModal, setActiveTicketModal] = useState(null);

  useEffect(() => {
    if (!event?._id) return;
    setLoading(true);
    ticketsApi
      .getTiers(event._id)
      .then(({ data }) => {
        const list = data.tiers || [];
        setTiers(list);
        if (list.length > 0) setSelectedTier(list[0]);
      })
      .catch(() => setTiers([]))
      .finally(() => setLoading(false));
  }, [event?._id]);

  async function handlePurchase(e) {
    e.preventDefault();
    if (!selectedTier) return;
    if (!visitorName.trim() || !visitorEmail.trim()) {
      setError('Please enter your full name and email address.');
      return;
    }

    setError('');
    setPurchasing(true);
    try {
      const { data } = await ticketsApi.purchase({
        eventId: event._id,
        tierName: selectedTier.name,
        visitorName,
        visitorEmail,
        quantity: Number(quantity) || 1,
      });

      setPurchasedTickets((prev) => [...data.tickets, ...prev]);
      setActiveTicketModal(data.tickets[0]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to purchase ticket.');
    } finally {
      setPurchasing(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-center text-slate-500 text-sm">
        Loading ticket options...
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-brand-orange text-xs font-bold border border-orange-200 mb-1">
            <Ticket className="w-3.5 h-3.5" /> Event Ticketing & Pass Access
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Buy Entry Tickets & Pass</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Select ticket tier with assigned gate entry. Instant unique QR Code ticket generation.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Tier Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {tiers.map((tier) => {
          const isSelected = selectedTier?.name === tier.name;
          const isSoldOut = tier.soldQuantity >= tier.totalQuantity;

          return (
            <button
              key={tier.name}
              type="button"
              disabled={isSoldOut}
              onClick={() => setSelectedTier(tier)}
              className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'border-brand-orange bg-orange-50/50 ring-2 ring-orange-200 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              } ${isSoldOut ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSelected && (
                <span className="absolute top-3 right-3 text-brand-orange">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
              )}
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Access Tier</span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">{tier.name}</h3>
                <div className="text-2xl font-black text-brand-orange mt-2">
                  ₹{tier.price.toLocaleString()}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100/80 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-1 font-semibold text-slate-800">
                  <MapPin className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                  Entry: <span className="text-brand-orange">{tier.entryZoneName}</span>
                </div>
                <div className="text-slate-500 font-medium">
                  Slots: {tier.totalQuantity - tier.soldQuantity} remaining / {tier.totalQuantity} total
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Purchase Form */}
      {selectedTier && (
        <form onSubmit={handlePurchase} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Ticket className="w-4 h-4 text-brand-orange" />
            Purchasing: <span className="text-brand-orange">{selectedTier.name}</span> (@ ₹{selectedTier.price})
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Visitor Full Name *
              </label>
              <input
                required
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <input
                required
                type="email"
                value={visitorEmail}
                onChange={(e) => setVisitorEmail(e.target.value)}
                placeholder="e.g. rahul@gmail.com"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Pass Quantity
              </label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white font-bold"
              >
                <option value={1}>1 Ticket</option>
                <option value={2}>2 Tickets</option>
                <option value={3}>3 Tickets</option>
                <option value={4}>4 Tickets</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={purchasing}
            className="w-full bg-brand-orange hover:bg-orange-600 text-white font-extrabold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60"
          >
            <QrCode className="w-4 h-4" />
            {purchasing ? 'Generating QR Code Ticket...' : `Confirm & Pay ₹${(selectedTier.price * quantity).toLocaleString()}`}
          </button>
        </form>
      )}

      {/* Purchased Tickets List */}
      {purchasedTickets.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-100">
          <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Your Active Digital Passes ({purchasedTickets.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {purchasedTickets.map((t) => (
              <button
                key={t.ticketId}
                type="button"
                onClick={() => setActiveTicketModal(t)}
                className="bg-emerald-50/50 border border-emerald-200 hover:border-emerald-400 p-3.5 rounded-2xl text-left transition-all shadow-sm flex items-center justify-between group"
              >
                <div>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md uppercase">
                    {t.status}
                  </span>
                  <div className="font-extrabold text-slate-900 text-sm mt-1">{t.ticketId}</div>
                  <div className="text-xs text-slate-600 font-semibold">{t.tierName}</div>
                  <div className="text-[11px] text-brand-orange font-medium mt-0.5">📍 Entry: {t.entryZoneName}</div>
                </div>
                <QrCode className="w-8 h-8 text-emerald-600 group-hover:scale-110 transition-transform" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Digital Ticket Modal with QR Code */}
      {activeTicketModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setActiveTicketModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold border border-emerald-300 mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> OFFICIAL DIGITAL EVENT PASS
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">{activeTicketModal.eventName}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Present this QR Code to Security Guard at Entrance</p>

              {/* QR Code */}
              <div className="my-5 flex justify-center">
                <QrCodeSvg value={activeTicketModal.qrCodeData} size={180} />
              </div>

              {/* Ticket Details */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Ticket ID</span>
                  <span className="font-extrabold text-brand-orange text-sm font-mono">{activeTicketModal.ticketId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Visitor Name</span>
                  <span className="font-extrabold text-slate-900">{activeTicketModal.visitorName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Access Tier</span>
                  <span className="font-bold text-slate-800">{activeTicketModal.tierName} (₹{activeTicketModal.price})</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-slate-500 font-medium">Mandatory Entry Gate</span>
                  <span className="font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    📍 {activeTicketModal.entryZoneName}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Download / Print Ticket
                </button>
                <button
                  onClick={() => setActiveTicketModal(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
