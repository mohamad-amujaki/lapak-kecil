export type Pesanan = {
  id: string
  uid: string
  produkId: string
  harga: number
  status: 'menunggu' | 'lunas'
  kunci?: string | null
}

// Kontrak penyimpanan. Dua implementasi: MemoryStore (tes) dan D1Store (produksi).
export interface Store {
  buat(p: Pesanan): Promise<Pesanan>
  ambil(id: string): Promise<Pesanan | undefined>
  cariKunci(uid: string, kunci: string): Promise<Pesanan | undefined>
  tandaiLunas(id: string): Promise<void>
  produkLunas(uid: string): Promise<string[]>
}

export class MemoryStore implements Store {
  pesanan = new Map<string, Pesanan>()
  akses = new Set<string>() // dipakai versi awal (handlers/awal.ts) saja

  async buat(p: Pesanan) { this.pesanan.set(p.id, p); return p }
  async ambil(id: string) { return this.pesanan.get(id) }
  async cariKunci(uid: string, kunci: string) {
    return [...this.pesanan.values()].find(p => p.uid === uid && p.kunci === kunci)
  }
  async tandaiLunas(id: string) {
    const p = this.pesanan.get(id)
    if (p) p.status = 'lunas'
  }
  async produkLunas(uid: string) {
    return [...this.pesanan.values()].filter(p => p.uid === uid && p.status === 'lunas').map(p => p.produkId)
  }
  beriAkses(uid: string, produkId: string) { this.akses.add(`${uid}:${produkId}`) }
  daftarAkses(uid: string) {
    return [...this.akses].filter(k => k.startsWith(uid + ':')).map(k => k.split(':')[1])
  }
}
