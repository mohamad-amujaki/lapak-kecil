export type Item = { harga: number; jumlah: number }

// Bab 5 (perbaikan): validasi masukan dan batasi total agar tidak negatif.
export function hitungTotal(items: Item[], diskon = 0) {
  let total = 0
  for (const item of items) {
    if (!Number.isInteger(item.jumlah) || item.jumlah < 1) throw new RangeError('jumlah harus bilangan bulat >= 1')
    if (!Number.isFinite(item.harga) || item.harga < 0) throw new RangeError('harga tidak valid')
    total += item.harga * item.jumlah
  }
  if (!Number.isFinite(diskon) || diskon < 0) throw new RangeError('diskon tidak valid')
  return Math.max(0, total - diskon)
}
