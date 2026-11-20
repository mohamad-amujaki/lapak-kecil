import { hitungTotal } from './hitung'

type Kode = { jenis: 'persen' | 'tetap'; nilai: number; berlakuSampai: string }
// Tabel kode ada di server. Klien hanya mengirim teks kode.
const KODE: Record<string, Kode> = {
  HEMAT10: { jenis: 'persen', nilai: 10, berlakuSampai: '2027-12-31' },
  POTONG5K: { jenis: 'tetap', nilai: 5000, berlakuSampai: '2027-12-31' },
  LEBARAN: { jenis: 'persen', nilai: 25, berlakuSampai: '2026-04-30' },
}

export function hitungDiskon(kode: string, harga: number, sekarang = Date.now()): number {
  const k = KODE[kode.trim().toUpperCase()]
  if (!k) throw new Error('kode diskon tidak dikenal')
  if (sekarang > new Date(k.berlakuSampai + 'T23:59:59Z').getTime()) throw new Error('kode diskon kedaluwarsa')
  const potongan = k.jenis === 'persen' ? Math.floor((harga * k.nilai) / 100) : k.nilai
  return Math.min(potongan, harga)
}

export function hargaAkhir(harga: number, kode?: string, sekarang = Date.now()) {
  const diskon = kode ? hitungDiskon(kode, harga, sekarang) : 0
  return hitungTotal([{ harga, jumlah: 1 }], diskon)
}
