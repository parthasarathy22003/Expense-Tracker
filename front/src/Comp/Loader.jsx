export default function Loader({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-3 py-10 text-slate-500 ${className}`}>
      <svg className="h-5 w-5 animate-spin text-brand-600" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
        <path
          d="M22 12a10 10 0 0 0-10-10"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-sm">{label}</span>
    </div>
  );
}