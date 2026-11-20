import { describe, it, expect } from 'vitest'
import { hitungTotal } from '../src/lib/hitung'

describe('Bab 5: hitungTotal', () => {
  it('contoh biasa: 2 x 49.000 dikurangi 10.000 = 88.000', () => {
    expect(hitungTotal([{ harga: 49000, jumlah: 2 }], 10000)).toBe(88000)
  })
  it('BUG: diskon lebih besar dari total menghasilkan total negatif', () => {
    expect(hitungTotal([{ harga: 49000, jumlah: 1 }], 100000)).toBe(-51000)
  })
  it('BUG: jumlah negatif mengurangi total', () => {
    expect(hitungTotal([{ harga: 49000, jumlah: -1 }])).toBe(-49000)
  })
  it('keranjang kosong bernilai 0', () => {
    expect(hitungTotal([])).toBe(0)
  })
})
