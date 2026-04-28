import { useRates } from '../contexts/RatesContext.jsx'
import { calcLine, fmt, fmtPct, marginColor } from '../utils/calc.js'

const GM_PILL = {
  green:  'bg-green-50 text-green-700 border border-green-200',
  yellow: 'bg-amber-50 text-amber-700 border border-amber-200',
  red:    'bg-red-50   text-red-700   border border-red-200',
}

export default function LineItemCard({ item, onChange, onDelete, onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd, isDragging, isDragOver }) {
  const { resources } = useRates()
  const { billed, internal, gm, rate, isFlat } = calcLine(item, resources)
  const mc = marginColor(gm)

  function set(field, value) { onChange({ ...item, [field]: value }) }
  function toggleFlat() {
    onChange({ ...item, isFlat: !item.isFlat, flatAmount: item.flatAmount ?? billed ?? 0, flatCost: item.flatCost ?? 0 })
  }

  return (
    <div
      className="bg-white rounded-xl p-4 shadow-sm"
      draggable
      onDragStart={onDragStart}
      onDragOver={e => { e.preventDefault(); onDragOver?.() }}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      style={{
        fontFamily: 'var(--font-body)',
        border: isDragOver ? '2px solid #CCFF00' : '1px solid #e4e4e7',
        background: isDragOver ? 'rgba(204,255,0,0.05)' : 'white',
        opacity: isDragging ? 0.35 : 1,
        transform: isDragOver ? 'scale(1.01)' : 'scale(1)',
        transition: 'opacity 0.15s ease, transform 0.12s ease, border-color 0.1s ease, background 0.1s ease',
      }}
    >

      {/* Row 1: Drag handle + Name + delete */}
      <div className="flex items-start gap-2 mb-3">
        <span className="cursor-grab active:cursor-grabbing text-zinc-300 select-none mt-1 flex-shrink-0" style={{ fontSize: 16 }}>⠿</span>
        <input
          value={item.name}
          onChange={e => set('name', e.target.value)}
          placeholder="Deliverable name"
          className="flex-1 bg-transparent text-base font-semibold text-zinc-800 outline-none placeholder-zinc-400 min-w-0"
        />
        <button
          onClick={onDelete}
          className="w-7 h-7 rounded flex items-center justify-center text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0 text-lg leading-none"
        >
          ×
        </button>
      </div>

      {/* Row 2: Resource + Rate/FR */}
      <div className="flex items-center gap-2 mb-3">
        <select
          value={item.resource}
          onChange={e => set('resource', e.target.value)}
          className="flex-1 border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-600 font-medium bg-white outline-none appearance-none min-w-0"
        >
          {Object.entries(resources).map(([key, r]) => (
            <option key={key} value={key}>{r.label}</option>
          ))}
        </select>

        {isFlat ? (
          <button
            onClick={toggleFlat}
            className="flex-shrink-0 px-3 py-2 rounded-lg bg-zinc-800 text-white text-xs font-black uppercase tracking-wide"
          >
            FR
          </button>
        ) : (
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400 text-xs pointer-events-none">$</span>
              <input
                type="number" min="0" step="5"
                value={item.rate ?? ''}
                onChange={e => set('rate', e.target.value)}
                className="border border-zinc-200 rounded-lg pl-5 pr-2 py-2 text-sm font-semibold text-right text-zinc-800 w-20 outline-none bg-white"
              />
            </div>
            <button onClick={toggleFlat} className="text-zinc-300 hover:text-zinc-600 text-xs font-bold px-1 transition-colors">
              FR
            </button>
          </div>
        )}
      </div>

      {/* Row 3: Hrs / Cost / Billed */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1">Hrs</p>
          {isFlat ? (
            <p className="text-zinc-300 text-sm py-2 text-center">—</p>
          ) : (
            <input
              type="number" min="0" step="0.5"
              value={item.hours}
              onChange={e => set('hours', e.target.value)}
              className="border border-zinc-200 rounded-lg px-2 py-2 text-sm font-semibold text-right text-zinc-800 w-full outline-none bg-white"
            />
          )}
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1">Cost</p>
          {isFlat ? (
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400 text-xs pointer-events-none">$</span>
              <input
                type="number" min="0"
                value={item.flatCost ?? 0}
                onChange={e => set('flatCost', e.target.value)}
                className="border border-zinc-200 rounded-lg pl-5 pr-2 py-2 text-sm font-medium text-right text-zinc-400 w-full outline-none bg-white"
              />
            </div>
          ) : (
            <p className="text-zinc-400 text-sm text-right py-2 pr-1">{fmt(internal)}</p>
          )}
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1">Billed</p>
          {isFlat ? (
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400 text-xs pointer-events-none">$</span>
              <input
                type="number" min="0"
                value={item.flatAmount ?? 0}
                onChange={e => set('flatAmount', e.target.value)}
                className="border border-zinc-200 rounded-lg pl-5 pr-2 py-2 text-sm font-bold text-right text-zinc-900 w-full outline-none bg-white"
              />
            </div>
          ) : (
            <p className="text-zinc-900 text-sm font-bold text-right py-2 pr-1">{fmt(billed)}</p>
          )}
        </div>
      </div>

      {/* GM% */}
      {gm > 0 && (
        <div className="flex justify-end">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold tabular ${GM_PILL[mc]}`}>
            {fmtPct(gm)}
          </span>
        </div>
      )}
    </div>
  )
}
