import { useState } from 'react'

const KEY_STORE = 'lh-api-key'

export default function SettingsPage() {
  const stored = localStorage.getItem(KEY_STORE) ?? ''

  // draft = what's in the input right now (not yet saved)
  const [draft,    setDraft]    = useState(stored)
  const [showKey,  setShowKey]  = useState(false)
  const [status,   setStatus]   = useState('')   // 'saved' | 'removed' | ''

  const isSaved   = Boolean(stored)
  const isDirty   = draft.trim() !== stored.trim()

  function flash(msg) {
    setStatus(msg)
    setTimeout(() => setStatus(''), 2500)
  }

  function handleSave() {
    const key = draft.trim()
    if (!key) return
    localStorage.setItem(KEY_STORE, key)
    flash('saved')
  }

  function handleRemove() {
    if (!confirm('Remove the saved API key?')) return
    localStorage.removeItem(KEY_STORE)
    setDraft('')
    flash('removed')
  }

  const currentlySaved = localStorage.getItem(KEY_STORE) ?? ''

  return (
    <div className="pt-[68px] min-h-screen" style={{ background: 'var(--page-bg)' }}>
      <div className="max-w-[1400px] mx-auto px-8 lg:px-16 py-10">

        <div className="mb-8">
          <h1 className="text-3xl font-black text-zinc-900" style={{ fontFamily: 'var(--font-display)' }}>
            Settings
          </h1>
          <p className="text-zinc-500 text-sm mt-1" style={{ fontFamily: 'var(--font-body)' }}>
            Configuration for your Little House Studio workspace.
          </p>
        </div>

        <div className="max-w-xl space-y-6">

          <section className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500"
                style={{ fontFamily: 'var(--font-body)' }}>
                AI Configuration
              </h2>
              {status === 'saved' && (
                <span className="text-xs font-semibold text-green-600 flex items-center gap-1.5"
                  style={{ fontFamily: 'var(--font-body)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  Key saved
                </span>
              )}
              {status === 'removed' && (
                <span className="text-xs font-semibold text-zinc-400" style={{ fontFamily: 'var(--font-body)' }}>
                  Key removed
                </span>
              )}
            </div>

            <p className="text-sm text-zinc-500 mb-5" style={{ fontFamily: 'var(--font-body)' }}>
              Your Anthropic API key powers the Generate tab. Stored only in this browser — never sent anywhere other than Anthropic directly.
            </p>

            {/* Status indicator */}
            <div className="flex items-center gap-2 mb-5">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${stored ? 'bg-green-500' : 'bg-zinc-300'}`} />
              <span className="text-sm font-semibold text-zinc-700" style={{ fontFamily: 'var(--font-body)' }}>
                {stored ? 'API key is saved' : 'No API key saved'}
              </span>
            </div>

            {/* Input + Save button */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && draft.trim()) handleSave() }}
                    placeholder="sk-ant-api…"
                    className="focus-light w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 bg-white outline-none focus:border-zinc-900 pr-16 font-mono"
                    aria-label="Anthropic API key"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button
                    onClick={() => setShowKey(v => !v)}
                    className="focus-light absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 hover:text-zinc-700 transition-colors uppercase tracking-wider"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {showKey ? 'Hide' : 'Show'}
                  </button>
                </div>
                <button
                  onClick={handleSave}
                  disabled={!draft.trim() || !isDirty}
                  className="focus-light px-4 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    fontFamily: 'var(--font-body)',
                    backgroundColor: 'var(--lime)',
                    color: '#0c0c0c',
                  }}
                >
                  Save
                </button>
              </div>

              {stored && (
                <button
                  onClick={handleRemove}
                  className="focus-light text-xs font-bold text-zinc-400 hover:text-red-500 uppercase tracking-wider transition-colors"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  Remove saved key
                </button>
              )}
            </div>
          </section>

          <div className="bg-zinc-50 border border-zinc-200 rounded-xl px-5 py-4">
            <p className="text-xs text-zinc-500 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
              <strong className="text-zinc-700">Where to get a key:</strong> Visit{' '}
              <span className="font-mono text-zinc-600">console.anthropic.com</span> → API Keys → Create Key.
              Use a key with access to Claude Sonnet models.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
