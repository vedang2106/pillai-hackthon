export default function SourceBadge({ source = 'SIMULATED' }) {
  const label = source === 'SIMULATED' ? 'LIVE SIMULATION' : source.replace('_', ' ');
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-orange-50 text-ef-primary border border-orange-200">
      {label}
    </span>
  );
}
