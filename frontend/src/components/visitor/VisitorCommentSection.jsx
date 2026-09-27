import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, ThumbsUp, Tag, Star, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';

export default function VisitorCommentSection({ eventId, allowSubmission }) {
  const { user, isOrganizer } = useAuth();
  const targetEventId = eventId || '66f54c98c70f45a2aade5011';

  // Allow submission if explicitly passed, or default to false for organizers and true for visitors
  const canSubmit = allowSubmission !== undefined ? allowSubmission : !isOrganizer;

  const [comments, setComments] = useState([]);
  const [aiReport, setAiReport] = useState(null);
  const [visitorName, setVisitorName] = useState(user?.name || '');
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [lastPostedSignal, setLastPostedSignal] = useState(null);

  const fetchSocialSignals = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/social/event/${targetEventId}`);
      if (res.data) {
        setComments(res.data.signals || []);
        setAiReport(res.data.aiReport);
      }
    } catch (err) {
      console.warn('VisitorCommentSection fetch error:', err.message);
    }
  };

  useEffect(() => {
    fetchSocialSignals();

    const socket = io(import.meta.env.VITE_API_URL || '', {
      transports: ['websocket', 'polling'],
    });

    socket.emit('join:event', targetEventId);
    socket.on('social:new_comment', () => {
      fetchSocialSignals();
    });

    return () => {
      socket.disconnect();
    };
  }, [targetEventId]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const res = await axios.post('http://localhost:5000/api/social/comments', {
        eventId: targetEventId,
        visitorName: visitorName || (user ? user.name : 'Event Visitor'),
        comment: newComment,
        rating: Number(rating),
      });

      if (res.data?.signal) {
        setLastPostedSignal(res.data.signal);
        setNewComment('');
        fetchSocialSignals();
      }
    } catch (err) {
      console.error('Error submitting visitor comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const { isGovernment } = useAuth();
  const isAuthority = isOrganizer || isGovernment;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3 text-brand-orange">
          <MessageSquare className="w-7 h-7 shrink-0" />
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              {isAuthority ? '🛡️ Public Safety & Social Sentiment Monitor' : 'Attendee Experience Feedback & AI Sentiment'}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {isAuthority
                ? 'Live audit of attendee feedback, extracted AI topics, and real-time sentiment impact.'
                : 'Share your entry, crowd flow, or facility experience. EventFlow AI extracts operational topics in real-time.'}
            </p>
          </div>
        </div>

        {aiReport && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-2 rounded-2xl border border-orange-200 flex items-center gap-2.5 shrink-0">
            <Sparkles className="w-5 h-5 text-brand-orange animate-pulse" />
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Overall Event Score</p>
              <span className="text-base font-black text-brand-orange">
                Grade {aiReport.overallGrade} ({aiReport.overallScore}/100)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* AI Sentiment Distribution Summary Cards */}
      {aiReport && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-center">
            <span className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider">Positive Sentiment</span>
            <p className="text-xl font-black text-emerald-600">{aiReport.sentimentBreakdown?.POSITIVE ?? 80}%</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-center">
            <span className="text-[10px] font-extrabold uppercase text-amber-700 tracking-wider">Neutral Sentiment</span>
            <p className="text-xl font-black text-amber-600">{aiReport.sentimentBreakdown?.NEUTRAL ?? 15}%</p>
          </div>
          <div className="bg-red-50 border border-red-200 p-3 rounded-2xl text-center">
            <span className="text-[10px] font-extrabold uppercase text-red-700 tracking-wider">Negative / Bottleneck</span>
            <p className="text-xl font-black text-red-600">{aiReport.sentimentBreakdown?.NEGATIVE ?? 5}%</p>
          </div>
        </div>
      )}

      {/* Visitor Feedback Form (Only rendered if canSubmit is true) */}
      {canSubmit && (
        <form onSubmit={handleSubmitComment} className="bg-slate-50 border border-orange-200 p-5 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-brand-orange" />
              Rate Event & Submit Visitor Comment
            </h3>
            <span className="text-[10px] bg-orange-100 text-brand-orange font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Instant EventFlow AI Topic Extraction
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Your Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-orange bg-white font-medium"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Management Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-orange bg-white font-bold"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5/5 - Smooth Entry & Flow)</option>
                <option value={4}>⭐⭐⭐⭐ (4/5 - Good Organization)</option>
                <option value={3}>⭐⭐⭐ (3/5 - Average Experience)</option>
                <option value={2}>⭐⭐ (2/5 - Heavy Bottleneck / Slow)</option>
                <option value={1}>⭐ (1/5 - Poor Management)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Your Comment / Experience Report</label>
            <textarea
              rows={3}
              placeholder="e.g., 'Main gate entry was very fast and organized! But washrooms near Stage B were crowded around 8 PM.'"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-orange bg-white text-slate-900 font-medium"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <p className="text-[11px] text-slate-400">
              🤖 AI automatically detects topics (#GATE_ENTRY, #CROWD_SAFETY, #FACILITIES) and notifies event organizers.
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="bg-brand-orange hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 shrink-0"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Analyzing & Posting...' : 'Submit Visitor Comment'}
            </button>
          </div>
        </form>
      )}

      {/* Confirmation of Last Posted Signal */}
      {lastPostedSignal && (
        <div
          className={`p-4 rounded-2xl space-y-2 animate-in zoom-in-95 border ${
            lastPostedSignal.sentiment === 'NEGATIVE'
              ? 'bg-red-50 border-red-300 text-red-900'
              : lastPostedSignal.sentiment === 'NEUTRAL'
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-emerald-50 border-emerald-300 text-emerald-900'
          }`}
        >
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2
                className={`w-5 h-5 ${
                  lastPostedSignal.sentiment === 'NEGATIVE'
                    ? 'text-red-600'
                    : lastPostedSignal.sentiment === 'NEUTRAL'
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              />
              Comment Posted & Analyzed by AI!
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full font-black text-[10px] ${
                lastPostedSignal.sentiment === 'NEGATIVE'
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : lastPostedSignal.sentiment === 'NEUTRAL'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              {lastPostedSignal.sentiment} SENTIMENT
            </span>
          </div>

          <p className="text-xs italic">"{lastPostedSignal.comment}"</p>

          <div className="flex items-center gap-2 text-[11px] pt-1">
            <span className="font-bold opacity-75">AI Topics Extracted:</span>
            {(lastPostedSignal.topics || []).map((t, i) => (
              <span key={i} className="bg-white text-slate-800 font-black px-2 py-0.5 rounded-md border border-slate-200">
                #{t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Live Visitor Feed List */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Tag className="w-4 h-4 text-brand-orange" />
          Recent Visitor Comments ({comments.length})
        </h3>

        {comments.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            No visitor comments posted yet. Submit your feedback above to trigger live AI topic analysis!
          </div>
        ) : (
          comments.map((c, i) => (
            <div key={c._id || i} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-full bg-orange-100 text-brand-orange font-extrabold text-xs flex items-center justify-center">
                    {c.visitorName ? c.visitorName[0].toUpperCase() : 'V'}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs">{c.visitorName || 'Attendee'}</h4>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[9px] font-black px-2.5 py-1 rounded-full ${
                      c.sentiment === 'POSITIVE'
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : c.sentiment === 'NEGATIVE'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {c.sentiment}
                  </span>
                  <span className="text-xs font-bold text-amber-500">{'⭐'.repeat(c.rating || 4)}</span>
                </div>
              </div>

              <p className="text-slate-800 text-xs font-medium pl-9 leading-relaxed">"{c.comment}"</p>

              <div className="pl-9 pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-slate-400 font-bold">AI Topics:</span>
                  {(c.topics || ['GENERAL_MANAGEMENT']).map((t, idx) => (
                    <span key={idx} className="bg-white text-slate-700 font-extrabold px-2 py-0.5 rounded-md border border-slate-200">
                      #{t}
                    </span>
                  ))}
                </div>

                {c.aiSummary && (
                  <span className="text-brand-orange font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI Note: {c.aiSummary}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
