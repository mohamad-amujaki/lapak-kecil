import type { Store } from '../lib/store'
import { json, uidDariCookie } from '../lib/http'
import { sahkan, tandatangani } from '../lib/hmac'
import { cariProduk } from '../data/produk'

export interface R2Like {
  get(key: string): Promise<{ body: ReadableStream | string | null } | null>
}
export type UnduhEnv = { DOWNLOAD_SECRET: string; FILES: R2Like }

const BERLAKU_DETIK = 300

// 1) Pemilik pesanan LUNAS meminta tautan bertanda tangan yang berlaku 5 menit.
export async function mintaTautan(req: Request, store: Store, env: UnduhEnv, sekarang = Date.now()) {
  const uid = uidDariCookie(req)
  if (!uid) return json({ error: 'belum masuk' }, 401)
  const id = new URL(req.url).searchParams.get('pesanan') ?? ''
  const p = await store.ambil(id)
  if (!p || p.uid !== uid || p.status !== 'lunas') return json({ error: 'tidak ada akses' }, 403)
  const exp = Math.floor(sekarang / 1000) + BERLAKU_DETIK
  const sig = await tandatangani(env.DOWNLOAD_SECRET, `${p.id}.${exp}`)
  return json({ url: `/api/unduh?p=${encodeURIComponent(p.id)}&exp=${exp}&sig=${sig}` })
}

// 2) Unduh: tanda tangan sah, belum kedaluwarsa, pesanan masih lunas.
export async function unduh(req: Request, store: Store, env: UnduhEnv, sekarang = Date.now()) {
  const q = new URL(req.url).searchParams
  const id = q.get('p') ?? ''
  const exp = Number(q.get('exp'))
  if (!Number.isFinite(exp) || exp * 1000 < sekarang) return json({ error: 'tautan kedaluwarsa' }, 410)
  if (!(await sahkan(env.DOWNLOAD_SECRET, `${id}.${exp}`, q.get('sig')))) return json({ error: 'tautan tidak sah' }, 403)
  const p = await store.ambil(id)
  if (!p || p.status !== 'lunas') return json({ error: 'tidak ada akses' }, 403)
  const produk = cariProduk(p.produkId)
  const obj = produk ? await env.FILES.get(produk.fileKey) : null
  if (!obj || obj.body === null) return json({ error: 'file tidak ditemukan' }, 404)
  return new Response(obj.body as BodyInit, {
    headers: { 'content-type': 'application/zip', 'content-disposition': `attachment; filename="${produk!.fileKey}"` },
  })
}
