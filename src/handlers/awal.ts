// VERSI TIDAK AMAN (Bab 1, sebelum perbaikan). Jangan dipakai di produksi.
import type { MemoryStore } from '../lib/store'
import { json, uidDariCookie } from '../lib/http'

// Membuat pesanan. Harga diambil dari klien (diperbaiki di Bab 4).
export async function buatPesanan(req: Request, store: MemoryStore) {
  const uid = uidDariCookie(req)
  if (!uid) return json({ error: 'belum masuk' }, 401)
  const { produkId, harga } = await req.json()
  const id = crypto.randomUUID()
  store.buat({ id, uid, produkId, harga, status: 'menunggu' })
  return json({ id, harga })
}

// Halaman tujuan setelah pembayaran. Mempercayai ?status=paid dari alamat.
export async function callback(req: Request, store: MemoryStore) {
  const url = new URL(req.url)
  const status = url.searchParams.get('status')
  const uid = uidDariCookie(req)
  const produkId = url.searchParams.get('produk')
  if (status === 'paid' && uid && produkId) {
    store.beriAkses(uid, produkId)
  }
  return new Response(null, { status: 302, headers: { location: '/library' } })
}

export async function library(req: Request, store: MemoryStore) {
  const uid = uidDariCookie(req)
  if (!uid) return json({ error: 'belum masuk' }, 401)
  return json({ produk: store.daftarAkses(uid) })
}
