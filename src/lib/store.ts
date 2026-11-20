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
  akses = new Set<string>() // dipakai versi awal saja

  buat(p: Pesanan) { this.pesanan.set(p.id, p) }
  ambil(id: string) { return this.pesanan.get(id) }
  tandaiLunas(id: string) {
    const p = this.pesanan.get(id)
    if (p) p.status = 'lunas'
  }
  produkLunas(uid: string) {
    return [...this.pesanan.values()].filter(p => p.uid === uid && p.status === 'lunas').map(p => p.produkId)
  }
  beriAkses(uid: string, produkId: string) { this.akses.add(`${uid}:${produkId}`) }
  daftarAkses(uid: string) {
    return [...this.akses].filter(k => k.startsWith(uid + ':')).map(k => k.split(':')[1])
  }
}
