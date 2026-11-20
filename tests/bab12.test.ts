import { describe, it, expect } from 'vitest'
import { buatD1Uji } from './d1shim'
import { cekKesehatan } from '../src/lib/kesehatan'
// @ts-ignore modul skrip biasa
import { periksa } from '../scripts/pra-rilis.mjs'

describe('Bab 12: kesehatan dan pra-rilis', () => {
  it('sehat bila database terjangkau dan rahasia terpasang', async () => {
    const r = await cekKesehatan({ DB: buatD1Uji(), WEBHOOK_SECRET: 'a', DOWNLOAD_SECRET: 'b' })
    expect(r.ok).toBe(true)
  })
  it('tidak sehat bila rahasia hilang atau database mati', async () => {
    expect((await cekKesehatan({ DB: buatD1Uji() })).ok).toBe(false)
    const mati = { prepare: () => { throw new Error('mati') } } as any
    expect((await cekKesehatan({ DB: mati, WEBHOOK_SECRET: 'a', DOWNLOAD_SECRET: 'b' })).cek.database).toBe(false)
  })
  it('skrip pra-rilis menangkap .dev.vars yang masuk Git dan rahasia mentah', () => {
    const hasil = periksa({
      lacak: () => ['.dev.vars', 'wrangler.jsonc', 'src/x.ts'],
      baca: (f: string) => (f === 'src/x.ts' ? 'const token = "abcdefghijklmnop1234"' : 'GANTI-DENGAN'),
    })
    const gagal = hasil.filter((h: any) => !h.lulus).map((h: any) => h.nama)
    expect(gagal).toContain('Tidak ada .dev.vars atau .env di Git')
    expect(gagal).toContain('Tidak ada rahasia mentah di kode')
    expect(gagal).toContain('ID database D1 sudah diganti')
  })
  it('repositori ini lolos butir otomatis kecuali ID D1 yang memang placeholder', () => {
    const gagal = periksa().filter((h: any) => !h.lulus).map((h: any) => h.nama)
    expect(gagal).toEqual(['ID database D1 sudah diganti'])
  })
})
