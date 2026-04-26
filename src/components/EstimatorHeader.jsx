import PresetLoader from './PresetLoader.jsx'

const PAGES = [
  { id: 'estimator', label: 'Estimator' },
  { id: 'generate',  label: 'Generate'  },
  { id: 'rate-card', label: 'Rate Card' },
]

function GearIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function UndoIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  )
}

function RedoIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
    </svg>
  )
}

export default function EstimatorHeader({
  page, setPage,
  onLoadPreset,
  onOpenHistory, savedCount,
  onUndo, onRedo, canUndo, canRedo,
  onOpenSettings,
}) {
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
      {/* Wordmark */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <img
          src={`${import.meta.env.BASE_URL}lh-logo.png`}
          alt="Little House"
          className="h-6 w-auto"
          style={{ filter: 'brightness(0) invert(1)' }}
        />
        <span className="text-white font-bold text-sm tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
          Studio
        </span>
        <span className="text-white/25 text-base font-thin select-none">|</span>
        <span className="text-white/50 text-xs font-semibold tracking-widest uppercase" style={{ fontFamily: 'var(--font-body)' }}>
          Estimator
        </span>
      </div>

      {/* Center — page tabs (always visible) */}
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

      {/* Right controls */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {page === 'estimator' && (
          <>
            {/* Undo / Redo */}
            <button
              onClick={onUndo} disabled={!canUndo}
              className="focus-light w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
              aria-label="Undo (⌘Z)"
              title="Undo (⌘Z)"
            >
              <UndoIcon />
            </button>
            <button
              onClick={onRedo} disabled={!canRedo}
              className="focus-light w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
              aria-label="Redo (⌘⇧Z)"
              title="Redo (⌘⇧Z)"
            >
              <RedoIcon />
            </button>

            <div className="w-px h-4 bg-white/10 mx-1" />

            {/* History */}
            <button
              onClick={onOpenHistory}
              className="flex items-center gap-1.5 text-white/50 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              History
              {savedCount > 0 && (
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-white/10 text-white/60 tabular">
                  {savedCount}
                </span>
              )}
            </button>

            <PresetLoader onLoad={onLoadPreset} />
            <div className="w-px h-4 bg-white/10 mx-1" />
          </>
        )}

        {/* Gear / Settings */}
        <button
          onClick={onOpenSettings}
          className={`focus-light w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            page === 'settings'
              ? 'text-white bg-white/15'
              : 'text-white/40 hover:text-white hover:bg-white/10'
          }`}
          aria-label="Settings"
          title="Settings"
        >
          <GearIcon />
        </button>
      </div>
    </nav>
  )
}
