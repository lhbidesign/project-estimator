import { useState } from 'react'
import { useRates } from '../contexts/RatesContext.jsx'
import { RESOURCES, HOUR_GUIDES, PROJECT_CATEGORIES } from '../data/rates.js'
import { nanoid } from '../utils/nanoid.js'

const ALL_TAB = { id: 'all', label: 'All' }
const TABS = [ALL_TAB, ...PROJECT_CATEGORIES]

function InlineText({ value, onChange, className = '' }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`focus-light bg-transparent outline-none border-b border-transparent focus:border-zinc-400 text-sm font-medium text-zinc-800 transition-colors ${className}`}
      style={{ fontFamily: 'var(--font-body)' }}
    />
  )
}

function InlineNum({ value, onChange, prefix, width = 'w-14' }) {
  return (
    <div className="flex items-center gap-0.5">
      {prefix && <span className="text-zinc-400 text-sm">{prefix}</span>}
      <input
        type="number"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className={`focus-light bg-transparent outline-none border-b border-transparent focus:border-zinc-400 text-sm font-semibold text-zinc-800 tabular text-right transition-colors ${width}`}
        style={{ fontFamily: 'var(--font-body)' }}
      />
    </div>
  )
}

export default function RateCardPage() {
  const { resources, setResources, hourGuides, setHourGuides, pmRate, setPmRate, resetToDefaults } = useRates()
  const [saved, setSaved]       = useState(false)
  const [tab, setTab]           = useState('all')
  const [search, setSearch]     = useState('')

  function flash() { setSaved(true); setTimeout(() => setSaved(false), 1800) }

  function updateResource(key, field, val) { setResources({ ...resources, [key]: { ...resources[key], [field]: val } }); flash() }
  function removeResource(key)             { const n = { ...resources }; delete n[key]; setResources(n); flash() }
  function addResource() {
    const key = `custom_${nanoid()}`
    setResources({ ...resources, [key]: { label: 'New Designer', billedRate: 150, internalRate: 65 } })
    flash()
  }

  function updateGuide(i, field, val) { setHourGuides(hourGuides.map((g, j) => j === i ? { ...g, [field]: val } : g)); flash() }
  function removeGuide(i)             { setHourGuides(hourGuides.filter((_, j) => j !== i)); flash() }
  function addGuide(projectCategory)  {
    const cat = projectCategory === 'all' ? 'experiential' : projectCategory
    setHourGuides([...hourGuides, { projectCategory: cat, category: 'graphic_design', name: 'New deliverable', min: 4, max: 8, resource: 'brandon' }])
    flash()
  }

  const lowerSearch = search.toLowerCase()
  const filteredGuides = hourGuides
    .map((g, i) => ({ ...g, _i: i }))
    .filter(g =>
      (tab === 'all' || g.projectCategory === tab) &&
      (!lowerSearch || g.name.toLowerCase().includes(lowerSearch))
    )

  function handleReset() {
    if (confirm('Reset all rates to defaults?')) { resetToDefaults(); flash() }
  }

  return (
    <div className="pt-[68px] min-h-screen" style={{ background: 'var(--page-bg)' }}>
      <div className="max-w-[1400px] mx-auto px-8 lg:px-16 py-10">

        {/* Page header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-zinc-900" style={{ fontFamily: 'var(--font-display)' }}>
              Rate Card
            </h1>
            <p className="text-zinc-500 text-sm mt-1" style={{ fontFamily: 'var(--font-body)' }}>
              Edit team rates and hour guides. Changes save automatically to your browser.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-xs font-semibold text-green-600 flex items-center gap-1.5"
                style={{ fontFamily: 'var(--font-body)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
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

        <div className="space-y-8">

          {/* ── Team Rates ── */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3"
              style={{ fontFamily: 'var(--font-body)' }}>
              Team & Internal Rates
            </h2>
            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200">
                    {['Name / Role', 'Internal / hr', ''].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-black uppercase tracking-wider text-zinc-400"
                        style={{ fontFamily: 'var(--font-body)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(resources).map(([key, r], i, arr) => (
                    <tr key={key} className={`group ${i < arr.length - 1 ? 'border-b border-zinc-100' : ''}`}>
                      <td className="px-5 py-3.5">
                        <InlineText value={r.label} onChange={v => updateResource(key, 'label', v)} className="w-48" />
                      </td>
                      <td className="px-5 py-3.5">
                        <InlineNum value={r.internalRate} onChange={v => updateResource(key, 'internalRate', v)} prefix="$" />
                      </td>
                      <td className="px-5 py-3.5 w-10 text-right">
                        <button
                          onClick={() => removeResource(key)}
                          className="focus-light opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-500 transition-all"
                          aria-label={`Remove ${r.label}`}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* PM row */}
                  <tr className="border-t-2 border-zinc-200 bg-zinc-50">
                    <td className="px-5 py-3.5 text-sm font-medium text-zinc-600"
                      style={{ fontFamily: 'var(--font-body)' }}>Dee — Project Manager</td>
                    <td className="px-5 py-3.5">
                      <InlineNum value={pmRate} onChange={v => { setPmRate(v); flash() }} prefix="$" />
                    </td>
                    <td />
                  </tr>
                </tbody>
              </table>

              <div className="px-5 py-3 border-t border-zinc-100">
                <button
                  onClick={addResource}
                  className="focus-light text-xs font-bold text-zinc-400 hover:text-zinc-700 uppercase tracking-wider transition-colors"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  + Add team member
                </button>
              </div>
            </div>
          </section>

          {/* ── Service Hour Guide ── */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3"
              style={{ fontFamily: 'var(--font-body)' }}>
              Service Hour Guide
            </h2>

            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
              {/* Tab bar + search */}
              <div className="flex items-center justify-between border-b border-zinc-200 px-1 bg-zinc-50">
                <div className="flex items-end overflow-x-auto" role="tablist">
                  {TABS.map(t => (
                    <button
                      key={t.id}
                      role="tab"
                      aria-selected={tab === t.id}
                      onClick={() => setTab(t.id)}
                      className="relative px-4 py-3 text-xs font-bold whitespace-nowrap transition-colors focus-light flex-shrink-0"
                      style={{
                        fontFamily: 'var(--font-body)',
                        color: tab === t.id ? '#18181b' : '#71717a',
                      }}
                    >
                      {t.label}
                      {tab === t.id && (
                        <span className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full"
                          style={{ backgroundColor: 'var(--lime)' }} />
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex-shrink-0 pr-3">
                  <input
                    type="search"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search deliverables…"
                    className="focus-light border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white w-52 outline-none focus:border-zinc-900 placeholder-zinc-400"
                    style={{ fontFamily: 'var(--font-body)' }}
                  />
                </div>
              </div>

              {/* Table with fixed height + scroll */}
              <div className="overflow-y-auto" style={{ maxHeight: '460px' }}>
                <table className="w-full">
                  <thead className="sticky top-0 z-10 bg-white border-b border-zinc-100">
                    <tr>
                      {['Deliverable', 'Category', 'Min hrs', 'Max hrs', 'Default resource', ''].map(h => (
                        <th key={h} className="px-5 py-2.5 text-left text-xs font-black uppercase tracking-wider text-zinc-400 bg-white"
                          style={{ fontFamily: 'var(--font-body)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGuides.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-sm text-zinc-400 italic text-center"
                          style={{ fontFamily: 'var(--font-body)' }}>
                          No deliverables found
                        </td>
                      </tr>
                    ) : filteredGuides.map(g => (
                      <tr key={g._i} className="border-b border-zinc-50 last:border-0 group hover:bg-zinc-50/70 transition-colors">
                        <td className="px-5 py-3">
                          <InlineText value={g.name} onChange={v => updateGuide(g._i, 'name', v)} className="w-64" />
                        </td>
                        <td className="px-5 py-3">
                          <select
                            value={g.projectCategory}
                            onChange={e => updateGuide(g._i, 'projectCategory', e.target.value)}
                            className="focus-light border border-zinc-200 text-zinc-600 text-xs font-semibold rounded-lg px-2 py-1 bg-white cursor-pointer outline-none focus:border-zinc-900"
                            style={{ fontFamily: 'var(--font-body)' }}
                          >
                            {PROJECT_CATEGORIES.map(c => (
                              <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-3">
                          <InlineNum value={g.min} onChange={v => updateGuide(g._i, 'min', v)} />
                        </td>
                        <td className="px-5 py-3">
                          <InlineNum value={g.max} onChange={v => updateGuide(g._i, 'max', v)} />
                        </td>
                        <td className="px-5 py-3">
                          <select
                            value={g.resource}
                            onChange={e => updateGuide(g._i, 'resource', e.target.value)}
                            className="focus-light border border-zinc-200 text-zinc-600 text-xs font-semibold rounded-lg px-2 py-1 bg-white cursor-pointer outline-none focus:border-zinc-900"
                            style={{ fontFamily: 'var(--font-body)' }}
                          >
                            {Object.entries(resources).map(([k, r]) => (
                              <option key={k} value={k}>{r.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-3 w-10 text-right">
                          <button
                            onClick={() => removeGuide(g._i)}
                            className="focus-light opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-500 transition-all"
                            aria-label="Remove"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-5 py-3 border-t border-zinc-100 flex items-center justify-between">
                <button
                  onClick={() => addGuide(tab)}
                  className="focus-light text-xs font-bold text-zinc-400 hover:text-zinc-700 uppercase tracking-wider transition-colors"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  + Add deliverable
                  {tab !== 'all' && ` to ${TABS.find(t => t.id === tab)?.label}`}
                </button>
                <span className="text-xs text-zinc-400 tabular" style={{ fontFamily: 'var(--font-body)' }}>
                  {filteredGuides.length} of {hourGuides.length}
                </span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
