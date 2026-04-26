import { RESOURCES, PM_RATE, HOUR_GUIDES, CATEGORIES } from '../data/rates.js'
import { fmtPct } from '../utils/calc.js'

export default function RateSheet({ open, onClose }) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Rate Card"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-black text-zinc-900 font-display" style={{ fontFamily: 'var(--font-display)' }}>
              Rate Card
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>
              Internal billing rates and hour guidance
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

        <div className="px-6 py-5 space-y-8">
          {/* Billing rates */}
          <section>
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3"
              style={{ fontFamily: 'var(--font-body)' }}>
              Billing Rates
            </h3>
            <div className="border border-zinc-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200">
                    {['Designer', 'Billed / hr', 'Internal / hr', 'Gross Margin'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-zinc-500"
                        style={{ fontFamily: 'var(--font-body)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(RESOURCES).map(([, r], i, arr) => {
                    const gm = ((r.billedRate - r.internalRate) / r.billedRate) * 100
                    return (
                      <tr key={r.label} className={i < arr.length - 1 ? 'border-b border-zinc-100' : ''}>
                        <td className="px-4 py-3 font-semibold text-zinc-900" style={{ fontFamily: 'var(--font-body)' }}>
                          {r.label}
                        </td>
                        <td className="px-4 py-3 tabular font-semibold text-zinc-900" style={{ fontFamily: 'var(--font-body)' }}>
                          ${r.billedRate}
                        </td>
                        <td className="px-4 py-3 tabular text-zinc-500" style={{ fontFamily: 'var(--font-body)' }}>
                          ${r.internalRate}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            gm >= 40 ? 'bg-green-50 text-green-700' : gm >= 25 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {fmtPct(gm)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                  <tr className="border-t-2 border-zinc-200 bg-zinc-50">
                    <td className="px-4 py-3 font-semibold text-zinc-900" style={{ fontFamily: 'var(--font-body)' }}>
                      Dee (PM)
                    </td>
                    <td className="px-4 py-3 text-zinc-400 italic text-xs" style={{ fontFamily: 'var(--font-body)' }}>
                      overhead %
                    </td>
                    <td className="px-4 py-3 tabular text-zinc-500" style={{ fontFamily: 'var(--font-body)' }}>
                      ${PM_RATE}
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-xs" style={{ fontFamily: 'var(--font-body)' }}>
                      —
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Hour guides */}
          <section>
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3"
              style={{ fontFamily: 'var(--font-body)' }}>
              Typical Hour Ranges
            </h3>
            {CATEGORIES.map(cat => (
              <div key={cat.id} className="mb-4">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2"
                  style={{ fontFamily: 'var(--font-body)' }}>
                  {cat.label}
                </p>
                <div className="border border-zinc-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody>
                      {HOUR_GUIDES.filter(g => g.category === cat.id).map((g, i, arr) => (
                        <tr key={g.name} className={i < arr.length - 1 ? 'border-b border-zinc-100' : ''}>
                          <td className="px-4 py-2.5 text-zinc-700" style={{ fontFamily: 'var(--font-body)' }}>
                            {g.name}
                          </td>
                          <td className="px-4 py-2.5 text-right tabular text-zinc-500 font-semibold whitespace-nowrap"
                            style={{ fontFamily: 'var(--font-body)' }}>
                            {g.min}–{g.max} hrs
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  )
}
