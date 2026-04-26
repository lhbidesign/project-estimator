import { useState } from 'react'
import { nanoid } from '../utils/nanoid.js'
import { useRates } from '../contexts/RatesContext.jsx'

// Designers who can be assigned to a project (Mostafa handles renderings separately)
const DESIGN_RESOURCES = ['stef', 'becky', 'brandon', 'julio']

const CHEVRON = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23a1a1aa'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`
const selectStyle = {
  fontFamily: 'var(--font-body)',
  backgroundImage: CHEVRON,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 0.5rem center',
  backgroundSize: '1rem',
}

function Field({ label, children }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-black uppercase tracking-widest text-zinc-400 flex-shrink-0"
        style={{ fontFamily: 'var(--font-body)' }}>
        {label}
      </span>
      {children}
    </div>
  )
}

export default function ProjectMeta({
  projectName, setProjectName,
  clients, setClients,
  clientId, setClientId,
  contact, setContact,
  projectDesigner, setProjectDesigner,
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
    <div className="mb-8">
      {/* Project name */}
      <input
        value={projectName}
        onChange={e => setProjectName(e.target.value)}
        placeholder="Project name"
        className="focus-light bg-transparent text-3xl font-black text-zinc-900 placeholder-zinc-300 border-none outline-none w-full mb-4"
        style={{ fontFamily: 'var(--font-display)' }}
        aria-label="Project name"
      />

      {/* Metadata row */}
      <div className="flex items-center gap-5 flex-wrap">

        {/* Client */}
        <Field label="Client">
          {addingClient ? (
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') confirmNewClient()
                if (e.key === 'Escape') { setAddingClient(false); setNewName('') }
              }}
              onBlur={confirmNewClient}
              placeholder="Client name…"
              className="focus-light border border-zinc-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-zinc-900 bg-white w-48 outline-none focus:border-zinc-900"
              style={{ fontFamily: 'var(--font-body)' }}
            />
          ) : (
            <select
              value={clientId}
              onChange={e => {
                if (e.target.value === '__add__') { setAddingClient(true); return }
                setClientId(e.target.value)
                setContact('')
                setOtherContact(false)
              }}
              className="focus-light border border-zinc-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-zinc-800 bg-white outline-none focus:border-zinc-900 cursor-pointer appearance-none pr-7"
              style={selectStyle}
              aria-label="Client"
            >
              <option value="">Select client…</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              <option value="__add__">+ Add new client</option>
            </select>
          )}
        </Field>

        {/* Contact */}
        {clientId && (
          <Field label="Contact">
            {otherContact ? (
              <input
                autoFocus
                value={contact}
                onChange={e => setContact(e.target.value)}
                onBlur={() => { if (!contact) setOtherContact(false) }}
                placeholder="Contact name…"
                className="focus-light border border-zinc-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-zinc-800 bg-white w-36 outline-none focus:border-zinc-900"
                style={{ fontFamily: 'var(--font-body)' }}
              />
            ) : (
              <select
                value={contact}
                onChange={e => {
                  if (e.target.value === '__other__') { setOtherContact(true); setContact(''); return }
                  setContact(e.target.value)
                }}
                className="focus-light border border-zinc-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-zinc-800 bg-white outline-none focus:border-zinc-900 cursor-pointer appearance-none pr-7"
                style={selectStyle}
                aria-label="Contact"
              >
                <option value="">Select contact…</option>
                {(selectedClient?.contacts ?? []).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="__other__">Other…</option>
              </select>
            )}
          </Field>
        )}

        {/* Divider */}
        <span className="text-zinc-200 text-sm hidden sm:block">|</span>

        {/* Project Designer */}
        <Field label="Designer">
          <select
            value={projectDesigner}
            onChange={e => setProjectDesigner(e.target.value)}
            className="focus-light border border-zinc-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-zinc-800 bg-white outline-none focus:border-zinc-900 cursor-pointer appearance-none pr-7"
            style={selectStyle}
            aria-label="Project designer"
          >
            {DESIGN_RESOURCES.map(key => (
              resources[key] && (
                <option key={key} value={key}>{resources[key].label}</option>
              )
            ))}
          </select>
          <span className="text-xs text-zinc-400 hidden lg:block" style={{ fontFamily: 'var(--font-body)' }}>
            default per line — override per item
          </span>
        </Field>

      </div>
    </div>
  )
}
