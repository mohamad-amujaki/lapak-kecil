export type Item = { harga: number; jumlah: number }

// Versi awal (seperti yang ditulis AI): rapi, tetapi gagal di kasus tepi.
export function hitungTotal(items: Item[], diskon?: number) {
  let total = 0
  for (const item of items) {
    total += item.harga * item.jumlah
  }
  if (diskon) total = total - diskon
  return total
}
