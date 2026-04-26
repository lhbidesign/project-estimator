import { useState } from 'react'
import EstimatorHeader  from './components/EstimatorHeader.jsx'
import ProjectMeta      from './components/ProjectMeta.jsx'
import BudgetCalculator from './components/BudgetCalculator.jsx'
import CategorySection  from './components/CategorySection.jsx'
import SummaryPanel     from './components/SummaryPanel.jsx'
import RateCardPage     from './components/RateCardPage.jsx'
import AIGeneratePage   from './components/AIGeneratePage.jsx'
import SettingsPage     from './components/SettingsPage.jsx'
import EstimatesDrawer  from './components/EstimatesDrawer.jsx'
import { nanoid }       from './utils/nanoid.js'
import { calcProject }  from './utils/calc.js'
import { useRates }     from './contexts/RatesContext.jsx'
import { DEFAULT_CLIENTS } from './data/clients.js'

const ESTIMATES_KEY = 'lh-estimates'

function loadStoredEstimates() {
  try { return JSON.parse(localStorage.getItem(ESTIMATES_KEY) ?? '[]') }
  catch { return [] }
}

function blankSection() {
  return { id: nanoid(), label: '', items: [] }
}

export default function App() {
  const { resources, pmRate } = useRates()

  const [page,            setPage]            = useState('estimator')
  const [view,            setView]            = useState('internal')
  const [historyOpen,     setHistoryOpen]     = useState(false)
  const [justSaved,       setJustSaved]       = useState(false)
  const [savedEstimates,  setSavedEstimates]  = useState(loadStoredEstimates)

  // Project state
  const [projectName,     setProjectName]     = useState('')
  const [clients,         setClients]         = useState(DEFAULT_CLIENTS)
  const [clientId,        setClientId]        = useState('')
  const [contact,         setContact]         = useState('')
  const [projectDesigner, setProjectDesigner] = useState('stef')
  const [pmPercent,       setPmPercent]       = useState(15)
  const [sections,        setSections]        = useState([blankSection()])

  const clientName = clients.find(c => c.id === clientId)?.name ?? ''

  // ── Estimate persistence ──
  function saveEstimate() {
    const p = calcProject(sections, pmPercent, resources, pmRate)
    const est = {
      id: nanoid(),
      savedAt: new Date().toISOString(),
      projectName,
      clientId,
      clientName,
      contact,
      projectDesigner,
      pmPercent,
      sections,
      totalBilled: p.totalBilled,
    }
    const updated = [est, ...savedEstimates].slice(0, 50)
    setSavedEstimates(updated)
    localStorage.setItem(ESTIMATES_KEY, JSON.stringify(updated))
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2000)
  }

  function loadEstimate(est) {
    setProjectName(est.projectName ?? '')
    setContact(est.contact ?? '')
    setProjectDesigner(est.projectDesigner ?? 'stef')
    setPmPercent(est.pmPercent ?? 15)
    setSections((est.sections ?? [blankSection()]).map(s => ({ ...s, id: nanoid() })))
    // Restore or register client
    if (est.clientId && clients.find(c => c.id === est.clientId)) {
      setClientId(est.clientId)
    } else if (est.clientName) {
      const existing = clients.find(c => c.name === est.clientName)
      if (existing) {
        setClientId(existing.id)
      } else {
        const id = `client_${nanoid()}`
        setClients(prev => [...prev, { id, name: est.clientName, contacts: [] }])
        setClientId(id)
      }
    } else {
      setClientId('')
    }
    setHistoryOpen(false)
    setPage('estimator')
  }

  function deleteEstimate(id) {
    const updated = savedEstimates.filter(e => e.id !== id)
    setSavedEstimates(updated)
    localStorage.setItem(ESTIMATES_KEY, JSON.stringify(updated))
  }

  // ── Preset / AI apply ──
  function loadPreset(preset) {
    setProjectName(preset.projectName)
    setPmPercent(preset.pmPercent)
    setSections(preset.sections.map(s => ({ ...s, id: nanoid() })))
    const match = clients.find(c => c.name === preset.clientName)
    if (match) {
      setClientId(match.id)
    } else {
      const id = `client_${nanoid()}`
      setClients(prev => [...prev, { id, name: preset.clientName, contacts: [] }])
      setClientId(id)
    }
    setContact('')
  }

  function applyGenerated(data) {
    if (data.projectName) setProjectName(data.projectName)
    if (data.clientName) {
      const match = clients.find(c => c.name === data.clientName)
      if (match) {
        setClientId(match.id)
      } else {
        const id = `client_${nanoid()}`
        setClients(prev => [...prev, { id, name: data.clientName, contacts: [] }])
        setClientId(id)
      }
    }
    if (data.sections?.length) setSections(data.sections)
    setPage('estimator')
  }

  // ── Section management ──
  function updateSection(id, u) { setSections(prev => prev.map(s => s.id === id ? u : s)) }
  function deleteSection(id)    { setSections(prev => prev.length > 1 ? prev.filter(s => s.id !== id) : prev) }
  function addSection()         { setSections(prev => [...prev, blankSection()]) }
  function addItemsToFirst(items) {
    setSections(prev => {
      const [first, ...rest] = prev
      return [{ ...first, items: [...first.items, ...items] }, ...rest]
    })
  }

  // ── Non-estimator pages ──
  const headerProps = {
    page, setPage, view, setView,
    onLoadPreset: loadPreset,
    onSave: saveEstimate,
    justSaved,
    savedCount: savedEstimates.length,
    onOpenHistory: () => setHistoryOpen(true),
  }

  if (page === 'rate-card') return (
    <>
      <EstimatorHeader {...headerProps} />
      <RateCardPage />
    </>
  )
  if (page === 'generate') return (
    <>
      <EstimatorHeader {...headerProps} />
      <AIGeneratePage onApply={applyGenerated} onGoToSettings={() => setPage('settings')} />
    </>
  )
  if (page === 'settings') return (
    <>
      <EstimatorHeader {...headerProps} />
      <SettingsPage />
    </>
  )

  // ── Shared estimator content ──
  const estimatorContent = (
    <>
      {sections.map(section => (
        <CategorySection
          key={section.id}
          section={section}
          view={view}
          projectDesigner={projectDesigner}
          onChange={u => updateSection(section.id, u)}
          onDeleteSection={() => deleteSection(section.id)}
          isOnlySection={sections.length === 1}
        />
      ))}
      <SummaryPanel
        sections={sections}
        pmPercent={pmPercent}
        setPmPercent={setPmPercent}
        view={view}
      />
    </>
  )

  // ── INTERNAL VIEW ──
  if (view === 'internal') {
    return (
      <div className="min-h-screen" style={{ background: 'var(--page-bg)' }}>
        <EstimatorHeader {...headerProps} />

        <main className="pt-[68px]">
          <div className="max-w-[1400px] mx-auto px-8 lg:px-16 py-10">
            <ProjectMeta
              projectName={projectName}         setProjectName={setProjectName}
              clients={clients}                 setClients={setClients}
              clientId={clientId}               setClientId={setClientId}
              contact={contact}                 setContact={setContact}
              projectDesigner={projectDesigner} setProjectDesigner={setProjectDesigner}
            />

            <BudgetCalculator
              pmPercent={pmPercent}
              projectDesigner={projectDesigner}
              onAddItems={addItemsToFirst}
            />

            {estimatorContent}

            <button
              onClick={addSection}
              className="focus-light mt-3 mb-6 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-700 transition-colors border border-dashed border-zinc-300 hover:border-zinc-500 rounded-lg px-4 py-2.5 w-full"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              + Add program / section
            </button>
          </div>
        </main>

        <footer className="border-t border-zinc-200 py-4 mt-8">
          <div className="max-w-[1400px] mx-auto px-8 lg:px-16 flex justify-between items-center">
            <span className="text-xs text-zinc-400 font-medium" style={{ fontFamily: 'var(--font-body)' }}>
              Little House Studio — Internal use only
            </span>
            <span className="text-xs text-zinc-400 tabular" style={{ fontFamily: 'var(--font-body)' }}>
              Studio $150/hr · On-call $200/hr · PM $45/hr
            </span>
          </div>
        </footer>

        <EstimatesDrawer
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          estimates={savedEstimates}
          onLoad={loadEstimate}
          onDelete={deleteEstimate}
        />
      </div>
    )
  }

  // ── CLIENT VIEW ──
  return (
    <div className="min-h-screen bg-white">
      <EstimatorHeader {...headerProps} />

      <div className="hidden print-show pt-8 pb-6 border-b border-zinc-200 px-16">
        <p className="text-xs font-black uppercase tracking-widest mb-1"
          style={{ color: '#4e6300', fontFamily: 'var(--font-body)' }}>
          Little House Studio
        </p>
        <h1 className="text-2xl font-black text-zinc-900" style={{ fontFamily: 'var(--font-display)' }}>
          {projectName || 'Project Estimate'}
        </h1>
        {(clientName || contact) && (
          <p className="text-zinc-500 text-sm mt-0.5">
            {[clientName, contact].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>

      <main className="pt-[68px]">
        <div className="max-w-[1400px] mx-auto px-8 lg:px-16 py-10">
          <div className="no-print mb-10 pb-8 border-b border-zinc-100 flex justify-between items-start gap-6 flex-wrap">
            <div>
              <p className="text-xs font-black uppercase tracking-widest mb-2"
                style={{ color: '#4e6300', fontFamily: 'var(--font-body)' }}>
                Little House Studio
              </p>
              <h1 className="text-4xl font-black text-zinc-900 leading-tight"
                style={{ fontFamily: 'var(--font-display)' }}>
                {projectName || 'Project Estimate'}
              </h1>
              {(clientName || contact) && (
                <p className="text-zinc-500 text-sm font-medium mt-1.5" style={{ fontFamily: 'var(--font-body)' }}>
                  {[clientName, contact].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-3 pt-1 no-print">
              <p className="text-zinc-400 text-sm" style={{ fontFamily: 'var(--font-body)' }}>
                {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <button
                onClick={() => window.print()}
                className="focus-light px-4 py-2 border border-zinc-300 text-zinc-500 text-xs font-bold uppercase tracking-widest hover:border-zinc-900 hover:text-zinc-900 transition-all rounded-lg"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Print / Export
              </button>
            </div>
          </div>

          {estimatorContent}
        </div>
      </main>
    </div>
  )
}
