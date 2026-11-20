const enc = new TextEncoder()

async function kunci(secret: string) {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
}
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('')

export async function tandatangani(secret: string, isi: string) {
  return hex(await crypto.subtle.sign('HMAC', await kunci(secret), enc.encode(isi)))
}

export async function sahkan(secret: string, isi: string, tandatangan: string | null) {
  if (!tandatangan) return false
  const harapan = await tandatangani(secret, isi)
  if (harapan.length !== tandatangan.length) return false
  let selisih = 0
  for (let i = 0; i < harapan.length; i++) selisih |= harapan.charCodeAt(i) ^ tandatangan.charCodeAt(i)
  return selisih === 0
}
