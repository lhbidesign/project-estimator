import { createContext, useContext, useState } from 'react'
import { RESOURCES, HOUR_GUIDES, PM_RATE } from '../data/rates.js'

const RatesContext = createContext(null)
const STORAGE_VER  = 'v4'

function load(key, fallback) {
  try {
    if (localStorage.getItem('lh-data-version') !== STORAGE_VER) {
      ;['lh-resources', 'lh-hour-guides', 'lh-pm-rate'].forEach(k => localStorage.removeItem(k))
      localStorage.setItem('lh-data-version', STORAGE_VER)
      return fallback
    }
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch { return fallback }
}

function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

export function RatesProvider({ children }) {
  const [resources,  setRes]    = useState(() => load('lh-resources',   RESOURCES))
  const [hourGuides, setGuides]  = useState(() => load('lh-hour-guides', HOUR_GUIDES))
  const [pmRate,     setPm]      = useState(() => load('lh-pm-rate',     PM_RATE))

  function setResources(v)  { setRes(v);    save('lh-resources',   v) }
  function setHourGuides(v) { setGuides(v); save('lh-hour-guides', v) }
  function setPmRate(v)     { setPm(v);     save('lh-pm-rate',     v) }
  function resetToDefaults() { setResources(RESOURCES); setHourGuides(HOUR_GUIDES); setPmRate(PM_RATE) }

  return (
    <RatesContext.Provider value={{ resources, setResources, hourGuides, setHourGuides, pmRate, setPmRate, resetToDefaults }}>
      {children}
    </RatesContext.Provider>
  )
}

export const useRates = () => useContext(RatesContext)
