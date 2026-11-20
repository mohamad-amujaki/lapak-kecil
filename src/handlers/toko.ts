// Versi aman (Bab 1): bukti pembayaran datang dari webhook bertanda tangan,
// bukan dari alamat di browser.
import type { MemoryStore } from '../lib/store'
import { json, uidDariCookie } from '../lib/http'
import { sahkan } from '../lib/hmac'

export type Env = { WEBHOOK_SECRET: string }

// Harga masih dari klien; diperbaiki di Bab 4.
export async function buatPesanan(req: Request, store: MemoryStore) {
  const uid = uidDariCookie(req)
  if (!uid) return json({ error: 'belum masuk' }, 401)
  const { produkId, harga } = await req.json()
  const id = crypto.randomUUID()
  store.buat({ id, uid, produkId, harga, status: 'menunggu' })
  return json({ id, harga })
}

// Halaman tujuan hanya MENAMPILKAN status. Ia tidak memberi akses apa pun.
export async function callback(req: Request, store: MemoryStore) {
  const id = new URL(req.url).searchParams.get('pesanan') ?? ''
  const p = store.ambil(id)
  const uid = uidDariCookie(req)
  if (p && uid === p.uid && p.status === 'lunas') {
    return new Response(null, { status: 302, headers: { location: '/library' } })
  }
  return json({ status: 'menunggu pembayaran' }, 200)
}

// Satu-satunya jalan menandai pesanan lunas: webhook dengan tanda tangan sah.
export async function webhook(req: Request, store: MemoryStore, env: Env) {
  const isi = await req.text()
  const ok = await sahkan(env.WEBHOOK_SECRET, isi, req.headers.get('x-signature'))
  if (!ok) return json({ error: 'tanda tangan tidak sah' }, 401)
  const { pesananId, status } = JSON.parse(isi)
  if (status === 'settlement' && store.ambil(pesananId)) store.tandaiLunas(pesananId)
  return json({ ok: true })
}

export async function library(req: Request, store: MemoryStore) {
  const uid = uidDariCookie(req)
  if (!uid) return json({ error: 'belum masuk' }, 401)
  return json({ produk: store.produkLunas(uid) })
}
