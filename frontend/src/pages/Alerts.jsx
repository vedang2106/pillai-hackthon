import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import { Bell, Clock, MessageSquare, Send, Sparkles, ThumbsUp, AlertTriangle, ShieldCheck, Tag } from 'lucide-react';
import axios from 'axios';

export default function Alerts() {
  const [comments, setComments] = useState([]);
  const [aiReport, setAiReport] = useState(null);
  const [visitorName, setVisitorName] = useState('');
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  // Mock initial event ID for demo
  const sampleEventId = '66f54c98c70f45a2aade5011';

  const fetchSocialSignals = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/social/event/${sampleEventId}`);
      if (res.data) {
        setComments(res.data.signals || []);
        setAiReport(res.data.aiReport);
      }
    } catch (err) {
      console.warn('Failed to fetch social signals:', err);
    }
  };

  useEffect(() => {
    fetchSocialSignals();
  }, []);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/social/comments', {
        eventId: sampleEventId,
        visitorName: visitorName || 'Attendee Visitor',
        comment: newComment,
        rating: Number(rating),
      });
      setNewComment('');
      fetchSocialSignals();
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const alertsList = [
    {
      id: 1,
      type: 'critical',
      title: 'Gate 3 Congestion Risk Predicted',
      desc: 'Occupancy reaching 82%. AI recommends redirecting visitors to Gate 1.',
      time: '2 mins ago',
      status: 'Active',
    },
    {
      id: 2,
      type: 'warning',
      title: 'Central Metro Station Load Exceeding 85%',
      desc: 'Increased wait times anticipated. Extra shuttles dispatched.',
      time: '12 mins ago',
      status: 'In Progress',
    },
    {
      id: 3,
      type: 'success',
      title: 'North Zone Gate Flow Resolved',
      desc: 'Rerouting successfully reduced Gate A congestion back to 35%.',
      time: '25 mins ago',
      status: 'Resolved',
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-glass flex justify-between items-center">
        <div className="flex items-center space-x-3 text-brand-orange">
          <Bell className="w-7 h-7" />
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Incident & Visitor Social Signal Center</h2>
            <p className="text-xs text-slate-500 font-medium">Real-time alerts, visitor comments & AI sentiment analytics</p>
          </div>
        </div>
        <span className="bg-red-100 text-red-600 px-3.5 py-1.5 rounded-full text-xs font-bold border border-red-200">
          1 Active Critical Alert
        </span>
      </div>

      {/* Incident Alerts List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Live Safety & Capacity Alerts
        </h3>
        {alertsList.map((alert) => (
          <Card
            key={alert.id}
            className={`border-l-4 ${
              alert.type === 'critical'
                ? 'border-l-red-500'
                : alert.type === 'warning'
                ? 'border-l-amber-500'
                : 'border-l-emerald-500'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-slate-900">{alert.title}</h4>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      alert.type === 'critical'
                        ? 'bg-red-100 text-red-600'
                        : alert.type === 'warning'
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-emerald-100 text-emerald-600'
                    }`}
                  >
                    {alert.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600 font-medium">{alert.desc}</p>
              </div>
              <span className="text-xs text-slate-400 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{alert.time}</span>
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* VISITOR COMMENTS & SOCIAL SIGNALS SECTION */}
      <div className="space-y-6 pt-4 border-t border-slate-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-brand-orange" />
              Visitor Feedback & Social Signal Feed
            </h3>
            <p className="text-xs text-slate-500">Attendees can submit live feedback. AI extracts topics, sentiment & management scores in real-time.</p>
          </div>
          {aiReport && (
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-3 rounded-xl border border-orange-200 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-brand-orange animate-pulse" />
              <div>
                <p className="text-xs font-bold text-slate-700">AI Management Grade</p>
                <span className="text-lg font-black text-brand-orange">{aiReport.overallGrade} ({aiReport.overallScore}/100)</span>
              </div>
            </div>
          )}
        </div>

        {/* Post Comment Form */}
        <Card className="bg-slate-50 border-orange-200">
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-brand-orange" />
              Leave Visitor Comment / Report Management Experience
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Your Name (Optional)"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                className="p-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-orange bg-white"
              />
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="p-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-orange bg-white font-medium"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5/5 - Excellent Management)</option>
                <option value={4}>⭐⭐⭐⭐ (4/5 - Good Management)</option>
                <option value={3}>⭐⭐⭐ (3/5 - Average Flow)</option>
                <option value={2}>⭐⭐ (2/5 - Heavy Bottleneck)</option>
                <option value={1}>⭐ (1/5 - Poor Experience)</option>
              </select>
            </div>
            <textarea
              rows={2}
              placeholder="e.g. 'Food court is super crowded, but Gate 2 entry was very fast and smooth!'"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-orange bg-white"
              required
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-slate-400">🤖 AI will instantly analyze topic, sentiment & management impact upon submit.</p>
              <button
                type="submit"
                disabled={submitting}
                className="bg-brand-orange text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Analyzing & Posting...' : 'Submit Visitor Report'}
              </button>
            </div>
          </form>
        </Card>

        {/* Visitor Comments Feed */}
        <div className="space-y-4">
          <h4 className="font-bold text-sm text-slate-700 flex items-center gap-2">
            <Tag className="w-4 h-4 text-brand-orange" />
            Analyzed Visitor Signals ({comments.length})
          </h4>
          {comments.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400 text-sm">
              No visitor comments posted yet. Submit the first comment above to test AI sentiment analysis!
            </div>
          ) : (
            comments.map((c, i) => (
              <Card key={c._id || i} className="bg-white border-slate-200">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-brand-orange flex items-center justify-center font-bold text-xs">
                      {c.visitorName ? c.visitorName[0] : 'V'}
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">{c.visitorName}</h5>
                      <span className="text-[10px] text-slate-400">
                        {c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Sentiment Badge */}
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                        c.sentiment === 'POSITIVE'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : c.sentiment === 'NEGATIVE'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {c.sentiment} SENTIMENT
                    </span>
                    <span className="text-xs font-bold text-amber-500">{'⭐'.repeat(c.rating || 4)}</span>
                  </div>
                </div>

                <p className="text-slate-800 text-sm font-medium mb-3 pl-11">"{c.comment}"</p>

                {/* AI Extracted Topic Badges & Summary */}
                <div className="pl-11 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] font-bold text-slate-400">AI Topics:</span>
                    {(c.topics || ['GENERAL_MANAGEMENT']).map((t, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-slate-200">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <div className="text-[11px] text-brand-orange font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>AI Note: {c.aiSummary}</span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}