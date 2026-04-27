import { useRates } from '../contexts/RatesContext.jsx'
import { calcProject, fmt, fmtPct, marginColor } from '../utils/calc.js'

const GM = {
  neutral: { bg: 'bg-zinc-50',   border: 'border-zinc-200',  num: 'text-zinc-400',   label: '—'            },
  green:   { bg: 'bg-green-50',  border: 'border-green-200', num: 'text-green-700',  label: 'Healthy'      },
  yellow:  { bg: 'bg-amber-50',  border: 'border-amber-200', num: 'text-amber-700',  label: 'Fair'         },
  red:     { bg: 'bg-red-50',    border: 'border-red-200',   num: 'text-red-700',    label: 'Below Target' },
}

const PM_OPTIONS = [0, 10, 15, 20]

export default function SummaryPanel({ sections, pmPercent, setPmPercent, view }) {
  const { resources, pmRate } = useRates()
  const p  = calcProject(sections, pmPercent, resources, pmRate)
  const mc = p.totalBilled === 0 ? 'neutral' : marginColor(p.gm)
  const g  = GM[mc]

  if (view === 'client') {
    return (
      <div className="mt-6 pt-6 border-t-2 border-zinc-200">
        <div className="max-w-xs ml-auto space-y-2">
          {pmPercent > 0 && (
            <>
              <SRow label="Subtotal" value={fmt(p.subtotal)} />
              <SRow label={`Project Management (${pmPercent}%)`} value={fmt(p.pmBilled)} />
            </>
          )}
          <div className={pmPercent > 0 ? 'pt-3 mt-3 border-t border-zinc-200' : ''}>
            <SRow label="Total" value={fmt(p.totalBilled)} strong />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6 pt-6 border-t border-zinc-200">
      <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4"
        style={{ fontFamily: 'var(--font-body)' }}>
        Project Summary
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* PM */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4"
            style={{ fontFamily: 'var(--font-body)' }}>PM Overhead</p>
          <div className="flex gap-1.5 bg-zinc-100 rounded-lg p-1 mb-5">
            {PM_OPTIONS.map(pct => (
              <button
                key={pct}
                onClick={() => setPmPercent(pct)}
                className={`flex-1 py-3 sm:py-2 rounded-md text-xs font-bold transition-all focus-light ${
                  pmPercent === pct ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
                }`}
                style={{ fontFamily: 'var(--font-body)' }}
                aria-pressed={pmPercent === pct}
              >
                {pct === 0 ? 'None' : `${pct}%`}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <PRow label="Est. PM hours" value={pmPercent > 0 ? `${p.pmHours.toFixed(1)} hrs` : '—'} />
            <PRow label="PM cost (Dee)"  value={pmPercent > 0 ? fmt(p.pmInternal) : '—'} dim />
            <PRow label="PM billed"      value={pmPercent > 0 ? fmt(p.pmBilled) : '—'} />
          </div>
        </div>

        {/* Financials */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4"
            style={{ fontFamily: 'var(--font-body)' }}>Financials</p>
          <div className="space-y-2">
            <PRow label="Designer cost"    value={fmt(p.designerInternal)} dim />
            <PRow label="PM cost"          value={fmt(p.pmInternal)} dim />
            <div className="border-t border-zinc-100 pt-2 mt-2">
              <PRow label="Total internal cost" value={fmt(p.totalInternal)} />
            </div>
            <PRow label="Subtotal (pre-PM)"      value={fmt(p.subtotal)} />
            {pmPercent > 0 && <PRow label="PM overhead" value={fmt(p.pmBilled)} />}
            <div className="border-t border-zinc-100 pt-2 mt-2">
              <PRow label="Total billed to client" value={fmt(p.totalBilled)} strong />
            </div>
          </div>
        </div>

        {/* Margin */}
        <div className={`border rounded-xl p-5 shadow-sm ${g.bg} ${g.border}`}>
          <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4"
            style={{ fontFamily: 'var(--font-body)' }}>Gross Margin</p>
          <div className="space-y-2 mb-6">
            <PRow label="Total billed" value={fmt(p.totalBilled)} />
            <PRow label="Total cost"   value={fmt(p.totalInternal)} dim />
            <div className="border-t border-black/10 pt-2 mt-2">
              <PRow label="Gross profit" value={fmt(p.gp)} strong />
            </div>
          </div>
          <div className="text-center">
            <div className={`text-5xl font-black tabular leading-none ${g.num}`}
              style={{ fontFamily: 'var(--font-display)' }}>
              {fmtPct(p.gm)}
            </div>
            <div className={`mt-2 text-xs font-bold uppercase tracking-widest ${g.num} opacity-70`}
              style={{ fontFamily: 'var(--font-body)' }}>
              {g.label}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

function PRow({ label, value, dim, strong }) {
  return (
    <div className="flex justify-between items-baseline gap-4">
      <span className={`text-sm ${dim ? 'text-zinc-400' : strong ? 'text-zinc-900 font-semibold' : 'text-zinc-600'}`}
        style={{ fontFamily: 'var(--font-body)' }}>{label}</span>
      <span className={`text-sm tabular ${dim ? 'text-zinc-400' : strong ? 'text-zinc-900 font-bold' : 'text-zinc-700'}`}
        style={{ fontFamily: 'var(--font-body)' }}>{value}</span>
    </div>
  )
}

function SRow({ label, value, strong }) {
  return (
    <div className="flex justify-between items-baseline gap-6">
      <span className={`text-sm ${strong ? 'font-bold text-zinc-900' : 'text-zinc-500'}`}
        style={{ fontFamily: 'var(--font-body)' }}>{label}</span>
      <span className={`tabular ${strong ? 'text-xl font-black text-zinc-900' : 'text-zinc-700'}`}
        style={{ fontFamily: 'var(--font-body)' }}>{value}</span>
    </div>
  )
}
