import { useState } from 'react'

const KEY_STORE = 'lh-api-key'

export default function SettingsPage() {
  const [apiKey,   setApiKeyState] = useState(() => localStorage.getItem(KEY_STORE) ?? '')
  const [showKey,  setShowKey]     = useState(false)
  const [saved,    setSaved]       = useState(false)

  function saveKey(k) {
    setApiKeyState(k)
    if (k.trim()) localStorage.setItem(KEY_STORE, k.trim())
    else          localStorage.removeItem(KEY_STORE)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function clearKey() {
    if (confirm('Remove the saved API key?')) saveKey('')
  }

  const isSet = Boolean(apiKey.trim())

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

          {/* AI / API Key */}
          <section className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-1">
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500"
                style={{ fontFamily: 'var(--font-body)' }}>
                AI Configuration
              </h2>
              {saved && (
                <span className="text-xs font-semibold text-green-600 flex items-center gap-1.5"
                  style={{ fontFamily: 'var(--font-body)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  Saved
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-500 mb-5" style={{ fontFamily: 'var(--font-body)' }}>
              Your Anthropic API key is used to generate estimates in the Generate tab. It's stored only in this browser and never sent anywhere other than Anthropic directly.
            </p>

            {/* Status badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isSet ? 'bg-green-500' : 'bg-zinc-300'}`} />
              <span className="text-sm font-semibold text-zinc-700" style={{ fontFamily: 'var(--font-body)' }}>
                {isSet ? 'API key configured' : 'No API key set'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => saveKey(e.target.value)}
                  placeholder="sk-ant-api…"
                  className="focus-light w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 bg-white outline-none focus:border-zinc-900 pr-20 font-mono"
                  aria-label="Anthropic API key"
                />
                <button
                  onClick={() => setShowKey(v => !v)}
                  className="focus-light absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 hover:text-zinc-700 transition-colors uppercase tracking-wider"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>

              {isSet && (
                <button
                  onClick={clearKey}
                  className="focus-light text-xs font-bold text-zinc-400 hover:text-red-500 uppercase tracking-wider transition-colors"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  Remove API key
                </button>
              )}
            </div>
          </section>

          {/* Info note */}
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
