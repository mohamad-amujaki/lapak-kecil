import type { D1Like } from './d1store'

// Pemeriksaan ringan untuk pemantauan: database terjangkau dan rahasia terpasang.
export async function cekKesehatan(env: { DB: D1Like; WEBHOOK_SECRET?: string; DOWNLOAD_SECRET?: string }) {
  const cek: Record<string, boolean> = {}
  try { cek.database = (await env.DB.prepare('SELECT 1 AS x').bind().first<{ x: number }>())?.x === 1 } catch { cek.database = false }
  cek.rahasia_webhook = !!env.WEBHOOK_SECRET
  cek.rahasia_unduh = !!env.DOWNLOAD_SECRET
  return { ok: Object.values(cek).every(Boolean), cek }
}
