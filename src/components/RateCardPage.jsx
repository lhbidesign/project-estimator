import { useState } from 'react'
import { useRates } from '../contexts/RatesContext.jsx'
import { RESOURCES, HOUR_GUIDES, PROJECT_CATEGORIES, PM_RATE } from '../data/rates.js'
import { nanoid } from '../utils/nanoid.js'

const ALL_TABS = [{ id: 'all', label: 'All' }, ...PROJECT_CATEGORIES]

function Cell({ value, onChange, type = 'text', prefix, className = '' }) {
  return (
    <div className="flex items-center gap-0.5">
      {prefix && <span className="text-zinc-400 text-sm">{prefix}</span>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        className={`focus-light bg-transparent outline-none border-b border-transparent hover:border-zinc-200 focus:border-zinc-600 text-sm font-medium text-zinc-800 transition-colors py-0.5 ${className}`}
        style={{ fontFamily: 'var(--font-body)' }}
      />
    </div>
  )
}

export default function RateCardPage() {
  const { resources, setResources, hourGuides, setHourGuides, pmRate, setPmRate, resetToDefaults } = useRates()
  const [saved,  setSaved]  = useState(false)
  const [tab,    setTab]    = useState('all')
  const [search, setSearch] = useState('')

  function flash() { setSaved(true); setTimeout(() => setSaved(false), 1800) }

  function updateResource(key, field, val) { setResources({ ...resources, [key]: { ...resources[key], [field]: val } }); flash() }
  function removeResource(key)             { const n = { ...resources }; delete n[key]; setResources(n); flash() }
  function addResource() {
    const key = `custom_${nanoid()}`
    setResources({ ...resources, [key]: { label: 'New Designer', title: 'Designer', billedRate: 150, internalRate: 65 } })
    flash()
  }

  function updateGuide(i, field, val) { setHourGuides(hourGuides.map((g, j) => j === i ? { ...g, [field]: val } : g)); flash() }
  function removeGuide(i)             { setHourGuides(hourGuides.filter((_, j) => j !== i)); flash() }
  function addGuide() {
    const cat = tab === 'all' ? 'experiential' : tab
    setHourGuides([...hourGuides, { projectCategory: cat, category: 'graphic_design', name: 'New deliverable', hours: 8, resource: 'brandon' }])
    flash()
  }

  const filtered = hourGuides
    .map((g, i) => ({ ...g, _i: i }))
    .filter(g =>
      (tab === 'all' || g.projectCategory === tab) &&
      (!search.trim() || g.name.toLowerCase().includes(search.toLowerCase()))
    )

  function handleReset() {
    if (confirm('Reset all rates and hour guides to defaults?')) { resetToDefaults(); flash() }
  }

  return (
    <div className="pt-[68px] min-h-screen" style={{ background: 'var(--page-bg)' }}>
      <div className="max-w-[1400px] mx-auto px-8 lg:px-16 py-10">

        {/* Page header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black text-zinc-900" style={{ fontFamily: 'var(--font-display)' }}>
              Rate Card
            </h1>
            <p className="text-zinc-500 text-sm mt-1" style={{ fontFamily: 'var(--font-body)' }}>
              Click any field to edit. Changes save automatically to your browser.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-1">
            {saved && (
              <span className="text-xs font-semibold text-green-600 flex items-center gap-1.5" style={{ fontFamily: 'var(--font-body)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Saved
              </span>
            )}
            <button
              onClick={handleReset}
              className="focus-light px-4 py-2 border border-zinc-200 text-zinc-500 text-xs font-bold uppercase tracking-wider rounded-lg hover:border-zinc-900 hover:text-zinc-900 transition-all"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Reset to defaults
            </button>
          </div>
        </div>

        <div className="space-y-10">

          {/* ── Team & Rates ── */}
          <section>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500"
                style={{ fontFamily: 'var(--font-body)' }}>
                Team & Internal Rates
              </h2>
              <button
                onClick={addResource}
                className="focus-light text-xs font-bold text-zinc-400 hover:text-zinc-700 uppercase tracking-wider transition-colors"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                + Add team member
              </button>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-100">
                    {['Name', 'Title', 'Internal / hr', ''].map((h, i) => (
                      <th key={i} className={`px-6 py-3.5 text-left text-xs font-black uppercase tracking-wider text-zinc-400 bg-zinc-50 ${i === 3 ? 'w-10' : ''}`}
                        style={{ fontFamily: 'var(--font-body)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(resources).map(([key, r], i, arr) => (
                    <tr key={key} className={`group ${i < arr.length - 1 ? 'border-b border-zinc-100' : ''} hover:bg-zinc-50/50 transition-colors`}>
                      <td className="px-6 py-4">
                        <Cell value={r.label} onChange={v => updateResource(key, 'label', v)} className="w-40" />
                      </td>
                      <td className="px-6 py-4">
                        <Cell value={r.title ?? ''} onChange={v => updateResource(key, 'title', v)} className="w-52 text-zinc-500" />
                      </td>
                      <td className="px-6 py-4">
                        <Cell value={r.internalRate} onChange={v => updateResource(key, 'internalRate', v)} type="number" prefix="$" className="w-16 text-right tabular" />
                      </td>
                      <td className="px-6 py-4 w-10 text-right">
                        <button
                          onClick={() => removeResource(key)}
                          className="focus-light opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-500 transition-all text-lg leading-none"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* PM */}
                  <tr className="border-t-2 border-zinc-200 bg-zinc-50/60">
                    <td className="px-6 py-4 text-sm font-semibold text-zinc-600" style={{ fontFamily: 'var(--font-body)' }}>Dee</td>
                    <td className="px-6 py-4 text-sm text-zinc-400" style={{ fontFamily: 'var(--font-body)' }}>Project Manager</td>
                    <td className="px-6 py-4">
                      <Cell value={pmRate} onChange={v => { setPmRate(v); flash() }} type="number" prefix="$" className="w-16 text-right tabular" />
                    </td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Service Hour Guide ── */}
          <section>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500"
                style={{ fontFamily: 'var(--font-body)' }}>
                Service Hour Guide
              </h2>
              <button
                onClick={addGuide}
                className="focus-light text-xs font-bold text-zinc-400 hover:text-zinc-700 uppercase tracking-wider transition-colors"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                + Add deliverable{tab !== 'all' ? ` to ${ALL_TABS.find(t => t.id === tab)?.label}` : ''}
              </button>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
              {/* Tab bar + search */}
              <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50">
                <div className="flex items-end overflow-x-auto" role="tablist">
                  {ALL_TABS.map(t => (
                    <button
                      key={t.id}
                      role="tab"
                      aria-selected={tab === t.id}
                      onClick={() => setTab(t.id)}
                      className="relative px-5 py-3.5 text-xs font-bold whitespace-nowrap transition-colors focus-light flex-shrink-0"
                      style={{
                        fontFamily: 'var(--font-body)',
                        color: tab === t.id ? '#18181b' : '#71717a',
                      }}
                    >
                      {t.label}
                      {tab === t.id && (
                        <span className="absolute bottom-0 left-5 right-5 h-[2px] rounded-full"
                          style={{ backgroundColor: 'var(--lime)' }} />
                      )}
                    </button>
                  ))}
                </div>
                <div className="pr-4 flex-shrink-0">
                  <input
                    type="search"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search…"
                    className="focus-light border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-700 bg-white w-44 outline-none focus:border-zinc-900 placeholder-zinc-400"
                    style={{ fontFamily: 'var(--font-body)' }}
                  />
                </div>
              </div>

              {/* Table — no internal scroll */}
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-100">
                    <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-zinc-400"
                      style={{ fontFamily: 'var(--font-body)' }}>Deliverable</th>
                    {tab === 'all' && (
                      <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-zinc-400"
                        style={{ fontFamily: 'var(--font-body)' }}>Category</th>
                    )}
                    <th className="px-6 py-3 text-right text-xs font-black uppercase tracking-wider text-zinc-400 w-36"
                      style={{ fontFamily: 'var(--font-body)' }}>Avg Hours</th>
                    <th className="px-6 py-3 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-sm text-zinc-400 italic text-center"
                        style={{ fontFamily: 'var(--font-body)' }}>
                        No deliverables found
                      </td>
                    </tr>
                  ) : filtered.map(g => (
                    <tr key={g._i} className="border-b border-zinc-50 last:border-0 group hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-3.5">
                        <Cell value={g.name} onChange={v => updateGuide(g._i, 'name', v)} className="w-full max-w-sm" />
                      </td>
                      {tab === 'all' && (
                        <td className="px-6 py-3.5">
                          <select
                            value={g.projectCategory}
                            onChange={e => updateGuide(g._i, 'projectCategory', e.target.value)}
                            className="focus-light border border-zinc-200 text-zinc-500 text-xs font-semibold rounded-lg px-2 py-1 bg-white cursor-pointer outline-none focus:border-zinc-900"
                            style={{ fontFamily: 'var(--font-body)' }}
                          >
                            {PROJECT_CATEGORIES.map(c => (
                              <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                          </select>
                        </td>
                      )}
                      <td className="px-6 py-3.5 text-right">
                        <Cell
                          value={g.hours}
                          onChange={v => updateGuide(g._i, 'hours', v)}
                          type="number"
                          className="w-16 text-right tabular"
                        />
                      </td>
                      <td className="px-6 py-3.5 w-10 text-right">
                        <button
                          onClick={() => removeGuide(g._i)}
                          className="focus-light opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-500 transition-all text-lg leading-none"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-zinc-100 bg-zinc-50 flex justify-end">
                <span className="text-xs text-zinc-400 tabular" style={{ fontFamily: 'var(--font-body)' }}>
                  {filtered.length} of {hourGuides.length} deliverables
                </span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
