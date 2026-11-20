import { describe, it, expect } from 'vitest'
import { MemoryStore } from '../src/lib/store'
import { buatPesanan } from '../src/handlers/toko'
import { post } from './helpers'

describe('Bab 4: server yang menentukan harga', () => {
  it('LAB LANGKAH 3: harga dari klien diabaikan, server memakai katalog', async () => {
    const store = new MemoryStore()
    const res = await buatPesanan(post('/api/pesanan', { produkId: 'template-1', harga: 1 }), store)
    const data = await res.json()
    expect(data.harga).toBe(49000)
    expect(store.ambil(data.id)?.harga).toBe(49000)
  })
  it('produk yang tidak ada ditolak', async () => {
    const res = await buatPesanan(post('/api/pesanan', { produkId: 'tidak-ada' }), new MemoryStore())
    expect(res.status).toBe(404)
  })
})
