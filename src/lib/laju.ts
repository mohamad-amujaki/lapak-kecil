// Pembatas laju sederhana per kunci (mis. IP). CATATAN: di Workers, memori bersifat per-isolate,
// jadi ini hanya lapisan dasar. Untuk produksi, tambahkan aturan rate limiting di Cloudflare.
export class BatasLaju {
  private hit = new Map<string, number[]>()
  constructor(private maks: number, private jendelaMs: number) {}
  izinkan(kunci: string, sekarang = Date.now()) {
    const baru = (this.hit.get(kunci) ?? []).filter(t => sekarang - t < this.jendelaMs)
    baru.push(sekarang)
    this.hit.set(kunci, baru)
    return baru.length <= this.maks
  }
}
