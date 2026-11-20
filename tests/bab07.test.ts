import { describe, it, expect } from 'vitest'
import { MemoryStore } from '../src/lib/store'
import { mintaTautan, unduh, type UnduhEnv } from '../src/handlers/unduh'
import { req } from './helpers'

const env: UnduhEnv = {
  DOWNLOAD_SECRET: 'rahasia-unduh',
  FILES: { get: async (k) => (k === 'template-1.zip' ? { body: 'ISI-ZIP' } : null) },
}
async function siapkan(status: 'menunggu' | 'lunas') {
  const s = new MemoryStore()
  await s.buat({ id: 'p1', uid: 'ani', produkId: 'template-1', harga: 49000, status })
  return s
}

describe('Bab 7: unduh hanya untuk pembeli', () => {
  it('pembeli lunas: dapat tautan lalu mengunduh file', async () => {
    const s = await siapkan('lunas')
    const { url } = await (await mintaTautan(req('/api/tautan-unduh?pesanan=p1', 'ani'), s, env)).json()
    const res = await unduh(req(url, 'siapa-saja'), s, env)
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('ISI-ZIP')
  })
  it('LAB LANGKAH 5: pengunjung tanpa pesanan ditolak', async () => {
    const s = await siapkan('lunas')
    expect((await mintaTautan(req('/api/tautan-unduh?pesanan=p1', 'pengunjung'), s, env)).status).toBe(403)
  })
  it('pesanan belum lunas ditolak', async () => {
    const s = await siapkan('menunggu')
    expect((await mintaTautan(req('/api/tautan-unduh?pesanan=p1', 'ani'), s, env)).status).toBe(403)
  })
  it('tanda tangan dipalsukan ditolak', async () => {
    const s = await siapkan('lunas')
    const exp = Math.floor(Date.now() / 1000) + 300
    expect((await unduh(req(`/api/unduh?p=p1&exp=${exp}&sig=${'0'.repeat(64)}`), s, env)).status).toBe(403)
  })
  it('tautan kedaluwarsa ditolak', async () => {
    const s = await siapkan('lunas')
    const { url } = await (await mintaTautan(req('/api/tautan-unduh?pesanan=p1', 'ani'), s, env, 0)).json()
    expect((await unduh(req(url), s, env, 10 * 60 * 1000)).status).toBe(410)
  })
})
