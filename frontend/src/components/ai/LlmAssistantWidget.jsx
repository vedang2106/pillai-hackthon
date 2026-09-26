import React, { useState } from 'react';
import { aiApi } from '../../services/api';
import SourceBadge from '../common/SourceBadge';
import { Bot, Send, Sparkles } from 'lucide-react';

export default function LlmAssistantWidget({ eventId }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am the EventFlow Grounded AI Assistant. Ask me anything about live risk, gate utilization, smart routes, or current event conditions.',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const samplePrompts = [
    'What is the biggest risk right now?',
    'Which gate should visitors use?',
    'What should the organizer do right now?',
    'Summarize the current city situation.',
  ];

  const handleSend = (textToSend) => {
    const q = textToSend || query;
    if (!q.trim() || loading) return;

    const userMsg = { role: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    aiApi
      .queryAssistant(q, eventId)
      .then(({ data }) => {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: data.answer || 'Insufficient data available.' },
        ]);
      })
      .catch(() => {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: 'Error connecting to Grounded AI Assistant.' },
        ]);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-[460px]">
      <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-brand-orange" />
          <h3 className="font-extrabold text-slate-900 text-lg">Grounded AI Assistant</h3>
        </div>
        <SourceBadge source="AI PREDICTION" />
      </div>

      {/* Suggested Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 shrink-0 mb-2">
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-[11px] font-extrabold whitespace-nowrap transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-brand-orange" /> {p}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-xl leading-relaxed ${
                m.role === 'user'
                  ? 'bg-brand-orange text-white rounded-br-none font-semibold'
                  : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 text-slate-500 p-3 rounded-xl border border-slate-200 animate-pulse">
              Analyzing live MongoDB & AI prediction state...
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask AI about risks, gates, routes..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-brand-orange"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !query.trim()}
          className="p-2 bg-brand-orange hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl shadow-sm transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
