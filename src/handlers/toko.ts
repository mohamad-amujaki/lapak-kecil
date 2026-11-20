// Versi aman (Bab 1): bukti pembayaran datang dari webhook bertanda tangan,
// bukan dari alamat di browser.
import type { Store } from '../lib/store'
import { validasiPesanan, KUNCI_RE } from '../lib/validasi'
import { json, uidDariCookie } from '../lib/http'
import { sahkan } from '../lib/hmac'
import { catat } from '../lib/log'
import { BatasLaju } from '../lib/laju'
import { cariProduk } from '../data/produk'
import { hargaAkhir } from '../lib/diskon'

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
  let harga: number
  try {
    harga = hargaAkhir(produk.harga, typeof v.kode === 'string' ? v.kode : undefined)
  } catch (e) {
    return json({ error: (e as Error).message }, 400)
  }
  const id = crypto.randomUUID()
  await store.buat({ id, uid, produkId: produk.id, harga, status: 'menunggu', kunci })
  return json({ id, harga })
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

const gagalWebhook = new BatasLaju(10, 60_000)

// Satu-satunya jalan menandai pesanan lunas (Bab 11, versi keras):
// tanda tangan sah, isi valid, pesanan ada, jumlah cocok, dan tiap event hanya diproses sekali.
export async function webhook(req: Request, store: Store, env: Env, sekarang = Date.now()) {
  const ip = req.headers.get('cf-connecting-ip') ?? 'lokal'
  const isi = await req.text()
  if (!(await sahkan(env.WEBHOOK_SECRET, isi, req.headers.get('x-signature')))) {
    catat('webhook_ditolak', { alasan: 'tanda_tangan' })
    if (!gagalWebhook.izinkan(ip, sekarang)) return json({ error: 'terlalu banyak percobaan' }, 429)
    return json({ error: 'tanda tangan tidak sah' }, 401)
  }
  let data: any
  try { data = JSON.parse(isi) } catch { return json({ error: 'JSON tidak valid' }, 400) }
  const { eventId, pesananId, status, jumlah } = data ?? {}
  if (typeof eventId !== 'string' || typeof pesananId !== 'string' || typeof jumlah !== 'number') {
    return json({ error: 'isi tidak lengkap' }, 400)
  }
  const p = await store.ambil(pesananId)
  if (!p) { catat('webhook_ditolak', { alasan: 'pesanan_tak_ada', pesananId }); return json({ error: 'pesanan tidak ditemukan' }, 404) }
  if (jumlah !== p.harga) { catat('webhook_ditolak', { alasan: 'jumlah_tak_cocok', pesananId }); return json({ error: 'jumlah tidak cocok' }, 422) }
  if (status !== 'settlement') return json({ ok: true, diabaikan: true })
  if (!(await store.catatNotifikasi(eventId))) { catat('webhook_diulang', { eventId }); return json({ ok: true, diulang: true }) }
  await store.tandaiLunas(pesananId)
  catat('pesanan_lunas', { pesananId })
  return json({ ok: true })
}

// Otorisasi (bukan hanya autentikasi): pesanan hanya boleh dilihat pemiliknya.
export async function lihatPesanan(req: Request, store: Store) {
  const uid = uidDariCookie(req)
  if (!uid) return json({ error: 'belum masuk' }, 401)
  const p = await store.ambil(new URL(req.url).searchParams.get('id') ?? '')
  if (!p || p.uid !== uid) return json({ error: 'tidak ditemukan' }, 404) // 404, bukan 403: jangan bocorkan keberadaan
  return json({ id: p.id, produkId: p.produkId, harga: p.harga, status: p.status })
}

export async function library(req: Request, store: Store) {
  const uid = uidDariCookie(req)
  if (!uid) return json({ error: 'belum masuk' }, 401)
  return json({ produk: await store.produkLunas(uid) })
}
