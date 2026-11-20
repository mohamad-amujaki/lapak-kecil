// Penyimpanan sementara di memori. Bab 6 menggantinya dengan database (D1).
export type Pesanan = {
  id: string
  uid: string
  produkId: string
  harga: number
  status: 'menunggu' | 'lunas'
}

export class MemoryStore {
  pesanan = new Map<string, Pesanan>()
  // Versi awal (Bab 1): akses dicatat terpisah dari pesanan.
  akses = new Set<string>() // "uid:produkId"

  buat(p: Pesanan) { this.pesanan.set(p.id, p) }
  ambil(id: string) { return this.pesanan.get(id) }
  beriAkses(uid: string, produkId: string) { this.akses.add(`${uid}:${produkId}`) }
  daftarAkses(uid: string) {
    return [...this.akses].filter(k => k.startsWith(uid + ':')).map(k => k.split(':')[1])
  }
}
