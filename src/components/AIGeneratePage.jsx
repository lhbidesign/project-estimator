import { useState, useRef } from 'react'
import { useRates } from '../contexts/RatesContext.jsx'
import { nanoid } from '../utils/nanoid.js'
import Anthropic from '@anthropic-ai/sdk'

const KEY_STORE = 'lh-api-key'

const ACCEPTED = '.txt,.md,.csv,.pdf,.png,.jpg,.jpeg,.webp,.gif'
const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])

function buildSystemPrompt(resources, hourGuides, pmRate) {
  const rateLines = Object.entries(resources)
    .map(([k, r]) => `  ${k}: ${r.label} — $${r.billedRate}/hr billed, $${r.internalRate}/hr internal`)
    .join('\n')
  const guideLines = hourGuides
    .map(g => `  [${g.projectCategory}] ${g.name}: ${g.min}–${g.max} hrs (${resources[g.resource]?.label ?? g.resource})`)
    .join('\n')

  return `You are an expert project estimator for Little House Studio, an experiential design agency specializing in brand activations and experiential events. Little House does NOT do print production.

Mostafa handles all 3D and rendering work. Stef is the primary graphic designer. Becky handles creative direction/concepting. Brandon handles production-heavy design tasks.

TEAM & RATES:
${rateLines}

PROJECT MANAGER (Dee): $${pmRate}/hr internal, billed as overhead %.

TYPICAL HOUR RANGES (format: [category] name: min–max hrs):
${guideLines}

ESTIMATION RULES:
- Assign mostafa_general for standard renderings/3D, mostafa_oncall for rush/on-call work
- Use the hour guide ranges as reference — scale by complexity
- If the brief has multiple programs or phases, create separate labeled sections
- Be specific and realistic. Better to estimate slightly high than to undersell.

Respond ONLY with a valid JSON object — no markdown, no explanation outside the JSON:
{
  "projectName": "string",
  "clientName": "string",
  "reasoning": "1–2 sentence summary of estimation approach",
  "sections": [
    {
      "label": "string (empty for single-section)",
      "items": [
        {
          "name": "string",
          "resource": "exact resource key",
          "hours": number,
          "category": "renderings or graphic_design"
        }
      ]
    }
  ]
}`
}

async function readFileData(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()

    if (file.type === 'application/pdf' || IMAGE_TYPES.has(file.type)) {
      reader.onload = e => {
        const dataUrl = e.target.result
        const base64  = dataUrl.split(',')[1]
        resolve({ kind: file.type === 'application/pdf' ? 'pdf' : 'image', mimeType: file.type, base64, name: file.name })
      }
      reader.onerror = () => resolve({ kind: 'text', content: `[Could not read: ${file.name}]`, name: file.name })
      reader.readAsDataURL(file)
    } else {
      reader.onload = e => resolve({ kind: 'text', content: e.target.result ?? '', name: file.name })
      reader.onerror = () => resolve({ kind: 'text', content: `[Could not read: ${file.name}]`, name: file.name })
      reader.readAsText(file)
    }
  })
}

function fileIcon(file) {
  if (file.type === 'application/pdf') return '📄'
  if (IMAGE_TYPES.has(file.type)) return '🖼'
  return '📝'
}

export default function AIGeneratePage({ onApply }) {
  const { resources, hourGuides, pmRate } = useRates()

  const [apiKey,  setApiKey]  = useState(() => localStorage.getItem(KEY_STORE) ?? '')
  const [showKey, setShowKey] = useState(!localStorage.getItem(KEY_STORE))
  const [brief,   setBrief]   = useState('')
  const [files,   setFiles]   = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [result,  setResult]  = useState(null)
  const fileRef = useRef()
  const dropRef = useRef()

  function saveKey(k) {
    setApiKey(k)
    if (k) localStorage.setItem(KEY_STORE, k)
    else localStorage.removeItem(KEY_STORE)
  }

  function addFiles(incoming) {
    setFiles(prev => [...prev, ...Array.from(incoming)])
  }

  function onDrop(e) {
    e.preventDefault()
    dropRef.current?.classList.remove('border-zinc-400')
    addFiles(e.dataTransfer.files)
  }

  async function generate() {
    if (!apiKey.trim())                         { setError('Enter your Anthropic API key first.'); return }
    if (!brief.trim() && files.length === 0)    { setError('Add a brief or attach a file.'); return }

    setError(''); setLoading(true); setResult(null)

    try {
      const fileDataList = await Promise.all(files.map(readFileData))

      // Build message content array
      const content = []
      if (brief.trim()) content.push({ type: 'text', text: brief.trim() })

      for (const fd of fileDataList) {
        if (fd.kind === 'text') {
          content.push({ type: 'text', text: `[File: ${fd.name}]\n${fd.content}` })
        } else if (fd.kind === 'pdf') {
          content.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: fd.base64 } })
          content.push({ type: 'text', text: `(file name: ${fd.name})` })
        } else if (fd.kind === 'image') {
          content.push({ type: 'image', source: { type: 'base64', media_type: fd.mimeType, data: fd.base64 } })
          content.push({ type: 'text', text: `(image: ${fd.name})` })
        }
      }

      const client = new Anthropic({ apiKey: apiKey.trim(), dangerouslyAllowBrowser: true })
      const msg = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: buildSystemPrompt(resources, hourGuides, pmRate),
        messages: [{ role: 'user', content }],
      })

      const raw       = msg.content[0]?.text ?? ''
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('Could not parse a valid estimate from the response.')
      const data = JSON.parse(jsonMatch[0])

      const sections = (data.sections ?? []).map(s => ({
        id: nanoid(),
        label: s.label ?? '',
        items: (s.items ?? []).map(item => ({
          id:       nanoid(),
          name:     item.name ?? '',
          resource: item.resource in resources ? item.resource : 'brandon',
          hours:    Number(item.hours) || 8,
          category: item.category ?? 'graphic_design',
        })),
      }))

      setResult({ ...data, sections })
    } catch (e) {
      setError(e.message ?? 'Something went wrong. Check your API key and try again.')
    } finally {
      setLoading(false)
    }
  }

  const totalHrs = result?.sections?.flatMap(s => s.items).reduce((a, i) => a + i.hours, 0) ?? 0

  return (
    <div className="pt-[68px] min-h-screen" style={{ background: 'var(--page-bg)' }}>
      <div className="max-w-[1400px] mx-auto px-8 lg:px-16 py-10">

        <div className="mb-8">
          <h1 className="text-3xl font-black text-zinc-900" style={{ fontFamily: 'var(--font-display)' }}>
            Generate Estimate
          </h1>
          <p className="text-zinc-500 text-sm mt-1" style={{ fontFamily: 'var(--font-body)' }}>
            Describe the project or attach a brief — Claude generates a scoped estimate using your rate card.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Left: inputs ── */}
          <div className="lg:col-span-3 space-y-4">

            {/* API Key */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-500"
                  style={{ fontFamily: 'var(--font-body)' }}>Anthropic API Key</label>
                <button
                  onClick={() => setShowKey(v => !v)}
                  className="focus-light text-xs text-zinc-400 hover:text-zinc-700 font-semibold transition-colors"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {showKey ? 'Hide' : 'Change'}
                </button>
              </div>
              {showKey ? (
                <div className="space-y-2">
                  <input
                    type="password" value={apiKey} onChange={e => saveKey(e.target.value)}
                    placeholder="sk-ant-…"
                    className="focus-light w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-900 bg-white outline-none focus:border-zinc-900 font-mono"
                  />
                  <p className="text-xs text-zinc-400" style={{ fontFamily: 'var(--font-body)' }}>
                    Stored in your browser only — never sent anywhere except directly to Anthropic.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-zinc-500 font-mono">
                  {apiKey ? `${apiKey.slice(0, 10)}${'•'.repeat(12)}` : <span className="text-zinc-400 italic">Not set</span>}
                </p>
              )}
            </div>

            {/* Brief */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-3"
                style={{ fontFamily: 'var(--font-body)' }}>
                Project Brief / Context
              </label>
              <textarea
                value={brief}
                onChange={e => setBrief(e.target.value)}
                placeholder="Paste a client email, RFP, scope of work, or describe the project in your own words…"
                rows={7}
                className="focus-light w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-800 bg-white resize-none outline-none focus:border-zinc-900 placeholder-zinc-300 leading-relaxed"
                style={{ fontFamily: 'var(--font-body)' }}
              />
            </div>

            {/* File upload */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-3"
                style={{ fontFamily: 'var(--font-body)' }}>
                Attach Files
                <span className="normal-case tracking-normal font-medium text-zinc-400 ml-2">
                  PDF, images, or text files
                </span>
              </label>

              <div
                ref={dropRef}
                onDragOver={e => { e.preventDefault(); dropRef.current.classList.add('border-zinc-400') }}
                onDragLeave={() => dropRef.current.classList.remove('border-zinc-400')}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-zinc-200 rounded-xl py-7 text-center cursor-pointer hover:border-zinc-400 transition-colors group"
              >
                <p className="text-sm font-semibold text-zinc-400 group-hover:text-zinc-600 transition-colors"
                  style={{ fontFamily: 'var(--font-body)' }}>
                  Drag & drop or click to upload
                </p>
                <p className="text-xs text-zinc-300 mt-1" style={{ fontFamily: 'var(--font-body)' }}>
                  PDF · PNG · JPG · WEBP · TXT · MD
                </p>
              </div>
              <input ref={fileRef} type="file" multiple accept={ACCEPTED} className="hidden"
                onChange={e => { addFiles(e.target.files); e.target.value = '' }} />

              {files.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {files.map((f, i) => (
                    <li key={i} className="flex items-center justify-between text-sm bg-zinc-50 rounded-lg px-3 py-2 border border-zinc-100">
                      <span className="flex items-center gap-2 text-zinc-700" style={{ fontFamily: 'var(--font-body)' }}>
                        <span>{fileIcon(f)}</span>
                        <span className="truncate max-w-xs">{f.name}</span>
                        <span className="text-zinc-400 text-xs">({(f.size / 1024).toFixed(0)} KB)</span>
                      </span>
                      <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                        className="focus-light text-zinc-300 hover:text-red-500 transition-colors ml-2 text-base">
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-sm text-red-700 font-medium" style={{ fontFamily: 'var(--font-body)' }}>{error}</p>
              </div>
            )}

            <button
              onClick={generate} disabled={loading}
              className="focus-light w-full py-3.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.99]"
              style={{ backgroundColor: 'var(--lime)', color: '#0c0c0c', fontFamily: 'var(--font-display)' }}
            >
              {loading ? 'Generating…' : 'Generate Estimate'}
            </button>
          </div>

          {/* ── Right: preview ── */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden sticky top-20">
              <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-zinc-500"
                  style={{ fontFamily: 'var(--font-body)' }}>Preview</span>
                {result && (
                  <span className="text-xs text-zinc-400 tabular" style={{ fontFamily: 'var(--font-body)' }}>
                    {totalHrs} hrs total
                  </span>
                )}
              </div>

              {loading && (
                <div className="px-5 py-14 text-center">
                  <div className="inline-block w-6 h-6 border-2 border-zinc-200 border-t-zinc-800 rounded-full animate-spin mb-3" />
                  <p className="text-sm text-zinc-400" style={{ fontFamily: 'var(--font-body)' }}>Analyzing brief…</p>
                </div>
              )}

              {!loading && !result && (
                <div className="px-5 py-14 text-center">
                  <p className="text-sm text-zinc-400 italic" style={{ fontFamily: 'var(--font-body)' }}>
                    Generated estimate will appear here
                  </p>
                </div>
              )}

              {!loading && result && (
                <div className="px-5 py-5 max-h-[75vh] overflow-y-auto">
                  {result.projectName && (
                    <p className="font-black text-zinc-900 text-base mb-0.5" style={{ fontFamily: 'var(--font-display)' }}>
                      {result.projectName}
                    </p>
                  )}
                  {result.clientName && (
                    <p className="text-sm text-zinc-500 mb-3" style={{ fontFamily: 'var(--font-body)' }}>
                      {result.clientName}
                    </p>
                  )}
                  {result.reasoning && (
                    <div className="bg-zinc-50 border border-zinc-100 rounded-lg px-3 py-2.5 mb-4">
                      <p className="text-xs text-zinc-500 italic leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                        {result.reasoning}
                      </p>
                    </div>
                  )}

                  <div className="space-y-5">
                    {result.sections.map(s => (
                      <div key={s.id}>
                        {s.label && (
                          <p className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-2"
                            style={{ fontFamily: 'var(--font-body)' }}>{s.label}</p>
                        )}
                        {s.items.map(item => (
                          <div key={item.id}
                            className="flex items-baseline justify-between text-sm py-1.5 border-b border-zinc-50 last:border-0 gap-3">
                            <div className="flex-1 min-w-0">
                              <span className="text-zinc-700 font-medium" style={{ fontFamily: 'var(--font-body)' }}>
                                {item.name}
                              </span>
                              <span className="text-zinc-400 text-xs ml-1.5" style={{ fontFamily: 'var(--font-body)' }}>
                                {resources[item.resource]?.label}
                              </span>
                            </div>
                            <span className="text-zinc-600 tabular font-semibold flex-shrink-0"
                              style={{ fontFamily: 'var(--font-body)' }}>
                              {item.hours} hrs
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => { onApply(result) }}
                    className="focus-light mt-6 w-full py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all hover:opacity-90"
                    style={{ backgroundColor: 'var(--lime)', color: '#0c0c0c', fontFamily: 'var(--font-display)' }}
                  >
                    Apply to Estimator →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
