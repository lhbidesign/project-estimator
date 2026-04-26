export default function ViewToggle({ view, setView }) {
  return (
    <div className="flex items-center gap-1 bg-white/10 rounded-full p-1" role="group" aria-label="Switch view">
      {[['internal', 'Internal'], ['client', 'Client']].map(([val, label]) => (
        <button
          key={val}
          onClick={() => setView(val)}
          aria-pressed={view === val}
          className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-200 ${
            view === val ? 'text-zinc-950' : 'text-white/60 hover:text-white'
          }`}
          style={view === val ? { backgroundColor: 'var(--lime)' } : {}}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
