import { useState } from 'react'
import { nanoid } from '../utils/nanoid.js'
import { useRates } from '../contexts/RatesContext.jsx'

const DESIGN_RESOURCES = ['stef', 'becky', 'brandon', 'julio']

const CHEVRON = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23a1a1aa'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`
const selectStyle = {
  fontFamily: 'var(--font-body)',
  backgroundImage: CHEVRON,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 0.5rem center',
  backgroundSize: '1rem',
}

export default function ProjectMeta({
  projectName, setProjectName,
  clients, setClients,
  clientId, setClientId,
  contact, setContact,
  projectDesigner, setProjectDesigner,
  hideHours, setHideHours,
  onSave, justSaved,
  onReset,
}) {
  const { resources } = useRates()
  const [addingClient, setAddingClient] = useState(false)
  const [newName, setNewName]           = useState('')
  const [otherContact, setOtherContact] = useState(false)

  const selectedClient = clients.find(c => c.id === clientId)

  function confirmNewClient() {
    const name = newName.trim()
    if (!name) { setAddingClient(false); return }
    const id = `client_${nanoid()}`
    setClients(prev => [...prev, { id, name, contacts: [] }])
    setClientId(id)
    setContact('')
    setAddingClient(false)
    setNewName('')
  }

  return (
    <div className="mb-6">
      {/* Row 1: project name + Save/Reset */}
      <div className="flex items-center gap-3 mb-4">
        <input
          value={projectName}
          onChange={e => setProjectName(e.target.value)}
          placeholder="Project name"
          className="focus-light flex-1 bg-transparent text-3xl font-black text-zinc-900 placeholder-zinc-300 border-none outline-none min-w-0"
          style={{ fontFamily: 'var(--font-display)' }}
          aria-label="Project name"
        />
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onReset}
            className="focus-light text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-700 border border-zinc-200 hover:border-zinc-400 px-3 py-1.5 rounded-lg transition-all"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Reset
          </button>
          <button
            onClick={onSave}
            className="focus-light text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-lg transition-all"
            style={{
              fontFamily: 'var(--font-body)',
              ...(justSaved
                ? { backgroundColor: 'rgba(204,255,0,0.15)', color: '#4e6300', border: '1px solid rgba(204,255,0,0.3)' }
                : { backgroundColor: 'var(--lime)', color: '#0c0c0c' }
              ),
            }}
          >
            {justSaved ? '✓ Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* Row 2: metadata */}
      <div className="flex items-center gap-4 flex-wrap">

        {/* Client */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-widest text-zinc-400 flex-shrink-0"
            style={{ fontFamily: 'var(--font-body)' }}>Client</span>
          {addingClient ? (
            <input
              autoFocus value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') confirmNewClient(); if (e.key === 'Escape') { setAddingClient(false); setNewName('') } }}
              onBlur={confirmNewClient}
              placeholder="Client name…"
              className="focus-light border border-zinc-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-zinc-900 bg-white w-48 outline-none focus:border-zinc-900"
              style={{ fontFamily: 'var(--font-body)' }}
            />
          ) : (
            <select
              value={clientId}
              onChange={e => { if (e.target.value === '__add__') { setAddingClient(true); return } setClientId(e.target.value); setContact(''); setOtherContact(false) }}
              className="focus-light border border-zinc-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-zinc-800 bg-white outline-none focus:border-zinc-900 cursor-pointer appearance-none pr-7"
              style={selectStyle}
            >
              <option value="">Select client…</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              <option value="__add__">+ Add new client</option>
            </select>
          )}
        </div>

        {/* Contact */}
        {clientId && (
          <div className="flex items-center gap-2">
            <span className="text-zinc-200 text-sm">·</span>
            <span className="text-xs font-black uppercase tracking-widest text-zinc-400 flex-shrink-0"
              style={{ fontFamily: 'var(--font-body)' }}>Contact</span>
            {otherContact ? (
              <input
                autoFocus value={contact}
                onChange={e => setContact(e.target.value)}
                onBlur={() => { if (!contact) setOtherContact(false) }}
                placeholder="Contact name…"
                className="focus-light border border-zinc-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-zinc-800 bg-white w-36 outline-none focus:border-zinc-900"
                style={{ fontFamily: 'var(--font-body)' }}
              />
            ) : (
              <select
                value={contact}
                onChange={e => { if (e.target.value === '__other__') { setOtherContact(true); setContact(''); return } setContact(e.target.value) }}
                className="focus-light border border-zinc-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-zinc-800 bg-white outline-none focus:border-zinc-900 cursor-pointer appearance-none pr-7"
                style={selectStyle}
              >
                <option value="">Select contact…</option>
                {(selectedClient?.contacts ?? []).map(c => <option key={c} value={c}>{c}</option>)}
                <option value="__other__">Other…</option>
              </select>
            )}
          </div>
        )}

        <span className="text-zinc-200 text-sm hidden sm:block">|</span>

        {/* Project Designer */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-widest text-zinc-400 flex-shrink-0"
            style={{ fontFamily: 'var(--font-body)' }}>Designer</span>
          <select
            value={projectDesigner}
            onChange={e => setProjectDesigner(e.target.value)}
            className="focus-light border border-zinc-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-zinc-800 bg-white outline-none focus:border-zinc-900 cursor-pointer appearance-none pr-7"
            style={selectStyle}
          >
            {DESIGN_RESOURCES.map(key => resources[key] && (
              <option key={key} value={key}>{resources[key].label}</option>
            ))}
          </select>
        </div>

        {/* Hide hours toggle */}
        <label className="flex items-center gap-2 ml-auto cursor-pointer">
          <div
            onClick={() => setHideHours(v => !v)}
            className={`relative w-8 h-4.5 rounded-full transition-colors cursor-pointer flex-shrink-0 ${hideHours ? 'bg-zinc-800' : 'bg-zinc-200'}`}
            style={{ height: '18px', width: '32px' }}
            role="switch"
            aria-checked={hideHours}
          >
            <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${hideHours ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-xs font-semibold text-zinc-500 select-none" style={{ fontFamily: 'var(--font-body)' }}>
            Hide hours in client view
          </span>
        </label>
      </div>
    </div>
  )
}
