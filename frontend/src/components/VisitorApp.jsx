import React, { useState } from 'react';
import { Navigation, Compass, MapPin, CheckCircle, MessageSquare, Send, Sparkles, ThumbsUp, Tag } from 'lucide-react';
import axios from 'axios';

export default function VisitorApp({ data }) {
  const isCongested = data?.zones?.[0]?.occupancy > 80;
  const sampleEventId = data?.eventId || '66f54c98c70f45a2aade5011';

  const [visitorName, setVisitorName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [lastPostedSignal, setLastPostedSignal] = useState(null);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const res = await axios.post('http://localhost:5000/api/social/comments', {
        eventId: sampleEventId,
        visitorName: visitorName || 'Event Visitor',
        comment: commentText,
        rating: Number(rating),
      });
      if (res.data?.signal) {
        setLastPostedSignal(res.data.signal);
        setCommentText('');
      }
    } catch (err) {
      console.error('Failed to post comment from VisitorApp:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const zonesList = data?.zones || [];
  const activeDangerZone = zonesList.find(
    (z) => z.gateStatus === 'DANGER' || z.gateStatus === 'CLOSED' || z.gateStatus === 'REROUTED' || z.crowdLevel === 'CRITICAL' || !!z.redirectGateName
  );
  const isCongested = activeDangerZone || zonesList[0]?.utilizationPercent > 80;

  return (
    <div className="max-w-md mx-auto bg-white rounded-3xl border border-orange-100 shadow-shiny overflow-hidden">
      {/* Mobile Header */}
      <div className="bg-gradient-to-r from-brand-orange to-brand-orangeLight p-6 text-white text-center">
        <Compass className="w-10 h-10 mx-auto mb-2 animate-pulse" />
        <h2 className="text-xl font-bold">EventFlow Visitor Guide</h2>
        <p className="text-xs text-orange-100 mt-1">Less crowd. More experience!</p>
      </div>

      <div className="p-6 space-y-5">
        {/* Urgent Gate Change / Danger Alert Banner from Organizer */}
        {activeDangerZone && (
          <div className="bg-rose-500 text-white p-5 rounded-2xl shadow-lg animate-pulse border border-rose-600 space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-white text-rose-600 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                🚨 URGENT GATE CHANGE
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wide">
                Zone Danger Directive
              </span>
            </div>
            <h3 className="font-extrabold text-base leading-tight">
              {activeDangerZone.name} is Closed / Danger Zone!
            </h3>
            <p className="text-xs text-rose-100 font-semibold leading-relaxed">
              {activeDangerZone.redirectNotice ||
                `Event Organizers have closed entry at ${activeDangerZone.name} due to high crowd density.`}
            </p>
            {activeDangerZone.redirectGateName && (
              <div className="pt-1 flex items-center justify-between bg-rose-600/80 p-2.5 rounded-xl border border-rose-400">
                <span className="text-xs font-bold text-white">
                  🔀 New Target Gate: <strong className="underline decoration-amber-300 font-black text-amber-200">{activeDangerZone.redirectGateName}</strong>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Active Route Suggestion Card */}
        <div className={`p-5 rounded-2xl border ${
          isCongested ? 'bg-orange-50 border-orange-300' : 'bg-emerald-50 border-emerald-300'
        }`}>
          <div className="flex items-center space-x-3 mb-2">
            <Navigation className={`w-5 h-5 ${isCongested ? 'text-brand-orange' : 'text-emerald-600'}`} />
            <h3 className="font-bold text-slate-800">Smart Route Recommendation</h3>
          </div>
          <p className="text-sm font-semibold text-slate-700">
            {activeDangerZone
              ? `⚠️ Gate changed by Organizer! Proceed to ${activeDangerZone.redirectGateName || 'Gate 8'} — 6 min walk (Less Crowd)`
              : isCongested 
              ? '⚠️ Main Gate congested! Go to Gate 8 — 8 min walk (Less Crowd)' 
              : '✅ Main Gate is operating normally. Estimated wait time: 3 mins'}
          </p>
        </div>

        {/* Visitor Comment & AI Sentiment Submission Widget */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-orange-200 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-brand-orange" />
              Rate Event & Leave Feedback
            </h4>
            <span className="text-[10px] bg-orange-100 text-brand-orange font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI Analyzed
            </span>
          </div>

          <form onSubmit={handleSubmitComment} className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Your Name (Optional)"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                className="p-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-orange bg-white"
              />
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="p-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-orange bg-white font-medium"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                <option value={3}>⭐⭐⭐ (3/5)</option>
                <option value={2}>⭐⭐ (2/5)</option>
                <option value={1}>⭐ (1/5)</option>
              </select>
            </div>
            <textarea
              rows={2}
              placeholder="e.g. 'Gate entry was super smooth, but food court needs more seats!'"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-orange bg-white"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-orange text-white py-2 rounded-xl text-xs font-bold hover:bg-orange-600 transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Analyzing & Posting...' : 'Submit Feedback to Organizer'}
            </button>
          </form>

          {/* AI Analysis Confirmation */}
          {lastPostedSignal && (
            <div className="p-3 bg-white rounded-xl border border-emerald-300 space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Feedback Received & Sent to Organizer!
                </span>
                <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md">
                  {lastPostedSignal.sentiment} SENTIMENT
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                <Tag className="w-3 h-3 text-brand-orange" />
                <span>Extracted AI Topics:</span>
                {(lastPostedSignal.topics || []).map((t, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-700 font-bold px-1 rounded">#{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Alternative Stay Finder */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1">
              <MapPin className="w-4 h-4 text-brand-orange" /> Nearby Stays
            </h4>
            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">85% booked</span>
          </div>
          <div className="space-y-2">
            <div className="p-2.5 bg-slate-50 rounded-xl flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-slate-800">Grand Stay Hotel</p>
                <p className="text-slate-400">Zone B • 1.2 km away</p>
              </div>
              <span className="font-bold text-brand-orange">₹3,500/night</span>
            </div>
          </div>
        </div>

        {/* Live Transit Updates */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="font-bold text-slate-800 text-sm mb-2">Transit Real-Time Update</h4>
          <div className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-xl">
            <span className="text-slate-600">Metro Line 1 (Central)</span>
            <span className="font-bold text-emerald-600">Next Train in 8 mins</span>
          </div>
        </div>
      </div>
    </div>
  );
}