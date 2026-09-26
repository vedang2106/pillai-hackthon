import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white flex items-center justify-center">
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-ef-primary font-bold text-xs mb-8">
          <ShieldCheck className="w-4 h-4" />
          <span>Predict · Prevent · Redirect</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-ef-text tracking-tight leading-tight">
          Real-time & predictive
          <br />
          <span className="text-ef-primary">event crowd intelligence</span>
        </h1>

        <p className="mt-6 text-lg text-ef-muted max-w-2xl mx-auto leading-relaxed">
          EventFlow AI connects live zone data, crowd monitoring, and government advisories through intelligent real-time traffic and safety routing.
        </p>

        <div className="mt-10 flex justify-center">
          <Link
            to="/events"
            className="bg-ef-primary hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-2xl flex items-center justify-center gap-2.5 text-lg shadow-md transition-all hover:scale-105"
          >
            View City Events & Live Map <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
