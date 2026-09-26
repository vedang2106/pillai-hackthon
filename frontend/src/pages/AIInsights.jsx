import React, { useState } from 'react';
import Card from '../components/common/Card';
import { BrainCircuit, Send, Sparkles, CheckCircle } from 'lucide-react';

export default function AIInsights() {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'EventFlow AI Command Center active. How can I assist with crowd orchestration?'
    },
    {
      sender: 'user',
      text: 'What is happening at Gate 3 right now?'
    },
    {
      sender: 'ai',
      text: 'Gate 3 density is at 82%. Crowd accumulation rate is +120 visitors/min. High likelihood of bottleneck in 20 minutes[cite: 1].'
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Analyzing scenario for "${input}"... Recommendation: Shift 20% incoming visitors to Gate 1 and issue push alert[cite: 1].`
        }
      ]);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-orange-100 shadow-glass p-6">
        <div className="flex items-center space-x-3 text-brand-orange mb-4">
          <div className="p-2.5 bg-orange-50 rounded-xl">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">AI Command Center</h2>
            <p className="text-xs text-slate-400 font-medium">Natural Language Orchestration & Direct Actions[cite: 1]</p>
          </div>
        </div>

        {/* Chat History Box */}
        <div className="h-96 bg-slate-50 border border-slate-200 rounded-2xl p-4 overflow-y-auto space-y-4 mb-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-md p-4 rounded-2xl text-sm ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-br-none'
                    : 'bg-white border border-orange-100 text-slate-800 shadow-sm rounded-bl-none'
                }`}
              >
                {msg.sender === 'ai' && (
                  <span className="flex items-center space-x-1.5 text-xs font-bold text-brand-orange mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>EventFlow Engine</span>
                  </span>
                )}
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            placeholder="Ask AI: 'Recommend gate re-routing strategy'..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange bg-white"
          />
          <button
            type="submit"
            className="bg-brand-orange hover:bg-brand-orangeHover text-white px-5 py-3 rounded-xl font-bold transition-all shadow-shiny"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}