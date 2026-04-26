import { useState } from 'react'
import { useRates } from '../contexts/RatesContext.jsx'
import { RESOURCES, HOUR_GUIDES, PROJECT_CATEGORIES, CATEGORY_RATES, PM_RATE } from '../data/rates.js'
import { nanoid } from '../utils/nanoid.js'

const ALL_TABS  = [{ id: 'all', label: 'All' }, ...PROJECT_CATEGORIES]
const MAIN_TABS = [
  { id: 'team',  label: 'Team & Internal Rates'   },
  { id: 'guide', label: 'Service Hour / Cost Guide' },
]

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
}

function Cell({ value, onChange, type = 'text', prefix, suffix, className = '' }) {
  return (
    <div className="inline-flex items-center gap-0.5">
      {prefix && <span className="text-zinc-400 text-sm">{prefix}</span>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        className={`focus-light bg-transparent outline-none border-b border-transparent hover:border-zinc-200 focus:border-zinc-600 text-sm font-medium text-zinc-800 transition-colors py-0.5 ${className}`}
        style={{ fontFamily: 'var(--font-body)' }}
      />
      {suffix && <span className="text-zinc-400 text-sm ml-0.5">{suffix}</span>}
    </div>
  )
}

function TopTab({ id, label, active, onClick }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`px-6 py-3 text-sm font-bold transition-colors focus-light relative ${
        active ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-700'
      }`}
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {label}
      {active && (
        <span className="absolute bottom-0 left-6 right-6 h-[2px] rounded-full"
          style={{ backgroundColor: 'var(--lime)' }} />
      )}
    </button>
  )
}

export default function RateCardPage() {
  const { resources, setResources, hourGuides, setHourGuides, pmRate, setPmRate, categoryRates, setCategoryRates, resetToDefaults } = useRates()

  const [mainTab, setMainTab] = useState('team')
  const [catTab,  setCatTab]  = useState('all')
  const [search,  setSearch]  = useState('')
  const [saved,   setSaved]   = useState(false)

  function flash() { setSaved(true); setTimeout(() => setSaved(false), 1800) }

  // ── Team helpers ──
  function updateResource(key, field, val) { setResources({ ...resources, [key]: { ...resources[key], [field]: val } }); flash() }
  function removeResource(key)             { const n = { ...resources }; delete n[key]; setResources(n); flash() }
  function addResource() {
    const key = `custom_${nanoid()}`
    setResources({ ...resources, [key]: { label: 'New Designer', title: 'Designer', billedRate: 150, internalRate: 65 } })
    flash()
  }

  // ── Guide helpers ──
  function updateGuide(i, field, val) { setHourGuides(hourGuides.map((g, j) => j === i ? { ...g, [field]: val } : g)); flash() }
  function removeGuide(i)             { setHourGuides(hourGuides.filter((_, j) => j !== i)); flash() }
  function addGuide() {
    const cat = catTab === 'all' ? 'experiential' : catTab
    setHourGuides([...hourGuides, { projectCategory: cat, category: 'graphic_design', name: 'New deliverable', hours: 8, resource: 'brandon' }])
    flash()
  }

  // ── Category rate helpers ──
  function updateCategoryRate(catId, val) { setCategoryRates({ ...categoryRates, [catId]: val }); flash() }

  function handleReset() {
    if (confirm('Reset all rates and hour guides to defaults?')) { resetToDefaults(); flash() }
  }

  const lowerSearch = search.toLowerCase()
  const filteredGuides = hourGuides
    .map((g, i) => ({ ...g, _i: i }))
    .filter(g =>
      (catTab === 'all' || g.projectCategory === catTab) &&
      (!lowerSearch || g.name.toLowerCase().includes(lowerSearch))
    )

  const activeCatRate = catTab !== 'all' ? (categoryRates[catTab] ?? 150) : null
  const activeCatLabel = PROJECT_CATEGORIES.find(c => c.id === catTab)?.label

  return (
    <div className="pt-[80px] min-h-screen" style={{ background: 'var(--page-bg)' }}>
      <div className="max-w-[1400px] mx-auto px-8 lg:px-16 py-10">

        {/* Page header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-zinc-900" style={{ fontFamily: 'var(--font-display)' }}>
              Rate Card
            </h1>
            <p className="text-zinc-500 text-sm mt-1" style={{ fontFamily: 'var(--font-body)' }}>
              Click any field to edit. Changes save automatically.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-1">
            {saved && (
              <span className="text-xs font-semibold text-green-600 flex items-center gap-1.5" style={{ fontFamily: 'var(--font-body)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Saved
              </span>
            )}
            <button onClick={handleReset}
              className="focus-light px-4 py-2 border border-zinc-200 text-zinc-500 text-xs font-bold uppercase tracking-wider rounded-lg hover:border-zinc-900 hover:text-zinc-900 transition-all"
              style={{ fontFamily: 'var(--font-body)' }}>
              Reset to defaults
            </button>
          </div>
        </div>

        {/* Top-level tab bar */}
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
          <div className="flex border-b border-zinc-200 bg-zinc-50">
            {MAIN_TABS.map(t => (
              <TopTab key={t.id} id={t.id} label={t.label} active={mainTab === t.id} onClick={setMainTab} />
            ))}
          </div>

          {/* ══ TEAM & INTERNAL RATES ══ */}
          {mainTab === 'team' && (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-100">
                    {['Name', 'Title', 'Internal / hr', ''].map((h, i) => (
                      <th key={i} className="px-6 py-3.5 text-left text-xs font-black uppercase tracking-wider text-zinc-400 bg-white"
                        style={{ fontFamily: 'var(--font-body)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(resources).map(([key, r], i, arr) => (
                    <tr key={key} className={`group ${i < arr.length - 1 ? 'border-b border-zinc-100' : ''} hover:bg-zinc-50/50 transition-colors`}>
                      <td className="px-6 py-4"><Cell value={r.label} onChange={v => updateResource(key, 'label', v)} className="w-40" /></td>
                      <td className="px-6 py-4"><Cell value={r.title ?? ''} onChange={v => updateResource(key, 'title', v)} className="w-52 text-zinc-500" /></td>
                      <td className="px-6 py-4"><Cell value={r.internalRate} onChange={v => updateResource(key, 'internalRate', v)} type="number" prefix="$" className="w-16 text-right tabular" /></td>
                      <td className="px-6 py-4 w-10 text-right">
                        <button onClick={() => removeResource(key)}
                          className="focus-light opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-500 transition-all text-lg leading-none">×</button>
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-zinc-200 bg-zinc-50/60">
                    <td className="px-6 py-4 text-sm font-semibold text-zinc-600" style={{ fontFamily: 'var(--font-body)' }}>Dee</td>
                    <td className="px-6 py-4 text-sm text-zinc-400" style={{ fontFamily: 'var(--font-body)' }}>Project Manager</td>
                    <td className="px-6 py-4"><Cell value={pmRate} onChange={v => { setPmRate(v); flash() }} type="number" prefix="$" className="w-16 text-right tabular" /></td>
                    <td />
                  </tr>
                </tbody>
              </table>

              <div className="px-6 py-3 border-t border-zinc-100 bg-zinc-50/40">
                <button onClick={addResource}
                  className="focus-light text-xs font-bold text-zinc-400 hover:text-zinc-700 uppercase tracking-wider transition-colors"
                  style={{ fontFamily: 'var(--font-body)' }}>
                  + Add team member
                </button>
              </div>
            </>
          )}

          {/* ══ SERVICE HOUR / COST GUIDE ══ */}
          {mainTab === 'guide' && (
            <>
              {/* Category tabs + search */}
              <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50">
                <div className="flex items-end overflow-x-auto" role="tablist">
                  {ALL_TABS.map(t => (
                    <button key={t.id} role="tab" aria-selected={catTab === t.id}
                      onClick={() => setCatTab(t.id)}
                      className="relative px-4 py-3 text-xs font-bold whitespace-nowrap transition-colors focus-light flex-shrink-0"
                      style={{ fontFamily: 'var(--font-body)', color: catTab === t.id ? '#18181b' : '#71717a' }}>
                      {t.label}
                      {catTab === t.id && (
                        <span className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full"
                          style={{ backgroundColor: 'var(--lime)' }} />
                      )}
                    </button>
                  ))}
                </div>
                <div className="pr-4 flex-shrink-0">
                  <input type="search" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search…"
                    className="focus-light border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-700 bg-white w-44 outline-none focus:border-zinc-900 placeholder-zinc-400"
                    style={{ fontFamily: 'var(--font-body)' }} />
                </div>
              </div>

              {/* Category billing rate bar — shown for specific tabs */}
              {catTab !== 'all' && (
                <div className="flex items-center gap-4 px-6 py-3 bg-white border-b border-zinc-100">
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-500 flex-shrink-0"
                    style={{ fontFamily: 'var(--font-body)' }}>
                    {activeCatLabel} billing rate
                  </p>
                  <div className="inline-flex items-center gap-1 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5">
                    <span className="text-zinc-400 text-sm font-semibold">$</span>
                    <input
                      type="number"
                      value={categoryRates[catTab] ?? 150}
                      onChange={e => updateCategoryRate(catTab, Number(e.target.value))}
                      className="focus-light w-16 bg-transparent text-sm font-bold tabular text-zinc-900 outline-none"
                      style={{ fontFamily: 'var(--font-body)' }}
                    />
                    <span className="text-zinc-400 text-sm">/hr</span>
                  </div>
                  <p className="text-xs text-zinc-400" style={{ fontFamily: 'var(--font-body)' }}>
                    Used to calculate estimated cost below — adjust per project as needed.
                  </p>
                </div>
              )}

              {/* Table */}
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-100 bg-white">
                    <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-zinc-400"
                      style={{ fontFamily: 'var(--font-body)' }}>Deliverable</th>
                    {catTab === 'all' && (
                      <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-zinc-400"
                        style={{ fontFamily: 'var(--font-body)' }}>Category</th>
                    )}
                    {catTab === 'all' && (
                      <th className="px-6 py-3 text-right text-xs font-black uppercase tracking-wider text-zinc-400 w-28"
                        style={{ fontFamily: 'var(--font-body)' }}>Rate</th>
                    )}
                    <th className="px-6 py-3 text-right text-xs font-black uppercase tracking-wider text-zinc-400 w-28"
                      style={{ fontFamily: 'var(--font-body)' }}>Avg Hrs</th>
                    <th className="px-6 py-3 text-right text-xs font-black uppercase tracking-wider text-zinc-400 w-36"
                      style={{ fontFamily: 'var(--font-body)' }}>Est. Cost</th>
                    <th className="px-6 py-3 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {filteredGuides.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-sm text-zinc-400 italic text-center"
                        style={{ fontFamily: 'var(--font-body)' }}>No deliverables found</td>
                    </tr>
                  ) : filteredGuides.map(g => {
                    const rate = categoryRates[g.projectCategory] ?? 150
                    const cost = g.hours * rate
                    return (
                      <tr key={g._i} className="border-b border-zinc-50 last:border-0 group hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-3.5">
                          <Cell value={g.name} onChange={v => updateGuide(g._i, 'name', v)} className="w-full max-w-sm" />
                        </td>
                        {catTab === 'all' && (
                          <td className="px-6 py-3.5">
                            <select value={g.projectCategory} onChange={e => updateGuide(g._i, 'projectCategory', e.target.value)}
                              className="focus-light border border-zinc-200 text-zinc-500 text-xs font-semibold rounded-lg px-2 py-1 bg-white cursor-pointer outline-none focus:border-zinc-900"
                              style={{ fontFamily: 'var(--font-body)' }}>
                              {PROJECT_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                            </select>
                          </td>
                        )}
                        {catTab === 'all' && (
                          <td className="px-6 py-3.5 text-right">
                            <span className="text-xs font-semibold text-zinc-500 tabular"
                              style={{ fontFamily: 'var(--font-body)' }}>
                              ${rate}/hr
                            </span>
                          </td>
                        )}
                        <td className="px-6 py-3.5 text-right">
                          <Cell value={g.hours} onChange={v => updateGuide(g._i, 'hours', v)} type="number"
                            className="w-12 text-right tabular" />
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <span className="text-sm font-semibold text-zinc-700 tabular"
                            style={{ fontFamily: 'var(--font-body)' }}>
                            {fmt(cost)}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 w-10 text-right">
                          <button onClick={() => removeGuide(g._i)}
                            className="focus-light opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-500 transition-all text-lg leading-none">×</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              <div className="px-6 py-3 border-t border-zinc-100 bg-zinc-50/40 flex items-center justify-between">
                <button onClick={addGuide}
                  className="focus-light text-xs font-bold text-zinc-400 hover:text-zinc-700 uppercase tracking-wider transition-colors"
                  style={{ fontFamily: 'var(--font-body)' }}>
                  + Add deliverable{catTab !== 'all' ? ` to ${activeCatLabel}` : ''}
                </button>
                <span className="text-xs text-zinc-400 tabular" style={{ fontFamily: 'var(--font-body)' }}>
                  {filteredGuides.length} of {hourGuides.length}
                </span>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
