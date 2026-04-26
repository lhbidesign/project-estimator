import { useState } from 'react'
import { nanoid } from '../utils/nanoid.js'
import { fmt } from '../utils/calc.js'

const TYPES = [
  { key: 'design',    label: 'Design',      resource: null,              rate: 150, category: 'graphic_design', name: 'General Design Hours'     },
  { key: 'rendering', label: 'Rendering',   resource: 'mostafa_general', rate: 150, category: 'renderings',     name: 'General Rendering Hours'  },
  { key: 'oncall',    label: 'On-Call',     resource: 'mostafa_oncall',  rate: 200, category: 'renderings',     name: 'On-Call / Rush Hours'     },
]

export default function BudgetCalculator({ pmPercent, projectDesigner, onAddItems }) {
  const [open,     setOpen]     = useState(false)
  const [mode,     setMode]     = useState('budget')
  const [budget,   setBudget]   = useState('')
  const [allocs,   setAllocs]   = useState({ design: '', rendering: '', oncall: '' })
  const [hrs,      setHrs]      = useState({ design: '', rendering: '', oncall: '' })

  const totalBudget   = parseFloat(budget) || 0
  const afterPM       = totalBudget > 0 ? totalBudget / (1 + pmPercent / 100) : 0
  const totalAllocated = TYPES.reduce((s, t) => s + (parseFloat(allocs[t.key]) || 0), 0)
  const remaining     = afterPM - totalAllocated

  function getHours(key) {
    const t   = TYPES.find(x => x.key === key)
    const $ = parseFloat(allocs[key]) || 0
    return $ > 0 ? +($ / t.rate).toFixed(1) : 0
  }

  // Hours mode totals
  const hrsSubtotal = TYPES.reduce((s, t) => s + (parseFloat(hrs[t.key]) || 0) * t.rate, 0)
  const hrsPmCost   = hrsSubtotal * (pmPercent / 100)
  const hrsTotal    = hrsSubtotal + hrsPmCost

  function buildItems() {
    return TYPES.flatMap(t => {
      const h = mode === 'budget' ? getHours(t.key) : (parseFloat(hrs[t.key]) || 0)
      if (h <= 0) return []
      return [{ id: nanoid(), name: t.name, resource: t.resource ?? projectDesigner, hours: h, category: t.category }]
    })
  }

  function addItems() {
    const items = buildItems()
    if (items.length) onAddItems(items)
  }

  const hasResults = mode === 'budget'
    ? totalBudget > 0 && totalAllocated > 0
    : TYPES.some(t => parseFloat(hrs[t.key]) > 0)

  return (
    <div className="mb-5 border border-zinc-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(v => !v)}
        className="focus-light w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-zinc-50 transition-colors"
        aria-expanded={open}
      >
        <span className="text-xs font-black uppercase tracking-widest text-zinc-500"
          style={{ fontFamily: 'var(--font-body)' }}>
          Budget Calculator
        </span>
        <svg className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-zinc-100 px-5 py-5">
          {/* Mode toggle */}
          <div className="flex gap-1 bg-zinc-100 rounded-lg p-1 w-fit mb-5">
            {[['budget', 'By Budget'], ['hours', 'By Hours']].map(([val, lbl]) => (
              <button
                key={val}
                onClick={() => setMode(val)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all focus-light ${
                  mode === val ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
                }`}
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {lbl}
              </button>
            ))}
          </div>

          {mode === 'budget' ? (
            <div className="space-y-4">
              {/* Total budget input */}
              <div className="flex items-end gap-6 flex-wrap">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-1.5"
                    style={{ fontFamily: 'var(--font-body)' }}>
                    Total Client Budget
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-semibold">$</span>
                    <input
                      type="number" value={budget} onChange={e => setBudget(e.target.value)}
                      placeholder="10,000"
                      className="focus-light pl-7 pr-3 py-2 border border-zinc-200 rounded-lg text-sm font-semibold text-zinc-900 bg-white w-36 outline-none focus:border-zinc-900 tabular"
                      style={{ fontFamily: 'var(--font-body)' }}
                    />
                  </div>
                </div>
                {afterPM > 0 && (
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-1"
                      style={{ fontFamily: 'var(--font-body)' }}>
                      After PM ({pmPercent}%)
                    </p>
                    <p className="text-sm font-bold text-zinc-700 tabular">{fmt(afterPM)}</p>
                  </div>
                )}
              </div>

              {/* Allocation rows — only show when budget is entered */}
              {afterPM > 0 && (
                <div className="border border-zinc-100 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-100">
                        <th className="px-4 py-2.5 text-left text-xs font-black uppercase tracking-wider text-zinc-400"
                          style={{ fontFamily: 'var(--font-body)' }}>Type</th>
                        <th className="px-4 py-2.5 text-left text-xs font-black uppercase tracking-wider text-zinc-400"
                          style={{ fontFamily: 'var(--font-body)' }}>$ Allocated</th>
                        <th className="px-4 py-2.5 text-left text-xs font-black uppercase tracking-wider text-zinc-400"
                          style={{ fontFamily: 'var(--font-body)' }}>Rate</th>
                        <th className="px-4 py-2.5 text-left text-xs font-black uppercase tracking-wider text-zinc-400"
                          style={{ fontFamily: 'var(--font-body)' }}>Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TYPES.map(t => (
                        <tr key={t.key} className="border-b border-zinc-50 last:border-0">
                          <td className="px-4 py-3 text-sm font-semibold text-zinc-700"
                            style={{ fontFamily: 'var(--font-body)' }}>{t.label}</td>
                          <td className="px-4 py-3">
                            <div className="relative w-32">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                              <input
                                type="number"
                                value={allocs[t.key]}
                                onChange={e => setAllocs(prev => ({ ...prev, [t.key]: e.target.value }))}
                                placeholder="0"
                                className="focus-light pl-6 pr-2 py-1.5 border border-zinc-200 rounded-lg text-sm font-semibold text-zinc-900 bg-white w-full outline-none focus:border-zinc-900 tabular"
                                style={{ fontFamily: 'var(--font-body)' }}
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-zinc-500 tabular"
                            style={{ fontFamily: 'var(--font-body)' }}>${t.rate}/hr</td>
                          <td className="px-4 py-3 text-sm font-bold text-zinc-900 tabular"
                            style={{ fontFamily: 'var(--font-body)' }}>
                            {getHours(t.key) > 0 ? `${getHours(t.key)} hrs` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Allocation summary */}
                  <div className={`flex items-center justify-between px-4 py-3 ${
                    Math.abs(remaining) < 1 ? 'bg-green-50' : remaining < 0 ? 'bg-red-50' : 'bg-zinc-50'
                  }`}>
                    <span className="text-xs font-black uppercase tracking-wider text-zinc-500"
                      style={{ fontFamily: 'var(--font-body)' }}>
                      Allocated
                    </span>
                    <span className={`text-sm font-bold tabular ${
                      Math.abs(remaining) < 1 ? 'text-green-700' : remaining < 0 ? 'text-red-600' : 'text-zinc-700'
                    }`} style={{ fontFamily: 'var(--font-body)' }}>
                      {fmt(totalAllocated)} of {fmt(afterPM)}
                      {remaining > 1 && <span className="text-zinc-400 font-normal ml-2">({fmt(remaining)} unallocated)</span>}
                      {remaining < -1 && <span className="ml-2">over budget</span>}
                    </span>
                  </div>
                </div>
              )}
            </div>

          ) : (
            /* ── By Hours mode ── */
            <div className="border border-zinc-100 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100">
                    {['Type', 'Hours', 'Rate', 'Billed'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-black uppercase tracking-wider text-zinc-400"
                        style={{ fontFamily: 'var(--font-body)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TYPES.map(t => {
                    const h = parseFloat(hrs[t.key]) || 0
                    return (
                      <tr key={t.key} className="border-b border-zinc-50 last:border-0">
                        <td className="px-4 py-3 text-sm font-semibold text-zinc-700"
                          style={{ fontFamily: 'var(--font-body)' }}>{t.label}</td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={hrs[t.key]}
                            onChange={e => setHrs(prev => ({ ...prev, [t.key]: e.target.value }))}
                            placeholder="0"
                            className="focus-light px-3 py-1.5 border border-zinc-200 rounded-lg text-sm font-semibold text-zinc-900 bg-white w-24 outline-none focus:border-zinc-900 tabular"
                            style={{ fontFamily: 'var(--font-body)' }}
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-500 tabular"
                          style={{ fontFamily: 'var(--font-body)' }}>${t.rate}/hr</td>
                        <td className="px-4 py-3 text-sm font-bold text-zinc-900 tabular"
                          style={{ fontFamily: 'var(--font-body)' }}>
                          {h > 0 ? fmt(h * t.rate) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {hrsSubtotal > 0 && (
                <div className="border-t border-zinc-100 px-4 py-3 bg-zinc-50 space-y-1">
                  <div className="flex justify-between text-sm text-zinc-500">
                    <span style={{ fontFamily: 'var(--font-body)' }}>Subtotal</span>
                    <span className="tabular font-semibold" style={{ fontFamily: 'var(--font-body)' }}>{fmt(hrsSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-zinc-500">
                    <span style={{ fontFamily: 'var(--font-body)' }}>PM overhead ({pmPercent}%)</span>
                    <span className="tabular font-semibold" style={{ fontFamily: 'var(--font-body)' }}>{fmt(hrsPmCost)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-zinc-900 pt-1 border-t border-zinc-200">
                    <span style={{ fontFamily: 'var(--font-body)' }}>Total to client</span>
                    <span className="tabular" style={{ fontFamily: 'var(--font-body)' }}>{fmt(hrsTotal)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Add to estimator button */}
          {hasResults && (
            <button
              onClick={addItems}
              className="focus-light mt-4 px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all hover:-translate-y-0.5"
              style={{ backgroundColor: 'var(--lime)', color: '#0c0c0c', fontFamily: 'var(--font-body)' }}
            >
              + Add as Line Items
            </button>
          )}
        </div>
      )}
    </div>
  )
}
