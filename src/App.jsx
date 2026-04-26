import { useState, useEffect } from 'react'
import EstimatorHeader  from './components/EstimatorHeader.jsx'
import ViewToggleBar    from './components/ViewToggleBar.jsx'
import ProjectMeta      from './components/ProjectMeta.jsx'
import BudgetCalculator from './components/BudgetCalculator.jsx'
import CategorySection  from './components/CategorySection.jsx'
import SummaryPanel     from './components/SummaryPanel.jsx'
import RateCardPage     from './components/RateCardPage.jsx'
import AIGeneratePage   from './components/AIGeneratePage.jsx'
import SettingsPage     from './components/SettingsPage.jsx'
import EstimatesDrawer  from './components/EstimatesDrawer.jsx'
import { useHistory }   from './hooks/useHistory.js'
import { nanoid }       from './utils/nanoid.js'
import { calcProject }  from './utils/calc.js'
import { useRates }     from './contexts/RatesContext.jsx'
import { DEFAULT_CLIENTS } from './data/clients.js'
import { binRead, binWrite, getSyncConfig } from './utils/sharedStorage.js'

const ESTIMATES_KEY = 'lh-estimates'

function loadStoredEstimates() {
  try { return JSON.parse(localStorage.getItem(ESTIMATES_KEY) ?? '[]') } catch { return [] }
}

function blankSection() { return { id: nanoid(), label: '', items: [] } }

export default function App() {
  const { resources, pmRate } = useRates()

  const [page,           setPage]           = useState('estimator')
  const [view,           setView]           = useState('internal')
  const [historyOpen,    setHistoryOpen]    = useState(false)
  const [justSaved,      setJustSaved]      = useState(false)
  const [saveError,      setSaveError]      = useState('')
  const [savedEstimates, setSavedEstimates] = useState(loadStoredEstimates)
  const [currentEstimateId, setCurrentEstimateId] = useState(null)
  const [syncLoading,    setSyncLoading]    = useState(false)

  // Project fields
  const [projectName,     setProjectName]     = useState('')
  const [clients,         setClients]         = useState(DEFAULT_CLIENTS)
  const [clientId,        setClientId]        = useState('')
  const [contact,         setContact]         = useState('')
  const [projectDesigner, setProjectDesigner] = useState('stef')
  const [pmPercent,       setPmPercent]       = useState(15)
  const [hideHours,       setHideHours]       = useState(false)
  const [estimateDate,    setEstimateDate]    = useState(() => new Date().toISOString().slice(0, 10))
  const [estimateNumber,  setEstimateNumber]  = useState(null)
  const [clientAddress,   setClientAddress]   = useState('')
  const [validDays,       setValidDays]       = useState(30)
  const [footerNote,      setFooterNote]      = useState('50% deposit required to initiate project. Balance due upon completion unless otherwise agreed upon in writing.')

  // Undo/redo for sections
  const { sections, push, undo, redo, canUndo, canRedo, reset: resetHistory } = useHistory([blankSection()])

  function setSections(updater) {
    const next = typeof updater === 'function' ? updater(sections) : updater
    push(next)
  }

  // Keyboard shortcuts: Cmd+Z / Cmd+Shift+Z
  useEffect(() => {
    function handleKey(e) {
      if (!e.metaKey && !e.ctrlKey) return
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if ((e.key === 'z' && e.shiftKey) || e.key === 'y') { e.preventDefault(); redo() }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [undo, redo])

  // On first load, pull shared estimates from JSONbin if configured
  useEffect(() => {
    const { apiKey, binId } = getSyncConfig()
    if (!apiKey || !binId) return
    setSyncLoading(true)
    binRead(apiKey, binId)
      .then(record => {
        const shared = record?.estimates ?? []
        if (shared.length > 0) {
          setSavedEstimates(shared)
          localStorage.setItem(ESTIMATES_KEY, JSON.stringify(shared))
        }
      })
      .catch(() => {}) // fail silently — localStorage is the fallback
      .finally(() => setSyncLoading(false))
  }, [])

  // Write updated estimates to JSONbin if configured
  async function syncToShared(estimates) {
    const { apiKey, binId } = getSyncConfig()
    if (!apiKey || !binId) return
    binWrite(apiKey, binId, { estimates }).catch(() => {})
  }

  const clientName = clients.find(c => c.id === clientId)?.name ?? ''

  function getNextEstimateNumber() {
    const n = parseInt(localStorage.getItem('lh-est-counter') ?? '0', 10) + 1
    localStorage.setItem('lh-est-counter', String(n))
    return `EST-${String(n).padStart(4, '0')}`
  }

  // ── Save / Load ──
  function saveEstimate() {
    if (!projectName.trim()) { setSaveError('name'); setTimeout(() => setSaveError(''), 3000); return }
    if (!clientId)           { setSaveError('client'); setTimeout(() => setSaveError(''), 3000); return }

    const p   = calcProject(sections, pmPercent, resources, pmRate)
    const num = estimateNumber ?? getNextEstimateNumber()
    if (!estimateNumber) setEstimateNumber(num)

    const est = {
      id: currentEstimateId ?? nanoid(),
      savedAt: new Date().toISOString(),
      estimateNumber: num,
      estimateDate, validDays, footerNote,
      projectName, clientId, clientName, contact, clientAddress, projectDesigner, pmPercent, sections,
      totalBilled: p.totalBilled,
    }
    let updated
    if (currentEstimateId) {
      updated = savedEstimates.map(e => e.id === currentEstimateId ? est : e)
    } else {
      setCurrentEstimateId(est.id)
      updated = [est, ...savedEstimates].slice(0, 50)
    }
    setSavedEstimates(updated)
    localStorage.setItem(ESTIMATES_KEY, JSON.stringify(updated))
    syncToShared(updated)
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2000)
  }

  function loadEstimate(est) {
    const newSections = (est.sections ?? [blankSection()]).map(s => ({ ...s, id: nanoid() }))
    resetHistory(newSections)
    setProjectName(est.projectName ?? '')
    setContact(est.contact ?? '')
    setProjectDesigner(est.projectDesigner ?? 'stef')
    setPmPercent(est.pmPercent ?? 15)
    setEstimateDate(est.estimateDate ?? new Date().toISOString().slice(0, 10))
    setEstimateNumber(est.estimateNumber ?? null)
    setClientAddress(est.clientAddress ?? '')
    setValidDays(est.validDays ?? 30)
    setFooterNote(est.footerNote ?? '50% deposit required to initiate project. Balance due upon completion unless otherwise agreed upon in writing.')
    // Prefer matching by stable ID, fall back to name match
    if (est.clientId && clients.find(c => c.id === est.clientId)) {
      setClientId(est.clientId)
    } else {
      resolveClient(est.clientName ?? '')
    }
    setCurrentEstimateId(est.id)
    setHistoryOpen(false)
    setPage('estimator')
  }

  function deleteEstimate(id) {
    const updated = savedEstimates.filter(e => e.id !== id)
    setSavedEstimates(updated)
    localStorage.setItem(ESTIMATES_KEY, JSON.stringify(updated))
    syncToShared(updated)
  }

  function resetEstimate() {
    if (!confirm('Start a new estimate? All current data will be cleared.')) return
    setProjectName('')
    setClientId('')
    setContact('')
    setProjectDesigner('stef')
    setPmPercent(15)
    setHideHours(false)
    setClientAddress('')
    setValidDays(30)
    setFooterNote('50% deposit required to initiate project. Balance due upon completion unless otherwise agreed upon in writing.')
    setEstimateDate(new Date().toISOString().slice(0, 10))
    setEstimateNumber(null)
    resetHistory([blankSection()])
    setCurrentEstimateId(null)
  }

  // ── Preset / AI ──
  function resolveClient(name) {
    if (!name) { setClientId(''); return }
    const match = clients.find(c => c.name === name)
    if (match) {
      setClientId(match.id)
    } else {
      const id = `client_${nanoid()}`
      setClients(prev => [...prev, { id, name, contacts: [] }])
      setClientId(id)
    }
  }

  function loadPreset(preset) {
    resetHistory(preset.sections.map(s => ({ ...s, id: nanoid() })))
    setProjectName(preset.projectName)
    setPmPercent(preset.pmPercent)
    resolveClient(preset.clientName)
    setContact(preset.contact ?? '')
    setClientAddress('')
    setCurrentEstimateId(null)
  }

  function applyGenerated(data) {
    if (data.sections?.length) resetHistory(data.sections)
    if (data.projectName) setProjectName(data.projectName)
    resolveClient(data.clientName ?? '')
    setContact('')
    setClientAddress('')
    setCurrentEstimateId(null)
    setPage('estimator')
  }

  // ── Section helpers ──
  function updateSection(id, u)  { setSections(prev => prev.map(s => s.id === id ? u : s)) }
  function deleteSection(id)     { setSections(prev => prev.length > 1 ? prev.filter(s => s.id !== id) : prev) }
  function addSection()          { setSections(prev => [...prev, blankSection()]) }
  function addItemsToFirst(items) {
    setSections(prev => { const [f, ...r] = prev; return [{ ...f, items: [...f.items, ...items] }, ...r] })
  }

  // ── Header props ──
  const headerProps = {
    page, setPage,
    onOpenSettings: () => setPage('settings'),
  }

  // ── Toggle bar props (estimator page only) ──
  const toggleBarProps = {
    view, setView,
    onOpenEstimates: () => setHistoryOpen(true),
    savedCount: savedEstimates.length,
    onLoadPreset: loadPreset,
  }

  // ── Non-estimator pages ──
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

  // ── Project meta props ──
  const metaProps = {
    projectName, setProjectName,
    clients, setClients,
    clientId, setClientId,
    contact, setContact,
    projectDesigner, setProjectDesigner,
    hideHours, setHideHours,
    clientAddress, setClientAddress,
    estimateDate, setEstimateDate,
    estimateNumber,
    validDays, setValidDays,
    onSave: saveEstimate, justSaved, saveError,
    onReset: resetEstimate,
    onUndo: undo, onRedo: redo, canUndo, canRedo,
  }

  // ── ESTIMATOR — shared content ──
  const estimatorContent = (
    <>
      <div>
        {sections.map(section => (
          <CategorySection
            key={section.id}
            section={section}
            view={view}
            projectDesigner={projectDesigner}
            hideHours={hideHours}
            onChange={u => updateSection(section.id, u)}
            onDeleteSection={() => deleteSection(section.id)}
            isOnlySection={sections.length === 1}
          />
        ))}
        {/* Add section — grouped with deliverable cards */}
        <button
          onClick={addSection}
          className="focus-light w-full text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-700 transition-colors border border-dashed border-zinc-200 hover:border-zinc-400 rounded-xl px-4 py-3 mb-6"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          + Add program / section
        </button>
      </div>

      <SummaryPanel
        sections={sections}
        pmPercent={pmPercent}
        setPmPercent={setPmPercent}
        view={view}
      />

      {/* Footer note — editable in internal, display-only in client */}
      {view === 'internal' ? (
        <div className="mt-8 pt-6 border-t border-zinc-200">
          <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2"
            style={{ fontFamily: 'var(--font-body)' }}>
            Terms / Footer Note
          </label>
          <textarea
            value={footerNote}
            onChange={e => setFooterNote(e.target.value)}
            rows={2}
            className="focus-light w-full text-sm text-zinc-600 bg-white border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-zinc-900 resize-y shadow-sm placeholder-zinc-300 leading-relaxed"
            style={{ fontFamily: 'var(--font-body)' }}
            placeholder="Add payment terms, notes, or conditions…"
          />
        </div>
      ) : (
        footerNote && (
          <div className="mt-8 pt-6 border-t border-zinc-100">
            <p className="text-xs text-zinc-500 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
              {footerNote}
            </p>
          </div>
        )
      )}

      {/* Company info — client view only */}
      {view === 'client' && (
        <div className="mt-6 pt-5 border-t border-zinc-100 flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs text-zinc-400" style={{ fontFamily: 'var(--font-body)' }}>
            1616 N La Brea Ave Unit 302, Los Angeles, CA
          </p>
          <p className="text-xs text-zinc-400" style={{ fontFamily: 'var(--font-body)' }}>
            hello@littlehouse.studio
          </p>
        </div>
      )}
    </>
  )

  // ── INTERNAL VIEW ──
  if (view === 'internal') {
    return (
      <div className="min-h-screen" style={{ background: 'var(--page-bg)' }}>
        <EstimatorHeader {...headerProps} />
        <ViewToggleBar {...toggleBarProps} />

        <main className="pt-[152px]">
          <div className="max-w-[1400px] mx-auto px-8 lg:px-16 py-10">
            <ProjectMeta {...metaProps} />
            <BudgetCalculator pmPercent={pmPercent} projectDesigner={projectDesigner} onAddItems={addItemsToFirst} />
            {estimatorContent}
          </div>
        </main>

        <footer className="border-t border-zinc-200 py-4 mt-8">
          <div className="max-w-[1400px] mx-auto px-8 lg:px-16 flex justify-between items-center">
            <span className="text-xs text-zinc-400" style={{ fontFamily: 'var(--font-body)' }}>
              Little House Studio — Internal use only
            </span>
            <span className="text-xs text-zinc-400 tabular" style={{ fontFamily: 'var(--font-body)' }}>
              Studio $150–$200/hr · On-call $200/hr · PM $75/hr
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
  const formattedDate = estimateDate
    ? new Date(estimateDate + 'T12:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const expiryDate = estimateDate
    ? new Date(new Date(estimateDate + 'T12:00:00').getTime() + validDays * 864e5)
        .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <div className="min-h-screen bg-white">
      <EstimatorHeader {...headerProps} />
      <ViewToggleBar view={view} setView={setView} />

      {/* ── Print-only footer note + company info ── */}
      {footerNote && (
        <div className="hidden print-show px-16 pt-6 pb-2">
          <p className="text-xs text-zinc-500 leading-relaxed border-t border-zinc-100 pt-5"
            style={{ fontFamily: 'var(--font-body)' }}>
            {footerNote}
          </p>
        </div>
      )}
      <div className="hidden print-show px-16 pb-8 flex items-center justify-between border-t border-zinc-100 pt-4">
        <p className="text-xs text-zinc-400" style={{ fontFamily: 'var(--font-body)' }}>
          1616 N La Brea Ave Unit 302, Los Angeles, CA
        </p>
        <p className="text-xs text-zinc-400" style={{ fontFamily: 'var(--font-body)' }}>
          hello@littlehouse.studio
        </p>
      </div>

      {/* ── Print-only header ── */}
      <div className="hidden print-show px-16 pt-10 pb-8 border-b-2 border-zinc-200">
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1">
            <h1 className="text-3xl font-black text-zinc-900 leading-tight mb-2"
              style={{ fontFamily: 'var(--font-display)' }}>
              {projectName || 'Project Estimate'}
            </h1>
            {(clientName || contact) && (
              <p className="text-zinc-600 text-sm font-semibold" style={{ fontFamily: 'var(--font-body)' }}>
                {[clientName, contact].filter(Boolean).join(' · ')}
              </p>
            )}
            {clientAddress && (
              <p className="text-zinc-500 text-sm mt-0.5 whitespace-pre-line" style={{ fontFamily: 'var(--font-body)' }}>
                {clientAddress}
              </p>
            )}
            <p className="text-zinc-400 text-xs mt-3 font-mono">
              {[estimateNumber, formattedDate].filter(Boolean).join(' · ')}
            </p>
            {expiryDate && (
              <p className="text-zinc-400 text-xs mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>
                Valid through {expiryDate}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <img src={`${import.meta.env.BASE_URL}lhbi-logo.png`} alt="Little House Studio"
              className="h-24 w-auto object-contain" />
            <p className="text-zinc-300 text-xs font-bold tracking-[0.25em] uppercase"
              style={{ fontFamily: 'var(--font-display)' }}>
              Estimate
            </p>
          </div>
        </div>
      </div>

      <main className="pt-[152px]">
        <div className="max-w-[1400px] mx-auto px-8 lg:px-16 py-10">

          {/* ── Screen-only header ── */}
          <div className="no-print mb-10 pb-8 border-b border-zinc-100">
            <div className="flex items-start justify-between gap-8">

              {/* Left: project + client info */}
              <div className="flex-1">
                <h1 className="text-4xl font-black text-zinc-900 leading-tight mb-2"
                  style={{ fontFamily: 'var(--font-display)' }}>
                  {projectName || 'Project Estimate'}
                </h1>
                {(clientName || contact) && (
                  <p className="text-zinc-600 text-sm font-semibold" style={{ fontFamily: 'var(--font-body)' }}>
                    {[clientName, contact].filter(Boolean).join(' · ')}
                  </p>
                )}
                {clientAddress && (
                  <p className="text-zinc-500 text-sm mt-0.5 whitespace-pre-line" style={{ fontFamily: 'var(--font-body)' }}>
                    {clientAddress}
                  </p>
                )}
                <p className="text-zinc-400 text-xs mt-3 font-mono">
                  {[estimateNumber, formattedDate].filter(Boolean).join(' · ')}
                </p>
                {expiryDate && (
                  <p className="text-zinc-400 text-xs mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>
                    Valid through {expiryDate}
                  </p>
                )}
              </div>

              {/* Right: logo + ESTIMATE label + print */}
              <div className="flex flex-col items-end gap-3 flex-shrink-0">
                <div className="flex flex-col items-end gap-1.5">
                  <img
                    src={`${import.meta.env.BASE_URL}lhbi-logo.png`}
                    alt="Little House Studio"
                    className="h-24 w-auto object-contain"
                  />
                  <p className="text-zinc-300 text-xs font-bold tracking-[0.25em] uppercase"
                    style={{ fontFamily: 'var(--font-display)' }}>
                    Estimate
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="focus-light px-4 py-2 border border-zinc-300 text-zinc-500 text-xs font-bold uppercase tracking-widest hover:border-zinc-900 hover:text-zinc-900 transition-all rounded-lg"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  Print / Export
                </button>
              </div>
            </div>
          </div>
          {estimatorContent}
        </div>
      </main>
    </div>
  )
}
