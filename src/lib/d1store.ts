import type { Pesanan, Store } from './store'

// Bentuk minimal D1 yang kita pakai (cocok dengan D1Database Cloudflare).
export interface D1Like {
  prepare(sql: string): {
    bind(...v: unknown[]): {
      first<T = any>(): Promise<T | null>
      run(): Promise<unknown>
      all<T = any>(): Promise<{ results: T[] }>
    }
  }
}

type Baris = { id: string; uid: string; produk_id: string; harga: number; status: 'menunggu' | 'lunas'; kunci_idempotensi: string | null }
const keObjek = (r: Baris): Pesanan => ({
  id: r.id, uid: r.uid, produkId: r.produk_id, harga: r.harga, status: r.status, kunci: r.kunci_idempotensi,
})

// SEMUA kueri berparameter (bind). Jangan pernah menyambung teks dari pengguna ke SQL.
export class D1Store implements Store {
  constructor(private db: D1Like) {}

  async buat(p: Pesanan) {
    await this.db
      .prepare('INSERT INTO pesanan (id, uid, produk_id, harga, status, kunci_idempotensi) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(p.id, p.uid, p.produkId, p.harga, p.status, p.kunci ?? null)
      .run()
    return p
  }
  async ambil(id: string) {
    const r = await this.db.prepare('SELECT * FROM pesanan WHERE id = ?').bind(id).first<Baris>()
    return r ? keObjek(r) : undefined
  }
  async cariKunci(uid: string, kunci: string) {
    const r = await this.db
      .prepare('SELECT * FROM pesanan WHERE uid = ? AND kunci_idempotensi = ?')
      .bind(uid, kunci)
      .first<Baris>()
    return r ? keObjek(r) : undefined
  }
  async tandaiLunas(id: string) {
    await this.db.prepare("UPDATE pesanan SET status = 'lunas' WHERE id = ?").bind(id).run()
  }
  async produkLunas(uid: string) {
    const { results } = await this.db
      .prepare("SELECT produk_id FROM pesanan WHERE uid = ? AND status = 'lunas'")
      .bind(uid)
      .all<{ produk_id: string }>()
    return results.map(r => r.produk_id)
  }
}
