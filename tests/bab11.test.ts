import { describe, it, expect } from 'vitest'
import { MemoryStore, type Store } from '../src/lib/store'
import { D1Store } from '../src/lib/d1store'
import { buatPesanan, callback, library, lihatPesanan, webhook } from '../src/handlers/toko'
import { buatD1Uji } from './d1shim'
import { post, req, webhookReq, lunasBody, SECRET } from './helpers'

const env = { WEBHOOK_SECRET: SECRET }
const impl: [string, () => Store][] = [
  ['MemoryStore', () => new MemoryStore()],
  ['D1Store', () => new D1Store(buatD1Uji())],
]

async function pesan(s: Store, uid: string) {
  return (await (await buatPesanan(post('/api/pesanan', { produkId: 'template-1' }, uid), s)).json()) as { id: string; harga: number }
}

describe.each(impl)('Bab 11: tabel ancaman — %s', (_n, buat) => {
  it('bukti palsu: ?status=paid ditolak', async () => {
    const s = buat()
    await callback(req('/checkout/callback?status=paid&produk=template-1'), s)
    expect(await (await library(req('/library'), s)).json()).toEqual({ produk: [] })
  })
  it('bukti palsu: webhook tanpa tanda tangan ditolak', async () => {
    const s = buat()
    const { id, harga } = await pesan(s, 'ani')
    const r = await webhook(new Request('http://x/api/webhook', { method: 'POST', body: JSON.stringify(lunasBody(id, harga)) }), s, env)
    expect(r.status).toBe(401)
    expect((await s.ambil(id))?.status).toBe('menunggu')
  })
  it('pengulangan: event yang sama dua kali hanya diproses sekali', async () => {
    const s = buat()
    const { id, harga } = await pesan(s, 'ani')
    const body = lunasBody(id, harga, 'evt-sama')
    const a = await (await webhook(await webhookReq(body), s, env)).json()
    const b = await (await webhook(await webhookReq(body), s, env)).json()
    expect(a.diulang).toBeUndefined()
    expect(b.diulang).toBe(true)
    expect(await s.produkLunas('ani')).toEqual(['template-1'])
  })
  it('salah jumlah: bayar Rp1 untuk Rp49.000 ditolak', async () => {
    const s = buat()
    const { id } = await pesan(s, 'ani')
    const r = await webhook(await webhookReq(lunasBody(id, 1)), s, env)
    expect(r.status).toBe(422)
    expect((await s.ambil(id))?.status).toBe('menunggu')
  })
  it('akses silang: pembeli B tidak bisa melihat pesanan pembeli A', async () => {
    const s = buat()
    const { id } = await pesan(s, 'ani')
    expect((await lihatPesanan(req(`/api/pesanan-saya?id=${id}`, 'budi'), s)).status).toBe(404)
    expect((await lihatPesanan(req(`/api/pesanan-saya?id=${id}`, 'ani'), s)).status).toBe(200)
  })
  it('isi webhook rusak atau tidak lengkap ditolak', async () => {
    const s = buat()
    expect((await webhook(await webhookReq({ pesananId: 'x' }), s, env)).status).toBe(400)
  })
  it('jalur normal tetap lolos: pembeli sah mendapat akses', async () => {
    const s = buat()
    const { id, harga } = await pesan(s, 'ani')
    expect((await webhook(await webhookReq(lunasBody(id, harga)), s, env)).status).toBe(200)
    expect(await (await library(req('/library', 'ani'), s)).json()).toEqual({ produk: ['template-1'] })
  })
  it('percobaan tanda tangan salah berulang kena batas laju (429)', async () => {
    const s = buat()
    let terakhir = 0
    for (let i = 0; i < 12; i++) {
      const r = await webhook(await webhookReq(lunasBody('x', 1), 'salah'), s, env, 1_000_000 + i)
      terakhir = r.status
    }
    expect(terakhir).toBe(429)
  })
})
