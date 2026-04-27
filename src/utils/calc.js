import { RESOURCES as DEFAULT_RESOURCES, PM_RATE as DEFAULT_PM_RATE } from '../data/rates.js'

export function calcLine(item, resources = DEFAULT_RESOURCES) {
  if (item.isFlat) {
    const billed = Number(item.flatAmount) || 0
    return { billed, internal: 0, gp: billed, gm: billed > 0 ? 100 : 0, rate: null, isFlat: true }
  }
  const res = resources[item.resource]
  const billedRate   = Number(item.rate) || res?.billedRate || 150
  const internalRate = res?.internalRate || 0
  const billed   = (Number(item.hours) || 0) * billedRate
  const internal = (Number(item.hours) || 0) * internalRate
  const gp       = billed - internal
  const gm       = billed > 0 ? (gp / billed) * 100 : 0
  return { billed, internal, gp, gm, rate: billedRate, isFlat: false }
}

export function calcSection(items, resources = DEFAULT_RESOURCES) {
  return items.reduce(
    (acc, item) => {
      const { billed, internal } = calcLine(item, resources)
      acc.billed   += billed
      acc.internal += internal
      acc.hours    += Number(item.hours) || 0
      return acc
    },
    { billed: 0, internal: 0, hours: 0 },
  )
}

export function calcProject(sections, pmPercent, resources = DEFAULT_RESOURCES, pmRate = DEFAULT_PM_RATE) {
  const allItems      = sections.flatMap(s => s.items)
  const totals        = calcSection(allItems, resources)
  const pmHours       = totals.hours * (pmPercent / 100)
  const pmInternal    = pmHours * pmRate
  const pmBilled      = totals.billed * (pmPercent / 100)
  const totalBilled   = totals.billed + pmBilled
  const totalInternal = totals.internal + pmInternal
  const gp            = totalBilled - totalInternal
  const gm            = totalBilled > 0 ? (gp / totalBilled) * 100 : 0
  return {
    subtotal: totals.billed, pmBilled, pmInternal, pmHours,
    totalBilled, totalInternal, designerInternal: totals.internal,
    gp, gm, totalHours: totals.hours,
  }
}

export function marginColor(gm) {
  if (gm >= 40) return 'green'
  if (gm >= 25) return 'yellow'
  return 'red'
}

export function fmt(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n)
}

export function fmtPct(n) { return `${n.toFixed(1)}%` }
