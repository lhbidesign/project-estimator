import { PRESETS } from '../data/presets.js'

export default function PresetLoader({ onLoad, variant = 'dark' }) {
  const isDark = variant === 'dark'
  return (
    <select
      defaultValue=""
      onChange={e => {
        const preset = PRESETS.find(p => p.id === e.target.value)
        if (preset) onLoad(preset)
        e.target.value = ''
      }}
      className={`text-xs font-bold tracking-wider uppercase rounded-lg px-3 py-2 cursor-pointer transition-all focus:outline-none ${
        isDark
          ? 'bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 focus:border-[#CCFF00]'
          : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 focus:border-zinc-900'
      }`}
      style={{ fontFamily: 'var(--font-body)' }}
      aria-label="Load a preset project"
    >
      <option value="" disabled style={{ background: isDark ? '#0c0c0c' : '#fff' }}>
        Load preset…
      </option>
      {PRESETS.map(p => (
        <option key={p.id} value={p.id} style={{ background: isDark ? '#0c0c0c' : '#fff' }}>
          {p.label}
        </option>
      ))}
    </select>
  )
}
