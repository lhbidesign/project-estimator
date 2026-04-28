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
import BottomNav       from './components/BottomNav.jsx'
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

function getNextEstimateNumber() {
  const n = parseInt(localStorage.getItem('lh-est-counter') ?? '0', 10) + 1
  localStorage.setItem('lh-est-counter', String(n))
  return `EST-${String(n).padStart(4, '0')}`
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
  const [projectName,        setProjectName]        = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [clients,            setClients]            = useState(DEFAULT_CLIENTS)
  const [clientId,           setClientId]           = useState('')
  const [contact,            setContact]            = useState('')
  const [projectDesigner,    setProjectDesigner]    = useState('stef')
  const [timeline,           setTimeline]           = useState('')
  const [pmPercent,          setPmPercent]          = useState(0)
  const [projectRate,        setProjectRate]        = useState(150)
  const [hideHours,          setHideHours]          = useState(false)
  const [hideRate,           setHideRate]           = useState(false)
  const [estimateDate,       setEstimateDate]       = useState(() => new Date().toISOString().slice(0, 10))
  const [estimateNumber,     setEstimateNumber]     = useState(getNextEstimateNumber)
  const [clientAddress,      setClientAddress]      = useState('')
  const [validDays,          setValidDays]          = useState(30)
  const [footerNote,         setFooterNote]         = useState('50% deposit required to initiate project. Balance due upon completion unless otherwise agreed upon in writing.')

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

  // ── Save / Load ──
  function saveEstimate() {
    if (!projectName.trim()) { setSaveError('name'); setTimeout(() => setSaveError(''), 3000); return }
    if (!clientId)           { setSaveError('client'); setTimeout(() => setSaveError(''), 3000); return }

    const p = calcProject(sections, pmPercent, resources, pmRate)
    const est = {
      id: currentEstimateId ?? nanoid(),
      savedAt: new Date().toISOString(),
      estimateNumber,
      estimateDate, validDays, footerNote,
      projectName, projectDescription, clientId, clientName, contact, clientAddress, projectDesigner, projectRate, pmPercent, hideHours, hideRate, timeline, sections,
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
    setProjectDescription(est.projectDescription ?? '')
    setContact(est.contact ?? '')
    setProjectDesigner(est.projectDesigner ?? 'stef')
    setTimeline(est.timeline ?? '')
    setPmPercent(est.pmPercent ?? 0)
    setEstimateDate(est.estimateDate ?? new Date().toISOString().slice(0, 10))
    setEstimateNumber(est.estimateNumber ?? getNextEstimateNumber())
    setProjectRate(est.projectRate ?? 150)
    setHideHours(est.hideHours ?? false)
    setHideRate(est.hideRate ?? false)
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
    setProjectDescription('')
    setClientId('')
    setContact('')
    setProjectDesigner('stef')
    setTimeline('')
    setPmPercent(0)
    setProjectRate(150)
    setHideHours(false)
    setHideRate(false)
    setClientAddress('')
    setValidDays(30)
    setFooterNote('50% deposit required to initiate project. Balance due upon completion unless otherwise agreed upon in writing.')
    setEstimateDate(new Date().toISOString().slice(0, 10))
    setEstimateNumber(getNextEstimateNumber())
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
    setProjectDescription('')
    setPmPercent(preset.pmPercent)
    resolveClient(preset.clientName)
    setContact(preset.contact ?? '')
    setClientAddress('')
    setCurrentEstimateId(null)
  }

  function applyGenerated(data) {
    if (data.sections?.length) resetHistory(data.sections)
    if (data.projectName) setProjectName(data.projectName)
    setProjectDescription('')
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

  const bottomNav = <BottomNav page={page} setPage={setPage} />

  // ── Non-estimator pages ──
  if (page === 'rate-card') return (
    <>
      <EstimatorHeader {...headerProps} />
      <div className="pb-20 sm:pb-0"><RateCardPage /></div>
      {bottomNav}
    </>
  )
  if (page === 'generate') return (
    <>
      <EstimatorHeader {...headerProps} />
      <div className="pb-20 sm:pb-0"><AIGeneratePage onApply={applyGenerated} onGoToSettings={() => setPage('settings')} /></div>
      {bottomNav}
    </>
  )
  if (page === 'settings') return (
    <>
      <EstimatorHeader {...headerProps} />
      <div className="pb-20 sm:pb-0"><SettingsPage /></div>
      {bottomNav}
    </>
  )

  // ── Project meta props ──
  const metaProps = {
    projectName, setProjectName,
    projectDescription, setProjectDescription,
    clients, setClients,
    clientId, setClientId,
    contact, setContact,
    projectDesigner, setProjectDesigner,
    projectRate, setProjectRate,
    hideHours, setHideHours,
    hideRate,  setHideRate,
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
            projectRate={projectRate}
            hideHours={hideHours}
            hideRate={hideRate}
            onChange={u => updateSection(section.id, u)}
            onDeleteSection={() => deleteSection(section.id)}
            isOnlySection={sections.length === 1}
          />
        ))}
        {/* Add section — internal only */}
        {view === 'internal' && (
          <button
            onClick={addSection}
            className="focus-light w-full text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-700 transition-colors border border-dashed border-zinc-200 hover:border-zinc-400 rounded-xl px-4 py-3 mb-6"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            + Add program / section
          </button>
        )}
      </div>

      <SummaryPanel
        sections={sections}
        pmPercent={pmPercent}
        setPmPercent={setPmPercent}
        view={view}
      />

      {/* Estimated Timeline */}
      {view === 'internal' ? (
        <div className="mt-8 pt-6 border-t border-zinc-200">
          <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2"
            style={{ fontFamily: 'var(--font-body)' }}>
            Estimated Timeline
          </label>
          <input
            value={timeline}
            onChange={e => setTimeline(e.target.value)}
            placeholder="e.g. 1 week, 2–4 weeks, 3 days…"
            className="focus-light w-full text-sm text-zinc-600 bg-white border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-zinc-900 shadow-sm placeholder-zinc-300"
            style={{ fontFamily: 'var(--font-body)' }}
          />
        </div>
      ) : (
        timeline && (
          <div className="mt-8 pt-6 border-t border-zinc-100">
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1"
              style={{ fontFamily: 'var(--font-body)' }}>Estimated Timeline</p>
            <p className="text-sm font-semibold text-zinc-800" style={{ fontFamily: 'var(--font-body)' }}>
              {timeline}
            </p>
          </div>
        )
      )}

      {/* Footer note — editable in internal, display-only in client */}
      {view === 'internal' ? (
        <div className="mt-6 pt-6 border-t border-zinc-200">
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
          <div className="mt-6 pt-6 border-t border-zinc-100">
            <p className="text-xs text-zinc-500 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
              <span className="font-bold text-zinc-700">Note:</span> {footerNote}
            </p>
          </div>
        )
      )}

      {/* Company info — screen only; print footer handles this */}
      {view === 'client' && (
        <div className="no-print mt-6 pt-5 border-t border-zinc-100 flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs text-zinc-400" style={{ fontFamily: 'var(--font-body)' }}>
            1616 N La Brea Ave Unit 302, Los Angeles, CA 90028
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

        <main className="pt-[144px] pb-20 sm:pb-0">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16 py-6 sm:py-10">
            <ProjectMeta {...metaProps} />
            <BudgetCalculator pmPercent={pmPercent} projectDesigner={projectDesigner} onAddItems={addItemsToFirst} />
            {estimatorContent}
          </div>
        </main>

        <footer className="hidden sm:block border-t border-zinc-200 py-4 mt-8">
          <div className="max-w-[1400px] mx-auto px-8 lg:px-16 flex justify-between items-center">
            <span className="text-xs text-zinc-400" style={{ fontFamily: 'var(--font-body)' }}>
              Little House Studio — Internal use only
            </span>
            <span className="text-xs text-zinc-400 tabular" style={{ fontFamily: 'var(--font-body)' }}>
              Studio $150–$200/hr · On-call $200/hr · PM $75/hr
            </span>
          </div>
        </footer>

        {bottomNav}
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
  function fmtLongDate(d) {
    const month = d.toLocaleDateString('en-US', { month: 'long' })
    return `${month} ${d.getDate()}, ${d.getFullYear()}`
  }
  const formattedDate = fmtLongDate(estimateDate
    ? new Date(estimateDate + 'T12:00:00')
    : new Date())

  const expiryDate = estimateDate
    ? fmtLongDate(new Date(new Date(estimateDate + 'T12:00:00').getTime() + validDays * 864e5))
    : null

  return (
    <div className="min-h-screen bg-white">
      <EstimatorHeader {...headerProps} />
      <ViewToggleBar view={view} setView={setView} />

      {/* ── Print-only header ── */}
      <div className="hidden print-show px-8 pt-8 pb-6 print-border-heavy" style={{ borderBottom: '2px solid #111' }}>
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1">
            <h1 className="text-4xl font-black leading-none mb-1"
              style={{ fontFamily: 'var(--font-display)', color: '#111' }}>
              {projectName || 'Project Estimate'}
            </h1>
            {projectDescription && (
              <p className="text-sm font-medium mb-2" style={{ fontFamily: 'var(--font-body)', color: '#555' }}>
                {projectDescription}
              </p>
            )}
            {(clientName || contact) && (
              <p className="text-sm font-bold mt-1" style={{ fontFamily: 'var(--font-body)', color: '#111' }}>
                {[clientName, contact].filter(Boolean).join(' · ')}
              </p>
            )}
            {clientAddress && (
              <p className="text-xs mt-0.5 whitespace-pre-line" style={{ fontFamily: 'var(--font-body)', color: '#555' }}>
                {clientAddress}
              </p>
            )}
            <div className="mt-4 pt-3" style={{ borderTop: '1px solid #e0e0e0' }}>
              {estimateNumber && (
                <p className="text-xs font-bold mb-2" style={{ fontFamily: 'var(--font-body)', color: '#111' }}>
                  {estimateNumber}
                </p>
              )}
              <p className="text-xs mb-1" style={{ fontFamily: 'var(--font-body)', color: '#555' }}>
                <span style={{ fontWeight: 700, color: '#333' }}>Estimate Date:</span> {formattedDate}
              </p>
              {expiryDate && (
                <p className="text-xs" style={{ fontFamily: 'var(--font-body)', color: '#555' }}>
                  <span style={{ fontWeight: 700, color: '#333' }}>Valid Through:</span> {expiryDate}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <img src={`${import.meta.env.BASE_URL}lhbi-logo.png`} alt="Little House Studio"
              className="h-32 w-auto object-contain" />
            <p className="text-sm font-bold tracking-[0.25em] uppercase mt-1"
              style={{ fontFamily: 'var(--font-display)', color: '#555' }}>
              Estimate
            </p>
          </div>
        </div>
      </div>

      <main className="pt-[144px] pb-20 sm:pb-0">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16 py-6 sm:py-10">

          {/* ── Screen-only header ── */}
          <div className="no-print mb-10 pb-8 border-b border-zinc-100">
            <div className="flex items-start justify-between gap-8">

              {/* Left: project + client info */}
              <div className="flex-1">
                <h1 className="text-2xl sm:text-4xl font-black text-zinc-900 leading-none mb-0.5"
                  style={{ fontFamily: 'var(--font-display)' }}>
                  {projectName || 'Project Estimate'}
                </h1>
                {projectDescription && (
                  <p className="text-zinc-500 text-sm font-medium mb-2" style={{ fontFamily: 'var(--font-body)' }}>
                    {projectDescription}
                  </p>
                )}
                {(clientName || contact) && (
                  <p className="text-zinc-900 text-sm font-bold mt-1" style={{ fontFamily: 'var(--font-body)' }}>
                    {[clientName, contact].filter(Boolean).join(' · ')}
                  </p>
                )}
                {clientAddress && (
                  <p className="text-zinc-500 text-xs mt-0.5 whitespace-pre-line" style={{ fontFamily: 'var(--font-body)' }}>
                    {clientAddress}
                  </p>
                )}
                <div className="mt-4 pt-3 border-t border-zinc-100">
                  {estimateNumber && (
                    <p className="text-xs font-bold text-zinc-900 mb-1" style={{ fontFamily: 'var(--font-body)' }}>
                      {estimateNumber}
                    </p>
                  )}
                  <p className="text-xs text-zinc-500 mb-0.5" style={{ fontFamily: 'var(--font-body)' }}>
                    <span className="font-bold text-zinc-700">Estimate Date:</span> {formattedDate}
                  </p>
                  {expiryDate && (
                    <p className="text-xs text-zinc-500" style={{ fontFamily: 'var(--font-body)' }}>
                      <span className="font-bold text-zinc-700">Valid Through:</span> {expiryDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: logo + ESTIMATE label + print */}
              <div className="flex flex-col items-end gap-3 flex-shrink-0">
                <div className="flex flex-col items-end gap-1.5">
                  <img
                    src={`${import.meta.env.BASE_URL}lhbi-logo.png`}
                    alt="Little House Studio"
                    className="h-24 w-auto object-contain"
                  />
                  <p className="text-zinc-500 text-sm font-bold tracking-[0.25em] uppercase"
                    style={{ fontFamily: 'var(--font-display)' }}>
                    Estimate
                  </p>
                </div>
                <button
                  onClick={() => {
                    const slug = [clientName, 'LH', estimateNumber]
                      .filter(Boolean)
                      .map(s => s.replace(/\s+/g, '-'))
                      .join('-')
                    const prev = document.title
                    document.title = slug || prev
                    window.print()
                    document.title = prev
                  }}
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

      {/* Pinned footer — print only, appears on every page */}
      <div className="print-footer hidden" style={{ fontFamily: 'var(--font-body)' }}>
        <span className="text-xs" style={{ color: '#555' }}>1616 N La Brea Ave Unit 302, Los Angeles, CA 90028</span>
        <span className="text-xs" style={{ color: '#555' }}>hello@littlehouse.studio</span>
      </div>

      {bottomNav}
    </div>
  )
}
