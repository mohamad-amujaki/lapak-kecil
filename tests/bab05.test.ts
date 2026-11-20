import { describe, it, expect } from 'vitest'
import { hitungTotal } from '../src/lib/hitung'

describe('Bab 5: hitungTotal', () => {
  it('contoh biasa: 2 x 49.000 dikurangi 10.000 = 88.000', () => {
    expect(hitungTotal([{ harga: 49000, jumlah: 2 }], 10000)).toBe(88000)
  })
  it('diskon lebih besar dari total menghasilkan 0, bukan negatif', () => {
    expect(hitungTotal([{ harga: 49000, jumlah: 1 }], 100000)).toBe(0)
  })
  it('jumlah negatif atau pecahan ditolak', () => {
    expect(() => hitungTotal([{ harga: 49000, jumlah: -1 }])).toThrow(RangeError)
    expect(() => hitungTotal([{ harga: 49000, jumlah: 1.5 }])).toThrow(RangeError)
  })
  it('diskon negatif ditolak', () => {
    expect(() => hitungTotal([{ harga: 49000, jumlah: 1 }], -5000)).toThrow(RangeError)
  })
  it('keranjang kosong bernilai 0', () => {
    expect(hitungTotal([])).toBe(0)
  })
})
