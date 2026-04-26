import { createContext, useContext, useState } from 'react'
import { RESOURCES, HOUR_GUIDES, PM_RATE, CATEGORY_RATES } from '../data/rates.js'

const RatesContext = createContext(null)
const STORAGE_VER  = 'v5'

function load(key, fallback) {
  try {
    if (localStorage.getItem('lh-data-version') !== STORAGE_VER) {
      ;['lh-resources', 'lh-hour-guides', 'lh-pm-rate', 'lh-category-rates'].forEach(k => localStorage.removeItem(k))
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
  const [resources,      setRes]    = useState(() => load('lh-resources',       RESOURCES))
  const [hourGuides,     setGuides] = useState(() => load('lh-hour-guides',     HOUR_GUIDES))
  const [pmRate,         setPm]     = useState(() => load('lh-pm-rate',         PM_RATE))
  const [categoryRates,  setCatR]   = useState(() => load('lh-category-rates',  CATEGORY_RATES))

  function setResources(v)     { setRes(v);    save('lh-resources',       v) }
  function setHourGuides(v)    { setGuides(v); save('lh-hour-guides',     v) }
  function setPmRate(v)        { setPm(v);     save('lh-pm-rate',         v) }
  function setCategoryRates(v) { setCatR(v);   save('lh-category-rates',  v) }

  function resetToDefaults() {
    setResources(RESOURCES)
    setHourGuides(HOUR_GUIDES)
    setPmRate(PM_RATE)
    setCategoryRates(CATEGORY_RATES)
  }

  return (
    <RatesContext.Provider value={{
      resources, setResources,
      hourGuides, setHourGuides,
      pmRate, setPmRate,
      categoryRates, setCategoryRates,
      resetToDefaults,
    }}>
      {children}
    </RatesContext.Provider>
  )
}

export const useRates = () => useContext(RatesContext)
