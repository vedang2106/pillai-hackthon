import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import { MessageSquare, Sparkles, Star, ThumbsUp, TrendingUp, AlertCircle, Award, CheckCircle2, Filter } from 'lucide-react';
import axios from 'axios';
import io from 'socket.io-client';

export default function VisitorFeedbackAnalyticsPanel({ eventId: propEventId }) {
  const [selectedEventId, setSelectedEventId] = useState(propEventId || '66f54c98c70f45a2aade5011');
  const [signals, setSignals] = useState([]);
  const [aiReport, setAiReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const eventsList = [
    { id: '66f54c98c70f45a2aade5011', name: 'Grand Tech Expo 2026 (Live Current Event)' },
    { id: '66f54c98c70f45a2aade5022', name: 'Celestial Music Festival (Past Event)' },
    { id: '66f54c98c70f45a2aade5033', name: 'International Hackathon Summit (Past Event)' },
  ];

  const fetchSocialSignals = async () => {
    try {
      const targetId = selectedEventId;
      const res = await axios.get(`http://localhost:5000/api/social/event/${targetId}`);
      if (res.data) {
        setSignals(res.data.signals || []);
        setAiReport(res.data.aiReport);
      }
    } catch (err) {
      console.warn('VisitorFeedbackAnalyticsPanel fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocialSignals();

    const socket = io(import.meta.env.VITE_API_URL || '', {
      transports: ['websocket', 'polling'],
    });

    socket.on('social:new_comment', (newSignal) => {
      if (newSignal?.eventId === selectedEventId) {
        fetchSocialSignals();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedEventId]);

  return (
    <Card className="bg-white border-orange-100 shadow-glass space-y-6">
      {/* Event Switcher Toolbar for Organizer */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3 text-brand-orange">
          <MessageSquare className="w-6 h-6 shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-slate-900">Visitor Feedback & AI Management Analytics</h3>
            <p className="text-xs text-slate-500 font-medium">Real-time attendee feedback & AI topic analysis for organizers</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="p-2 text-xs font-bold rounded-xl border border-orange-200 bg-orange-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-orange w-full sm:w-auto"
          >
            {eventsList.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>

          {aiReport && (
            <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-50 to-amber-50 px-3.5 py-1.5 rounded-2xl border border-orange-200 shrink-0">
              <Award className="w-5 h-5 text-brand-orange" />
              <div>
                <p className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Management Grade</p>
                <span className="text-base font-black text-brand-orange">{aiReport.overallGrade} ({aiReport.overallScore}/100)</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Management Advice for Next Event */}
      {aiReport && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4.5 rounded-2xl shadow-md space-y-2 border border-slate-700">
          <div className="flex items-center space-x-2 text-brand-orange">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <h4 className="font-bold text-sm text-white">AI Management Recommendation for Next Event</h4>
          </div>
          <p className="text-xs text-slate-200 font-medium leading-relaxed pl-7">
            "{aiReport.aiAdviceForNextEvent}"
          </p>
        </div>
      )}

      {/* Sentiment Stats Breakdown */}
      {aiReport && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center">
            <span className="text-xs font-bold text-emerald-700">Positive Feedback</span>
            <p className="text-2xl font-black text-emerald-600">{aiReport.sentimentBreakdown.POSITIVE}%</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-center">
            <span className="text-xs font-bold text-amber-700">Neutral Feedback</span>
            <p className="text-2xl font-black text-amber-600">{aiReport.sentimentBreakdown.NEUTRAL}%</p>
          </div>
          <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-center">
            <span className="text-xs font-bold text-red-700">Negative / Bottleneck</span>
            <p className="text-2xl font-black text-red-600">{aiReport.sentimentBreakdown.NEGATIVE}%</p>
          </div>
        </div>
      )}

      {/* Visitor Feedback Feed List */}
      <div className="space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <ThumbsUp className="w-4 h-4 text-brand-orange" />
          Recent Attendee Posts ({signals.length})
        </h4>

        {signals.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No attendee comments submitted yet for this event.</p>
        ) : (
          signals.slice(0, 5).map((sig, idx) => (
            <div key={sig._id || idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-900">{sig.visitorName || 'Attendee'}</span>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                      sig.sentiment === 'POSITIVE'
                        ? 'bg-emerald-100 text-emerald-700'
                        : sig.sentiment === 'NEGATIVE'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {sig.sentiment}
                  </span>
                  <span className="font-bold text-amber-500 text-[11px]">{'⭐'.repeat(sig.rating || 4)}</span>
                </div>
              </div>

              <p className="text-xs text-slate-700 font-medium">"{sig.comment}"</p>

              <div className="flex flex-wrap gap-1 pt-1">
                {(sig.topics || ['GENERAL_MANAGEMENT']).map((t, tIdx) => (
                  <span key={tIdx} className="bg-white text-slate-600 text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-200">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
