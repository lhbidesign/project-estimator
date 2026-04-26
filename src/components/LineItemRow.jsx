import { useRates } from '../contexts/RatesContext.jsx'
import { calcLine, fmt, fmtPct, marginColor } from '../utils/calc.js'

const GM_PILL = {
  green:  'bg-green-50 text-green-700 border border-green-200',
  yellow: 'bg-amber-50 text-amber-700 border border-amber-200',
  red:    'bg-red-50   text-red-700   border border-red-200',
}

export default function LineItemRow({ item, view, onChange, onDelete }) {
  const { resources } = useRates()
  const { billed, internal, gm } = calcLine(item, resources)
  const mc = marginColor(gm)

  function set(field, value) { onChange({ ...item, [field]: value }) }

  /* ── CLIENT VIEW ── */
  if (view === 'client') {
    return (
      <tr className="border-b border-zinc-100 last:border-0">
        <td className="py-3 pr-4 text-zinc-800 text-sm" style={{ fontFamily: 'var(--font-body)' }}>
          {item.name || <span className="text-zinc-400 italic">Untitled</span>}
        </td>
        <td className="py-3 pr-4 text-zinc-500 text-sm text-right tabular" style={{ fontFamily: 'var(--font-body)' }}>
          {Number(item.hours) || 0} hrs
        </td>
        <td className="py-3 text-zinc-900 text-sm text-right tabular font-bold" style={{ fontFamily: 'var(--font-body)' }}>
          {fmt(billed)}
        </td>
      </tr>
    )
  }

  /* ── INTERNAL VIEW ── */
  return (
    <tr className="border-b border-zinc-100 last:border-0 group hover:bg-zinc-50/70 transition-colors">
      <td className="py-2.5 pr-3 pl-5">
        <input
          value={item.name}
          onChange={e => set('name', e.target.value)}
          placeholder="Deliverable name"
          className="focus-light bg-transparent text-sm font-medium text-zinc-800 w-full outline-none focus:text-zinc-900 placeholder-zinc-300 transition-colors"
          style={{ fontFamily: 'var(--font-body)' }}
          aria-label="Deliverable name"
        />
      </td>

      <td className="py-2.5 pr-3">
        <select
          value={item.resource}
          onChange={e => set('resource', e.target.value)}
          className="focus-light border border-zinc-200 text-zinc-600 text-xs font-semibold rounded-lg px-2 py-1.5 outline-none focus:border-zinc-900 hover:border-zinc-300 bg-white cursor-pointer transition-colors"
          style={{ fontFamily: 'var(--font-body)' }}
          aria-label="Assigned resource"
        >
          {Object.entries(resources).map(([key, r]) => (
            <option key={key} value={key}>{r.label}</option>
          ))}
        </select>
      </td>

      <td className="py-2.5 pr-3 w-20">
        <input
          type="number" min="0" step="0.5"
          value={item.hours}
          onChange={e => set('hours', e.target.value)}
          className="focus-light border border-zinc-200 text-zinc-800 text-sm font-semibold text-right rounded-lg px-2.5 py-1.5 w-full outline-none focus:border-zinc-900 tabular bg-white"
          style={{ fontFamily: 'var(--font-body)' }}
          aria-label="Hours"
        />
      </td>

      <td className="py-2.5 pr-4 text-right text-zinc-400 text-sm tabular" style={{ fontFamily: 'var(--font-body)' }}>
        {fmt(internal)}
      </td>

      <td className="py-2.5 pr-4 text-right text-zinc-900 text-sm tabular font-bold" style={{ fontFamily: 'var(--font-body)' }}>
        {fmt(billed)}
      </td>

      <td className="py-2.5 pr-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold tabular float-right ${GM_PILL[mc]}`}
          style={{ fontFamily: 'var(--font-body)' }}>
          {fmtPct(gm)}
        </span>
      </td>

      <td className="py-2.5 pr-3 w-8">
        <button
          onClick={onDelete}
          className="focus-light opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-all"
          aria-label="Remove"
        >
          ×
        </button>
      </td>
    </tr>
  )
}
