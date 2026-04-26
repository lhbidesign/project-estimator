import ViewToggle from './ViewToggle.jsx'
import PresetLoader from './PresetLoader.jsx'

const PAGES = [
  { id: 'estimator', label: 'Estimator' },
  { id: 'rate-card', label: 'Rate Card'  },
  { id: 'generate',  label: 'Generate'   },
  { id: 'settings',  label: 'Settings'   },
]

export default function EstimatorHeader({
  page, setPage,
  view, setView,
  onLoadPreset,
  onSave, justSaved,
  savedCount, onOpenHistory,
}) {
  const isClient = view === 'client'

  return (
    <nav
      className="no-print fixed top-0 w-full z-50 flex items-center justify-between px-8 h-[68px]"
      style={{
        background: 'rgba(12,12,12,0.94)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Wordmark lockup */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <img src="/lh-logo.png" alt="Little House" className="h-6 w-auto"
          style={{ filter: 'brightness(0) invert(1)' }} />
        <span className="text-white font-bold text-sm tracking-wide"
          style={{ fontFamily: 'var(--font-display)' }}>
          Studio
        </span>
        <span className="text-white/25 text-base font-thin select-none">|</span>
        <span className="text-white/50 text-xs font-semibold tracking-widest uppercase"
          style={{ fontFamily: 'var(--font-body)' }}>
          Estimator
        </span>
      </div>

      {/* Center — page tabs (internal only) */}
      {!isClient && (
        <div className="flex items-end gap-0 h-full absolute left-1/2 -translate-x-1/2" role="tablist">
          {PAGES.map(p => (
            <button
              key={p.id}
              role="tab"
              aria-selected={page === p.id}
              onClick={() => setPage(p.id)}
              className="relative px-5 h-full flex items-center font-extrabold text-sm tracking-wide transition-colors duration-200"
              style={{
                fontFamily: 'var(--font-display)',
                color: page === p.id ? '#fff' : 'rgba(255,255,255,0.35)',
              }}
            >
              {p.label}
              {page === p.id && (
                <span
                  className="absolute bottom-0 left-5 right-5 h-[3px] rounded-full"
                  style={{ backgroundColor: 'var(--lime)' }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Right controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {page === 'estimator' && !isClient && (
          <>
            {/* History button */}
            <button
              onClick={onOpenHistory}
              className="flex items-center gap-1.5 text-white/50 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
              style={{ fontFamily: 'var(--font-body)' }}
              aria-label="View saved estimates"
            >
              History
              {savedCount > 0 && (
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-white/10 text-white/60 tabular">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Save button */}
            <button
              onClick={onSave}
              className="text-xs font-bold uppercase tracking-wider transition-all px-3 py-1.5 rounded-lg"
              style={{
                fontFamily: 'var(--font-body)',
                ...(justSaved
                  ? { backgroundColor: 'rgba(204,255,0,0.15)', color: 'var(--lime)' }
                  : { color: 'rgba(255,255,255,0.5)', background: 'transparent' }
                ),
              }}
              aria-label="Save estimate"
            >
              {justSaved ? '✓ Saved' : 'Save'}
            </button>

            <div className="w-px h-4 bg-white/10" />
            <PresetLoader onLoad={onLoadPreset} />
          </>
        )}

        <ViewToggle view={view} setView={setView} />
      </div>
    </nav>
  )
}
