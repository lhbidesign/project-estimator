import { useRates } from '../contexts/RatesContext.jsx'
import { calcLine, fmt, fmtPct, marginColor } from '../utils/calc.js'

const GM_PILL = {
  green:  'bg-green-50 text-green-700 border border-green-200',
  yellow: 'bg-amber-50 text-amber-700 border border-amber-200',
  red:    'bg-red-50   text-red-700   border border-red-200',
}

export default function LineItemRow({ item, view, onChange, onDelete, hideHours, hideRate, onDragStart, onDrop }) {
  const { resources } = useRates()
  const { billed, internal, gm, rate, isFlat } = calcLine(item, resources)
  const mc = marginColor(gm)

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
          <td className="hidden sm:table-cell py-3 pr-4 text-zinc-500 text-sm text-right tabular" style={{ fontFamily: 'var(--font-body)' }}>
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
    <tr
      className="border-b border-zinc-100 last:border-0 group hover:bg-zinc-50/70 transition-colors"
      draggable
      onDragStart={onDragStart}
      onDragOver={e => e.preventDefault()}
      onDrop={onDrop}
    >
      {/* Drag handle */}
      <td className="pl-2 pr-1 w-5 cursor-grab active:cursor-grabbing text-zinc-300 group-hover:text-zinc-400 select-none" style={{ fontSize: 14 }}>
        ⠿
      </td>
      <td className="py-2.5 pr-3 pl-1">
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
      {/* Rate — editable, flat toggle lives here */}
      <td className="py-2.5 pr-3">
        <div className="flex items-center gap-1 justify-end">
          {isFlat ? (
            <button
              onClick={toggleFlat}
              title="Switch to hourly"
              className="focus-light px-2 py-1 rounded text-[10px] font-black uppercase tracking-wide bg-zinc-800 text-white border border-zinc-800 transition-all"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              FR
            </button>
          ) : (
            <>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400 text-[10px] pointer-events-none">$</span>
                <input
                  type="number" min="0" step="5"
                  value={item.rate ?? ''}
                  onChange={e => set('rate', e.target.value)}
                  className="focus-light border border-zinc-200 text-zinc-800 text-sm font-semibold text-right rounded-lg pl-4 pr-2 py-1.5 w-20 outline-none focus:border-zinc-900 tabular bg-white"
                  style={{ fontFamily: 'var(--font-body)' }}
                />
              </div>
              <button
                onClick={toggleFlat}
                title="Switch to flat rate"
                className="focus-light text-zinc-300 hover:text-zinc-600 text-xs font-bold px-1 transition-colors"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                FR
              </button>
            </>
          )}
        </div>
      </td>
      {/* Hrs — number input for hourly, dash for flat */}
      <td className="py-2.5 pr-3 w-24">
        {isFlat ? (
          <span className="text-zinc-300 text-sm flex justify-end pr-1">—</span>
        ) : (
          <input
            type="number" min="0" step="0.5"
            value={item.hours}
            onChange={e => set('hours', e.target.value)}
            className="focus-light border border-zinc-200 text-zinc-800 text-sm font-semibold text-right rounded-lg px-2.5 py-1.5 w-full outline-none focus:border-zinc-900 tabular bg-white"
            style={{ fontFamily: 'var(--font-body)' }}
          />
        )}
      </td>
      {/* Cost — editable for flat, calculated for hourly */}
      <td className="py-2.5 pr-4 text-right tabular" style={{ fontFamily: 'var(--font-body)' }}>
        {isFlat ? (
          <div className="relative inline-flex justify-end">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400 text-[10px] pointer-events-none">$</span>
            <input
              type="number" min="0"
              value={item.flatCost ?? 0}
              onChange={e => set('flatCost', e.target.value)}
              className="focus-light border border-zinc-200 text-zinc-400 text-sm font-medium text-right rounded-lg pl-4 pr-2 py-1 w-24 outline-none focus:border-zinc-900 tabular bg-white"
              style={{ fontFamily: 'var(--font-body)' }}
            />
          </div>
        ) : (
          <span className="text-zinc-400 text-sm">{fmt(internal)}</span>
        )}
      </td>
      {/* Billed — editable for flat, calculated for hourly */}
      <td className="py-2.5 pr-4 text-right tabular" style={{ fontFamily: 'var(--font-body)' }}>
        {isFlat ? (
          <div className="relative inline-flex justify-end">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400 text-[10px] pointer-events-none">$</span>
            <input
              type="number" min="0"
              value={item.flatAmount ?? 0}
              onChange={e => set('flatAmount', e.target.value)}
              className="focus-light border border-zinc-200 text-zinc-900 text-sm font-bold text-right rounded-lg pl-4 pr-2 py-1 w-24 outline-none focus:border-zinc-900 tabular bg-white"
              style={{ fontFamily: 'var(--font-body)' }}
            />
          </div>
        ) : (
          <span className="text-zinc-900 text-sm font-bold">{fmt(billed)}</span>
        )}
      </td>
      {/* GM% — always shown */}
      <td className="py-2.5 pr-3">
        {gm > 0 && (
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
