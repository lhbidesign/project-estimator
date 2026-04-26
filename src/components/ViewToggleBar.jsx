import PresetLoader from './PresetLoader.jsx'

export default function ViewToggleBar({ view, setView, onOpenEstimates, savedCount, onLoadPreset }) {
  return (
    <div
      className="fixed left-0 right-0 z-40 no-print flex items-center px-8"
      style={{ top: '80px', height: '72px', background: 'var(--page-bg)', borderBottom: '1px solid #e4e4e7' }}
    >
      {/* Perfectly centered toggle */}
      <div className="absolute left-0 right-0 flex justify-center pointer-events-none">
        <div className="flex gap-1 bg-white border border-zinc-200 rounded-full p-1 shadow-sm pointer-events-auto">
          <button
            onClick={() => setView('internal')}
            aria-pressed={view === 'internal'}
            className={`px-8 py-3 rounded-full text-sm font-black uppercase tracking-widest transition-all duration-200 ${
              view === 'internal' ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-700'
            }`}
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Internal
          </button>
          <button
            onClick={() => setView('client')}
            aria-pressed={view === 'client'}
            className={`px-8 py-3 rounded-full text-sm font-black uppercase tracking-widest transition-all duration-200 ${
              view === 'client' ? 'text-zinc-950' : 'text-zinc-400 hover:text-zinc-700'
            }`}
            style={{
              fontFamily: 'var(--font-body)',
              ...(view === 'client' ? { backgroundColor: 'var(--lime)' } : {}),
            }}
          >
            Client
          </button>
        </div>
      </div>

      {/* Right-aligned: Estimates Log + Load Preset */}
      <div className="ml-auto flex items-center gap-3 relative z-10">
        <button
          onClick={onOpenEstimates}
          className="focus-light flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-400 px-3 py-2 rounded-lg transition-all bg-white"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Estimates
          {savedCount > 0 && (
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-500 tabular">
              {savedCount}
            </span>
          )}
        </button>

        <PresetLoader onLoad={onLoadPreset} variant="light" />
      </div>
    </div>
  )
}
