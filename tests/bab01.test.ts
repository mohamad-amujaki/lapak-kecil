import { describe, it, expect } from 'vitest'
import { MemoryStore } from '../src/lib/store'
import { buatPesanan, callback, library, webhook } from '../src/handlers/toko'
import { post, req, webhookReq, SECRET } from './helpers'

const env = { WEBHOOK_SECRET: SECRET }

describe('Bab 1: perbaikan celah akses gratis', () => {
  it('serangan ?status=paid ditolak', async () => {
    const store = new MemoryStore()
    await callback(req('/checkout/callback?status=paid&produk=template-1'), store)
    const data = await (await library(req('/library'), store)).json()
    expect(data.produk).toEqual([])
  })

  it('serangan webhook palsu (tanpa tanda tangan sah) ditolak', async () => {
    const store = new MemoryStore()
    const { id } = await (await buatPesanan(post('/api/pesanan', { produkId: 'template-1', harga: 49000 }), store)).json()
    const palsu = await webhookReq({ pesananId: id, status: 'settlement' }, 'kunci-salah')
    expect((await webhook(palsu, store, env)).status).toBe(401)
    expect((await store.ambil(id))?.status).toBe('menunggu')
  })

  it('jalur normal: pembeli sah tetap mendapat akses setelah webhook sah', async () => {
    const store = new MemoryStore()
    const { id } = await (await buatPesanan(post('/api/pesanan', { produkId: 'template-1', harga: 49000 }, 'ani'), store)).json()
    expect((await webhook(await webhookReq({ pesananId: id, status: 'settlement' }), store, env)).status).toBe(200)
    const cb = await callback(req(`/checkout/callback?pesanan=${id}`, 'ani'), store)
    expect(cb.status).toBe(302)
    const data = await (await library(req('/library', 'ani'), store)).json()
    expect(data.produk).toEqual(['template-1'])
  })

  it('pembeli lain tidak ikut mendapat akses', async () => {
    const store = new MemoryStore()
    const { id } = await (await buatPesanan(post('/api/pesanan', { produkId: 'template-1', harga: 49000 }, 'ani'), store)).json()
    await webhook(await webhookReq({ pesananId: id, status: 'settlement' }), store, env)
    const data = await (await library(req('/library', 'budi'), store)).json()
    expect(data.produk).toEqual([])
  })
})
