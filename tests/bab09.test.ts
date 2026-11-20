import { describe, it, expect } from 'vitest'
import { MemoryStore } from '../src/lib/store'
import { buatPesanan } from '../src/handlers/toko'
import { hitungDiskon } from '../src/lib/diskon'
import { post } from './helpers'

const SEKARANG = new Date('2026-11-20T00:00:00Z').getTime()

describe('Bab 9: kode diskon (ditulis sebelum implementasi)', () => {
  it('kode valid mengurangi total', () => {
    expect(hitungDiskon('HEMAT10', 49000, SEKARANG)).toBe(4900)
    expect(hitungDiskon('POTONG5K', 49000, SEKARANG)).toBe(5000)
  })
  it('kode palsu ditolak', () => {
    expect(() => hitungDiskon('PALSU', 49000, SEKARANG)).toThrow('kode diskon tidak dikenal')
  })
  it('kode kedaluwarsa ditolak', () => {
    expect(() => hitungDiskon('LEBARAN', 49000, SEKARANG)).toThrow('kedaluwarsa')
  })
  it('diskon tidak pernah melebihi harga', () => {
    expect(hitungDiskon('POTONG5K', 3000, SEKARANG)).toBe(3000)
  })
  it('pesanan dengan kode valid ditagih harga setelah diskon', async () => {
    const s = new MemoryStore()
    const d = await (await buatPesanan(post('/api/pesanan', { produkId: 'template-1', kode: 'HEMAT10' }), s)).json()
    expect(d.harga).toBe(44100)
  })
  it('pesanan dengan kode palsu ditolak dan tidak tersimpan', async () => {
    const s = new MemoryStore()
    const r = await buatPesanan(post('/api/pesanan', { produkId: 'template-1', kode: 'PALSU' }), s)
    expect(r.status).toBe(400)
    expect(s.pesanan.size).toBe(0)
  })
  it('klien tidak bisa menyisipkan harga/diskon sendiri', async () => {
    const s = new MemoryStore()
    const d = await (await buatPesanan(post('/api/pesanan', { produkId: 'template-1', diskon: 49000, harga: 0 }), s)).json()
    expect(d.harga).toBe(49000)
  })
})
