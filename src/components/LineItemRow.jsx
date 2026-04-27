import { useRates } from '../contexts/RatesContext.jsx'
import { calcLine, fmt, fmtPct, marginColor } from '../utils/calc.js'

const GM_PILL = {
  green:  'bg-green-50 text-green-700 border border-green-200',
  yellow: 'bg-amber-50 text-amber-700 border border-amber-200',
  red:    'bg-red-50   text-red-700   border border-red-200',
}

export default function LineItemRow({ item, view, onChange, onDelete, hideHours, hideRate }) {
  const { resources } = useRates()
  const { billed, internal, gm, rate, isFlat } = calcLine(item, resources)
  const mc = marginColor(isFlat ? 0 : gm)

  function set(field, value) { onChange({ ...item, [field]: value }) }
  function toggleFlat() {
    onChange({ ...item, isFlat: !item.isFlat, flatAmount: item.flatAmount ?? billed ?? 0 })
  }

  /* ── CLIENT VIEW ── */
  if (view === 'client') {
    return (
      <tr className="border-b border-zinc-100 last:border-0">
        <td className="py-3 pr-4 text-zinc-800 text-sm" style={{ fontFamily: 'var(--font-body)' }}>
          {item.name || <span className="text-zinc-400 italic">Untitled</span>}
        </td>
        {!hideRate && (
          <td className="py-3 pr-4 text-zinc-500 text-sm text-right tabular" style={{ fontFamily: 'var(--font-body)' }}>
            {isFlat ? 'Flat' : rate ? `$${rate}/hr` : '—'}
          </td>
        )}
        {!hideHours && (
          <td className="py-3 pr-4 text-zinc-500 text-sm text-right tabular" style={{ fontFamily: 'var(--font-body)' }}>
            {isFlat ? '—' : Number(item.hours) || 0}
          </td>
        )}
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
          className="focus-light bg-transparent text-sm font-medium text-zinc-800 w-full outline-none focus:text-zinc-900 placeholder-zinc-400 transition-colors"
          style={{ fontFamily: 'var(--font-body)' }}
        />
      </td>
      <td className="py-2.5 pr-3">
        <select
          value={item.resource}
          onChange={e => set('resource', e.target.value)}
          className="focus-light border border-zinc-200 text-zinc-600 text-xs font-semibold rounded-lg px-2 py-1.5 outline-none focus:border-zinc-900 hover:border-zinc-300 bg-white cursor-pointer transition-colors"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {Object.entries(resources).map(([key, r]) => (
            <option key={key} value={key}>{r.label}</option>
          ))}
        </select>
      </td>
      <td className="py-2.5 pr-3 text-right text-zinc-500 text-sm tabular" style={{ fontFamily: 'var(--font-body)' }}>
        {isFlat ? 'Flat' : rate ? `$${rate}/hr` : '—'}
      </td>
      <td className="py-2.5 pr-3 w-32">
        <div className="flex items-center gap-1.5">
          {isFlat ? (
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">$</span>
              <input
                type="number" min="0"
                value={item.flatAmount ?? 0}
                onChange={e => set('flatAmount', e.target.value)}
                className="focus-light border border-zinc-200 text-zinc-800 text-sm font-semibold text-right rounded-lg pl-5 pr-2 py-1.5 w-full outline-none focus:border-zinc-900 tabular bg-white"
                style={{ fontFamily: 'var(--font-body)' }}
              />
            </div>
          ) : (
            <input
              type="number" min="0" step="0.5"
              value={item.hours}
              onChange={e => set('hours', e.target.value)}
              className="focus-light border border-zinc-200 text-zinc-800 text-sm font-semibold text-right rounded-lg px-2.5 py-1.5 w-full outline-none focus:border-zinc-900 tabular bg-white"
              style={{ fontFamily: 'var(--font-body)' }}
            />
          )}
          <button
            onClick={toggleFlat}
            title={isFlat ? 'Switch to hourly' : 'Switch to flat rate'}
            className={`focus-light flex-shrink-0 px-1.5 py-1 rounded text-[10px] font-black uppercase tracking-wide border transition-all ${
              isFlat
                ? 'bg-zinc-800 text-white border-zinc-800'
                : 'text-zinc-400 border-zinc-200 hover:border-zinc-500 hover:text-zinc-600'
            }`}
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {isFlat ? 'Flat' : '/hr'}
          </button>
        </div>
      </td>
      <td className="py-2.5 pr-4 text-right text-zinc-400 text-sm tabular" style={{ fontFamily: 'var(--font-body)' }}>
        {isFlat ? '—' : fmt(internal)}
      </td>
      <td className="py-2.5 pr-4 text-right text-zinc-900 text-sm tabular font-bold" style={{ fontFamily: 'var(--font-body)' }}>
        {fmt(billed)}
      </td>
      <td className="py-2.5 pr-3">
        {!isFlat && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold tabular float-right ${GM_PILL[mc]}`}
            style={{ fontFamily: 'var(--font-body)' }}>
            {fmtPct(gm)}
          </span>
        )}
      </td>
      <td className="py-2.5 pr-3 w-8">
        <button
          onClick={onDelete}
          className="focus-light opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-all"
        >
          ×
        </button>
      </td>
    </tr>
  )
}
