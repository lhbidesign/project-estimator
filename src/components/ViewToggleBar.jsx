import PresetLoader from './PresetLoader.jsx'

export default function ViewToggleBar({ view, setView, onOpenEstimates, savedCount, onLoadPreset }) {
  return (
    <div
      className="fixed left-0 right-0 z-40 no-print flex items-center px-4 sm:px-8"
      style={{ top: '80px', height: '64px', background: 'var(--page-bg)', borderBottom: '1px solid #e4e4e7' }}
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

      {/* Right-aligned: Estimates Log + Load Preset — internal only */}
      {view === 'internal' && (
        <div className="ml-auto flex items-center gap-2 sm:gap-3 relative z-10">
          {/* Mobile: icon-only estimates button */}
          <button
            onClick={onOpenEstimates}
            className="sm:hidden focus-light flex items-center gap-1 text-xs font-bold text-zinc-500 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-400 px-2.5 py-2 rounded-lg transition-all bg-white"
            style={{ fontFamily: 'var(--font-body)' }}
            aria-label="Estimates"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" /><line x1="9" y1="7" x2="15" y2="7" /><line x1="9" y1="11" x2="15" y2="11" /><line x1="9" y1="15" x2="12" y2="15" />
            </svg>
            {savedCount > 0 && (
              <span className="text-[10px] font-black px-1 py-0.5 rounded-full bg-zinc-100 text-zinc-500 tabular">{savedCount}</span>
            )}
          </button>

          {/* Desktop: full text button */}
          <button
            onClick={onOpenEstimates}
            className="hidden sm:flex focus-light items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-400 px-3 py-2 rounded-lg transition-all bg-white"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Estimates
            {savedCount > 0 && (
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-500 tabular">{savedCount}</span>
            )}
          </button>

          <div className="hidden sm:block"><PresetLoader onLoad={onLoadPreset} variant="light" /></div>
        </div>
      )}
    </div>
  )
}
