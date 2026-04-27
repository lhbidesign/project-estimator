import LineItemRow from './LineItemRow.jsx'
import LineItemCard from './LineItemCard.jsx'
import { CATEGORIES } from '../data/rates.js'
import { calcSection, fmt } from '../utils/calc.js'
import { useRates } from '../contexts/RatesContext.jsx'
import { nanoid } from '../utils/nanoid.js'

function defaultResource(categoryId, projectDesigner) {
  return categoryId === 'renderings' ? 'mostafa_general' : (projectDesigner || 'brandon')
}

function newItem(categoryId, name, projectDesigner, projectRate) {
  return { id: nanoid(), name, resource: defaultResource(categoryId, projectDesigner), hours: 8, category: categoryId, rate: projectRate, isFlat: false, flatAmount: 0 }
}

export default function CategorySection({ section, view, onChange, onDeleteSection, isOnlySection, projectDesigner, projectRate, hideHours, hideRate }) {
  const { resources } = useRates()
  const totals = calcSection(section.items, resources)

  function updateItem(id, u)  { onChange({ ...section, items: section.items.map(i => i.id === id ? u : i) }) }
  function deleteItem(id)     { onChange({ ...section, items: section.items.filter(i => i.id !== id) }) }
  function addItem(catId, name = '') {
    onChange({ ...section, items: [...section.items, newItem(catId, name === 'Custom line item' ? '' : name, projectDesigner, projectRate)] })
  }
  function addBlock(name, resource, category, hours = 8) {
    onChange({ ...section, items: [...section.items, { id: nanoid(), name, resource, hours, category, rate: projectRate, isFlat: false, flatAmount: 0 }] })
  }

  /* ── CLIENT VIEW ── */
  if (view === 'client') {
    return (
      <div className="mb-8">
        {section.label && (
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4 pb-3 border-b border-zinc-200"
            style={{ fontFamily: 'var(--font-body)' }}>
            {section.label}
          </h3>
        )}
        <table className="w-full">
          <colgroup>
            <col />
            {!hideRate  && <col className="w-28" />}
            {!hideHours && <col className="w-16" />}
            <col className="w-32" />
          </colgroup>
          <thead>
            <tr className="border-b border-zinc-200">
              <th className="pb-2 pr-4 text-left text-xs font-black uppercase tracking-widest text-zinc-400"
                style={{ fontFamily: 'var(--font-body)' }}>Description</th>
              {!hideRate && (
                <th className="hidden sm:table-cell pb-2 pr-4 text-right text-xs font-black uppercase tracking-widest text-zinc-400"
                  style={{ fontFamily: 'var(--font-body)' }}>Rate</th>
              )}
              {!hideHours && (
                <th className="pb-2 pr-4 text-right text-xs font-black uppercase tracking-widest text-zinc-400"
                  style={{ fontFamily: 'var(--font-body)' }}>Hrs</th>
              )}
              <th className="pb-2 text-right text-xs font-black uppercase tracking-widest text-zinc-400"
                style={{ fontFamily: 'var(--font-body)' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {section.items.map(item => (
              <LineItemRow
                key={item.id} item={item} view="client"
                onChange={() => {}} onDelete={() => {}}
                hideHours={hideHours} hideRate={hideRate}
              />
            ))}
          </tbody>
        </table>
        {section.label && (
          <div className="flex justify-end pt-4 mt-4 border-t border-zinc-200">
            <div className="flex items-baseline gap-4">
              <span className="text-xs font-black uppercase tracking-widest text-zinc-400"
                style={{ fontFamily: 'var(--font-body)' }}>Section subtotal</span>
              <span className="text-base font-black text-zinc-900 tabular"
                style={{ fontFamily: 'var(--font-body)' }}>{fmt(totals.billed)}</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  /* ── INTERNAL VIEW ── */
  const addControls = (
    <div className="px-4 sm:px-5 py-3 border-t border-zinc-100 space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-3 sm:flex-wrap">
      <select
        defaultValue=""
        onChange={e => { if (!e.target.value) return; const [c, n] = e.target.value.split('||'); addItem(c, n); e.target.value = '' }}
        className="focus-light w-full sm:w-auto text-xs font-bold text-zinc-500 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-400 rounded-lg px-3 py-2 sm:py-1.5 bg-white cursor-pointer outline-none transition-colors"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        <option value="" disabled>+ Add deliverable…</option>
        {CATEGORIES.map(cat => (
          <optgroup key={cat.id} label={cat.label}>
            {cat.deliverables.map(d => <option key={d} value={`${cat.id}||${d}`}>{d}</option>)}
          </optgroup>
        ))}
      </select>
      <div className="flex gap-2 sm:gap-3 sm:contents">
        <span className="hidden sm:inline text-zinc-200 text-xs">or</span>
        <button onClick={() => addBlock('General Design Hours', projectDesigner || 'brandon', 'graphic_design', 40)}
          className="focus-light flex-1 sm:flex-none text-xs font-bold text-zinc-500 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-400 rounded-lg px-3 py-2 sm:py-1.5 transition-colors text-center"
          style={{ fontFamily: 'var(--font-body)' }}>+ Design</button>
        <button onClick={() => addBlock('General Rendering Hours', 'mostafa_general', 'renderings', 20)}
          className="focus-light flex-1 sm:flex-none text-xs font-bold text-zinc-500 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-400 rounded-lg px-3 py-2 sm:py-1.5 transition-colors text-center"
          style={{ fontFamily: 'var(--font-body)' }}>+ Rendering</button>
        <button onClick={() => addBlock('On-Call / Rush Hours', 'mostafa_oncall', 'renderings', 10)}
          className="focus-light flex-1 sm:flex-none text-xs font-bold text-zinc-500 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-400 rounded-lg px-3 py-2 sm:py-1.5 transition-colors text-center"
          style={{ fontFamily: 'var(--font-body)' }}>+ On-Call</button>
      </div>
    </div>
  )

  return (
    <div className="mb-3 bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
      {!isOnlySection && (
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-zinc-100 bg-zinc-50 group/lbl">
          <input
            value={section.label}
            onChange={e => onChange({ ...section, label: e.target.value })}
            placeholder="Section / Program name"
            className="focus-light bg-transparent text-xs font-black uppercase tracking-widest text-zinc-600 outline-none placeholder-zinc-400 focus:text-zinc-900 flex-1"
            style={{ fontFamily: 'var(--font-body)' }}
          />
          <button
            onClick={onDeleteSection}
            className="focus-light text-zinc-400 hover:text-red-500 text-xs font-semibold transition-all ml-4 sm:opacity-0 sm:group-hover/lbl:opacity-100"
          >
            Remove
          </button>
        </div>
      )}

      {/* Mobile: card list */}
      <div className="sm:hidden p-3 space-y-2">
        {section.items.length === 0 ? (
          <p className="text-sm text-zinc-400 italic py-4 text-center" style={{ fontFamily: 'var(--font-body)' }}>
            Add a deliverable below
          </p>
        ) : section.items.map(item => (
          <LineItemCard
            key={item.id} item={item}
            onChange={u => updateItem(item.id, u)}
            onDelete={() => deleteItem(item.id)}
          />
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden sm:block">
        <table className="w-full">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              {[['Deliverable', 'pl-5 pr-3 text-left'], ['Resource', 'pr-3 text-left'], ['Rate', 'pr-3 text-right'], ['Hrs', 'pr-3 text-right'], ['Cost', 'pr-4 text-right'], ['Billed', 'pr-4 text-right'], ['GM%', 'pr-3 text-right'], ['', 'pr-3 w-8']].map(([h, cls]) => (
                <th key={h} className={`py-2.5 text-xs font-black uppercase tracking-wider text-zinc-400 ${cls}`}
                  style={{ fontFamily: 'var(--font-body)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.items.length === 0 ? (
              <tr><td colSpan={8} className="pl-5 py-5 text-sm text-zinc-400 italic" style={{ fontFamily: 'var(--font-body)' }}>
                Add a deliverable below
              </td></tr>
            ) : section.items.map(item => (
              <LineItemRow
                key={item.id} item={item} view="internal"
                onChange={u => updateItem(item.id, u)}
                onDelete={() => deleteItem(item.id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {!isOnlySection && section.items.length > 0 && (
        <div className="flex justify-end px-4 sm:px-5 py-3 border-t border-zinc-100 bg-zinc-50">
          <div className="flex items-baseline gap-3">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-400"
              style={{ fontFamily: 'var(--font-body)' }}>Section subtotal</span>
            <span className="text-sm font-black text-zinc-900 tabular"
              style={{ fontFamily: 'var(--font-body)' }}>{fmt(totals.billed)}</span>
          </div>
        </div>
      )}

      {addControls}
    </div>
  )
}
