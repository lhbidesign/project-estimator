import { fmt } from '../utils/calc.js'

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'Just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days  < 7)  return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function EstimatesDrawer({ open, onClose, estimates, onLoad, onDelete }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${open ? 'bg-black/30 backdrop-blur-sm pointer-events-auto' : 'bg-transparent pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-[400px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
        aria-label="Saved estimates"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 flex-shrink-0">
          <div>
            <h2 className="font-black text-zinc-900 text-base" style={{ fontFamily: 'var(--font-display)' }}>
              Saved Estimates
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>
              {estimates.length} estimate{estimates.length !== 1 ? 's' : ''} saved
            </p>
          </div>
          <button
            onClick={onClose}
            className="focus-light w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4">
          {estimates.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-zinc-400 text-sm italic" style={{ fontFamily: 'var(--font-body)' }}>
                No saved estimates yet
              </p>
              <p className="text-zinc-300 text-xs mt-1" style={{ fontFamily: 'var(--font-body)' }}>
                Hit "Save" in the estimator to create one
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {estimates.map(est => (
                <div
                  key={est.id}
                  className="group border border-zinc-200 rounded-xl p-4 hover:border-zinc-400 hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => onLoad(est)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && onLoad(est)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-zinc-900 text-sm truncate"
                        style={{ fontFamily: 'var(--font-display)' }}>
                        {est.projectName || <span className="italic text-zinc-400">Untitled project</span>}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5 truncate" style={{ fontFamily: 'var(--font-body)' }}>
                        {est.clientName || '—'}{est.contact ? ` · ${est.contact}` : ''}
                      </p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); onDelete(est.id) }}
                      className="focus-light opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0 text-base"
                      aria-label="Delete estimate"
                    >
                      ×
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-100">
                    <span className="text-xs text-zinc-400" style={{ fontFamily: 'var(--font-body)' }}>
                      {timeAgo(est.savedAt)}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-zinc-700 tabular"
                        style={{ fontFamily: 'var(--font-body)' }}>
                        {fmt(est.totalBilled)}
                      </span>
                      <span
                        className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg transition-colors text-zinc-500 group-hover:text-zinc-950"
                        style={{ fontFamily: 'var(--font-body)', ...(true ? { backgroundColor: 'rgba(204,255,0,0.15)' } : {}) }}
                      >
                        Open →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
