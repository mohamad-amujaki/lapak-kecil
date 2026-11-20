// Versi aman (Bab 1): bukti pembayaran datang dari webhook bertanda tangan,
// bukan dari alamat di browser.
import type { Store } from '../lib/store'
import { validasiPesanan, KUNCI_RE } from '../lib/validasi'
import { json, uidDariCookie } from '../lib/http'
import { sahkan } from '../lib/hmac'
import { cariProduk } from '../data/produk'

export type Env = { WEBHOOK_SECRET: string }

// Bab 4: harga dari katalog server. Bab 6: validasi dan kunci idempotensi.
export async function buatPesanan(req: Request, store: Store) {
  const uid = uidDariCookie(req)
  if (!uid) return json({ error: 'belum masuk' }, 401)
  let body: unknown
  try { body = await req.json() } catch { return json({ error: 'JSON tidak valid' }, 400) }
  const v = validasiPesanan(body)
  if (!v.ok) return json({ error: v.error }, 400)
  const produk = cariProduk(v.produkId)
  if (!produk) return json({ error: 'produk tidak ditemukan' }, 404)

  const kunci = req.headers.get('idempotency-key')
  if (kunci !== null) {
    if (!KUNCI_RE.test(kunci)) return json({ error: 'idempotency-key tidak valid' }, 400)
    const lama = await store.cariKunci(uid, kunci)
    if (lama) return json({ id: lama.id, harga: lama.harga, diulang: true })
  }
  const id = crypto.randomUUID()
  await store.buat({ id, uid, produkId: produk.id, harga: produk.harga, status: 'menunggu', kunci })
  return json({ id, harga: produk.harga })
}

// Halaman tujuan hanya MENAMPILKAN status. Ia tidak memberi akses apa pun.
export async function callback(req: Request, store: Store) {
  const id = new URL(req.url).searchParams.get('pesanan') ?? ''
  const p = await store.ambil(id)
  const uid = uidDariCookie(req)
  if (p && uid === p.uid && p.status === 'lunas') {
    return new Response(null, { status: 302, headers: { location: '/library' } })
  }
  return json({ status: 'menunggu pembayaran' }, 200)
}

// Satu-satunya jalan menandai pesanan lunas: webhook dengan tanda tangan sah.
export async function webhook(req: Request, store: Store, env: Env) {
  const isi = await req.text()
  const ok = await sahkan(env.WEBHOOK_SECRET, isi, req.headers.get('x-signature'))
  if (!ok) return json({ error: 'tanda tangan tidak sah' }, 401)
  const { pesananId, status } = JSON.parse(isi)
  if (status === 'settlement' && (await store.ambil(pesananId))) await store.tandaiLunas(pesananId)
  return json({ ok: true })
}

export async function library(req: Request, store: Store) {
  const uid = uidDariCookie(req)
  if (!uid) return json({ error: 'belum masuk' }, 401)
  return json({ produk: await store.produkLunas(uid) })
}
