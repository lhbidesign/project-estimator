import { useState } from 'react'
import { binCreate, binRead, binWrite, getSyncConfig, setSyncConfig, SYNC_KEY, SYNC_BIN_ID } from '../utils/sharedStorage.js'

const API_KEY_STORE = 'lh-api-key'

function Section({ title, children }) {
  return (
    <section className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
      <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-5"
        style={{ fontFamily: 'var(--font-body)' }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

function StatusDot({ ok }) {
  return <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${ok ? 'bg-green-500' : 'bg-zinc-300'}`} />
}

export default function SettingsPage() {
  // ── Anthropic API key ──
  const storedApiKey = localStorage.getItem(API_KEY_STORE) ?? ''
  const [apiDraft,  setApiDraft]  = useState(storedApiKey)
  const [showApi,   setShowApi]   = useState(false)
  const [apiStatus, setApiStatus] = useState('')

  const apiDirty = apiDraft.trim() !== storedApiKey.trim()

  function flashApi(msg) { setApiStatus(msg); setTimeout(() => setApiStatus(''), 2500) }

  function handleSaveApi() {
    const key = apiDraft.trim()
    if (!key) return
    localStorage.setItem(API_KEY_STORE, key)
    flashApi('saved')
  }
  function handleRemoveApi() {
    if (!confirm('Remove the saved API key?')) return
    localStorage.removeItem(API_KEY_STORE)
    setApiDraft('')
    flashApi('removed')
  }

  // ── Team sync (JSONbin) ──
  const cfg = getSyncConfig()
  const [syncKey,      setSyncKey]      = useState(cfg.apiKey)
  const [syncBinId,    setSyncBinId]    = useState(cfg.binId)
  const [syncStatus,   setSyncStatus]   = useState('')
  const [syncWorking,  setSyncWorking]  = useState(false)

  const syncConfigured = Boolean(syncKey.trim() && syncBinId.trim())

  function flashSync(msg) { setSyncStatus(msg); setTimeout(() => setSyncStatus(''), 3000) }

  function saveSyncConfig() {
    setSyncConfig({ apiKey: syncKey.trim(), binId: syncBinId.trim() })
  }

  async function handleCreateBin() {
    if (!syncKey.trim()) { flashSync('Enter an API key first.'); return }
    setSyncWorking(true)
    try {
      const id = await binCreate(syncKey.trim())
      setSyncBinId(id)
      setSyncConfig({ apiKey: syncKey.trim(), binId: id })
      flashSync('Bin created — share this Bin ID with your team.')
    } catch (e) {
      flashSync(`Error: ${e.message}`)
    } finally {
      setSyncWorking(false)
    }
  }

  async function handleTestSync() {
    if (!syncConfigured) { flashSync('Enter both API key and Bin ID first.'); return }
    setSyncWorking(true)
    saveSyncConfig()
    try {
      await binRead(syncKey.trim(), syncBinId.trim())
      flashSync('✓ Connected — estimates will sync automatically.')
    } catch (e) {
      flashSync(`Connection failed: ${e.message}`)
    } finally {
      setSyncWorking(false)
    }
  }

  return (
    <div className="pt-[80px] min-h-screen" style={{ background: 'var(--page-bg)' }}>
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

          {/* ── Anthropic API Key ── */}
          <Section title="AI Configuration">
            <div className="flex items-center gap-2 mb-5">
              <StatusDot ok={Boolean(storedApiKey)} />
              <span className="text-sm font-semibold text-zinc-700" style={{ fontFamily: 'var(--font-body)' }}>
                {storedApiKey ? 'API key is saved' : 'No API key saved'}
              </span>
              {apiStatus === 'saved'   && <span className="text-xs text-green-600 font-semibold ml-auto">Saved ✓</span>}
              {apiStatus === 'removed' && <span className="text-xs text-zinc-400 ml-auto">Removed</span>}
            </div>

            <p className="text-sm text-zinc-500 mb-4" style={{ fontFamily: 'var(--font-body)' }}>
              Powers the Generate tab. Stored only in this browser — sent only to Anthropic.
            </p>

            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <input
                  type={showApi ? 'text' : 'password'}
                  value={apiDraft}
                  onChange={e => setApiDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && apiDraft.trim()) handleSaveApi() }}
                  placeholder="sk-ant-api…"
                  autoComplete="off" spellCheck={false}
                  className="focus-light w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 bg-white outline-none focus:border-zinc-900 pr-16 font-mono"
                />
                <button
                  onClick={() => setShowApi(v => !v)}
                  className="focus-light absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 hover:text-zinc-700 uppercase tracking-wider"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {showApi ? 'Hide' : 'Show'}
                </button>
              </div>
              <button
                onClick={handleSaveApi}
                disabled={!apiDraft.trim() || !apiDirty}
                className="focus-light px-4 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ fontFamily: 'var(--font-body)', backgroundColor: 'var(--lime)', color: '#0c0c0c' }}
              >
                Save
              </button>
            </div>

            {storedApiKey && (
              <button onClick={handleRemoveApi}
                className="focus-light text-xs font-bold text-zinc-400 hover:text-red-500 uppercase tracking-wider transition-colors"
                style={{ fontFamily: 'var(--font-body)' }}>
                Remove saved key
              </button>
            )}
          </Section>

          {/* ── Team Sync ── */}
          <Section title="Team Sync — Shared Estimates">
            <p className="text-sm text-zinc-500 mb-5" style={{ fontFamily: 'var(--font-body)' }}>
              Share saved estimates across your whole team. Uses{' '}
              <strong className="text-zinc-700">JSONbin.io</strong> — free, no install required.
              All team members enter the same API key and Bin ID.
            </p>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-1.5"
                  style={{ fontFamily: 'var(--font-body)' }}>
                  JSONbin API Key (X-Master-Key)
                </label>
                <input
                  type="password"
                  value={syncKey}
                  onChange={e => setSyncKey(e.target.value)}
                  onBlur={saveSyncConfig}
                  placeholder="$2b$10$… (from jsonbin.io → Account Details)"
                  autoComplete="off" spellCheck={false}
                  className="focus-light w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 bg-white outline-none focus:border-zinc-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-1.5"
                  style={{ fontFamily: 'var(--font-body)' }}>
                  Bin ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={syncBinId}
                    onChange={e => setSyncBinId(e.target.value)}
                    onBlur={saveSyncConfig}
                    placeholder="Paste existing Bin ID, or create one below"
                    autoComplete="off"
                    className="focus-light flex-1 border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 bg-white outline-none focus:border-zinc-900 font-mono"
                  />
                  <button
                    onClick={handleCreateBin}
                    disabled={syncWorking || !syncKey.trim()}
                    className="focus-light px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider border border-zinc-200 text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {syncWorking ? '…' : 'Create new'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleTestSync}
                disabled={syncWorking || !syncConfigured}
                className="focus-light px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                style={{ fontFamily: 'var(--font-body)', backgroundColor: 'var(--lime)', color: '#0c0c0c' }}
              >
                {syncWorking ? 'Connecting…' : 'Test connection'}
              </button>

              {syncStatus && (
                <span className={`text-xs font-semibold ${syncStatus.startsWith('Error') || syncStatus.startsWith('Connection') ? 'text-red-500' : 'text-green-600'}`}
                  style={{ fontFamily: 'var(--font-body)' }}>
                  {syncStatus}
                </span>
              )}
            </div>

            {syncBinId && (
              <div className="mt-4 p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                <p className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-1"
                  style={{ fontFamily: 'var(--font-body)' }}>
                  Share with your team
                </p>
                <p className="text-xs text-zinc-600 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                  Have teammates enter the same API key and Bin ID above, then click "Test connection."
                  Estimates sync automatically on every save.
                </p>
                <p className="text-xs font-mono text-zinc-700 mt-2 bg-white border border-zinc-200 rounded px-2 py-1.5 select-all">
                  {syncBinId}
                </p>
              </div>
            )}
          </Section>

          <div className="bg-zinc-50 border border-zinc-200 rounded-xl px-5 py-4 space-y-2">
            <p className="text-xs text-zinc-500 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
              <strong className="text-zinc-700">Anthropic key:</strong> console.anthropic.com → API Keys → Create Key
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
              <strong className="text-zinc-700">JSONbin key:</strong> jsonbin.io → Sign up free → Account Details → Secret Key
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
