const BASE = 'https://api.jsonbin.io/v3'

export async function binRead(apiKey, binId) {
  const res = await fetch(`${BASE}/b/${binId}/latest`, {
    headers: { 'X-Master-Key': apiKey, 'X-Bin-Meta': 'false' },
  })
  if (!res.ok) throw new Error(`Read failed (${res.status})`)
  return await res.json() // returns the stored record directly
}

export async function binWrite(apiKey, binId, record) {
  const res = await fetch(`${BASE}/b/${binId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Master-Key': apiKey },
    body: JSON.stringify(record),
  })
  if (!res.ok) throw new Error(`Write failed (${res.status})`)
  return await res.json()
}

export async function binCreate(apiKey) {
  const res = await fetch(`${BASE}/b`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': apiKey,
      'X-Bin-Name': 'LH Studio Estimates',
      'X-Bin-Private': 'true',
    },
    body: JSON.stringify({ estimates: [] }),
  })
  if (!res.ok) throw new Error(`Create failed (${res.status})`)
  const data = await res.json()
  return data.metadata.id
}

export const SYNC_KEY     = 'lh-jsonbin-key'
export const SYNC_BIN_ID  = 'lh-jsonbin-bin'

export function getSyncConfig() {
  return {
    apiKey: localStorage.getItem(SYNC_KEY) ?? '',
    binId:  localStorage.getItem(SYNC_BIN_ID) ?? '',
  }
}

export function setSyncConfig({ apiKey, binId }) {
  if (apiKey) localStorage.setItem(SYNC_KEY,    apiKey)
  else        localStorage.removeItem(SYNC_KEY)
  if (binId)  localStorage.setItem(SYNC_BIN_ID, binId)
  else        localStorage.removeItem(SYNC_BIN_ID)
}
