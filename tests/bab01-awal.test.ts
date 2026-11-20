import { describe, it, expect } from 'vitest'
import { MemoryStore } from '../src/lib/store'
import { callback, library } from '../src/handlers/awal'

const req = (path: string, uid = 'pengunjung') =>
  new Request('http://localhost:3000' + path, { headers: { cookie: `uid=${uid}` } })

describe('Bab 1 (awal): celah akses gratis', () => {
  it('LAB LANGKAH 4: ?status=paid membuka akses tanpa bayar (ini bug)', async () => {
    const store = new MemoryStore()
    await callback(req('/checkout/callback?status=paid&produk=template-1'), store)
    const res = await library(req('/library'), store)
    const data = await res.json()
    expect(data.produk).toContain('template-1') // pengunjung belum membayar!
  })
})
