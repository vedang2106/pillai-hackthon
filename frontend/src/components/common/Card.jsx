import React from 'react';

export default function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl border border-orange-100 shadow-glass p-6 transition-all ${className}`}>
      {children}
    </div>
  );
}