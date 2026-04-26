import { PRESETS } from '../data/presets.js'

export default function PresetLoader({ onLoad }) {
  return (
    <select
      defaultValue=""
      onChange={e => {
        const preset = PRESETS.find(p => p.id === e.target.value)
        if (preset) onLoad(preset)
        e.target.value = ''
      }}
      className="bg-white/10 border border-white/20 text-white/80 text-xs font-bold tracking-wider uppercase rounded-lg px-3 py-2 focus:outline-none focus:border-[#CCFF00] cursor-pointer hover:bg-white/20 transition-all"
      style={{ fontFamily: 'var(--font-body)' }}
      aria-label="Load a preset project"
    >
      <option value="" disabled style={{ background: '#0c0c0c' }}>Load preset…</option>
      {PRESETS.map(p => (
        <option key={p.id} value={p.id} style={{ background: '#0c0c0c' }}>{p.label}</option>
      ))}
    </select>
  )
}
