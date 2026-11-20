import { describe, it, expect } from 'vitest'
import { MemoryStore, type Store } from '../src/lib/store'
import { D1Store } from '../src/lib/d1store'
import { buatPesanan } from '../src/handlers/toko'
import { buatD1Uji } from './d1shim'
import { post, req } from './helpers'

const impl: [string, () => Store][] = [
  ['MemoryStore', () => new MemoryStore()],
  ['D1Store (SQLite)', () => new D1Store(buatD1Uji())],
]

describe.each(impl)('Bab 6: kontrak penyimpanan — %s', (_n, buat) => {
  it('simpan lalu baca pesanan', async () => {
    const s = buat()
    await s.buat({ id: 'p1', uid: 'ani', produkId: 'template-1', harga: 49000, status: 'menunggu' })
    expect((await s.ambil('p1'))?.harga).toBe(49000)
  })
  it('tandaiLunas mengubah status dan produkLunas membaca per pengguna', async () => {
    const s = buat()
    await s.buat({ id: 'p1', uid: 'ani', produkId: 'template-1', harga: 49000, status: 'menunggu' })
    await s.tandaiLunas('p1')
    expect(await s.produkLunas('ani')).toEqual(['template-1'])
    expect(await s.produkLunas('budi')).toEqual([])
  })
})

describe.each(impl)('Bab 6: jalur data checkout — %s', (_n, buat) => {
  it('email/produk kosong atau aneh ditolak (validasi di server)', async () => {
    const s = buat()
    expect((await buatPesanan(post('/api/pesanan', { produkId: '' }), s)).status).toBe(400)
    expect((await buatPesanan(post('/api/pesanan', { produkId: "x'; DROP TABLE pesanan;--" }), s)).status).toBe(400)
    expect((await buatPesanan(post('/api/pesanan', null), s)).status).toBe(400)
    const rusak = req('/api/pesanan', 'ani', { method: 'POST', body: '{bukan json' })
    expect((await buatPesanan(rusak, s)).status).toBe(400)
  })
  it('LAB LANGKAH 4: kirim ganda dengan kunci idempotensi sama hanya membuat satu pesanan', async () => {
    const s = buat()
    const kirim = () =>
      buatPesanan(
        req('/api/pesanan', 'ani', {
          method: 'POST',
          body: JSON.stringify({ produkId: 'template-1' }),
          headers: { 'idempotency-key': 'kunci-abc-12345' },
        }),
        s,
      )
    const a = await (await kirim()).json()
    const b = await (await kirim()).json()
    expect(b.id).toBe(a.id)
    expect(b.diulang).toBe(true)
  })
  it('kunci idempotensi dengan karakter berbahaya ditolak', async () => {
    const s = buat()
    const r = await buatPesanan(
      req('/api/pesanan', 'ani', { method: 'POST', body: JSON.stringify({ produkId: 'template-1' }), headers: { 'idempotency-key': "a'; --" } }),
      s,
    )
    expect(r.status).toBe(400)
  })
})
