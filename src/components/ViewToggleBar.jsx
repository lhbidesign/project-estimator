export default function ViewToggleBar({ view, setView }) {
  return (
    <div
      className="fixed left-0 right-0 z-40 no-print flex items-center justify-center"
      style={{ top: '68px', height: '52px', background: 'var(--page-bg)', borderBottom: '1px solid #e4e4e7' }}
    >
      <div className="flex gap-1 bg-white border border-zinc-200 rounded-full p-1 shadow-sm">
        <button
          onClick={() => setView('internal')}
          aria-pressed={view === 'internal'}
          className={`px-8 py-2 rounded-full text-sm font-black uppercase tracking-widest transition-all duration-200 ${
            view === 'internal' ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-700'
          }`}
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Internal
        </button>
        <button
          onClick={() => setView('client')}
          aria-pressed={view === 'client'}
          className={`px-8 py-2 rounded-full text-sm font-black uppercase tracking-widest transition-all duration-200 ${
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
  )
}
