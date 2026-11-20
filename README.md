# Lapak Kecil

Proyek berjalan untuk ebook *Dari Vibecoder ke Product Engineer*.
Stack: Astro + Cloudflare (Workers, D1, R2). Setiap bab punya tag Git.

```bash
npm install
git checkout bab-01   # kode pada akhir Bab 1
npm test
```

| Tag | Isi | Bukti utama |
|---|---|---|
| `bab-01-awal` | Toko tidak aman: callback mempercayai `?status=paid` | tests/bab01-awal.test.ts (celah terbukti) |
| `bab-01` | Bukti bayar hanya dari webhook bertanda tangan | tests/bab01.test.ts |
| `bab-02` | Templat jurnal belajar, prompt tutor | bukti/bab-02 |
| `bab-03` | Templat peta pemahaman | bukti/bab-03 |
| `bab-04` | Harga ditentukan server | tests/bab04.test.ts |
| `bab-05` | `hitungTotal` dengan validasi tepi | tests/bab05.test.ts |
| `bab-06` | Penyimpanan D1, validasi, idempotensi | tests/bab06.test.ts |
| `bab-07` | Astro + Cloudflare, unduh bertanda tangan | tests/bab07.test.ts |
| `bab-08` | Rencana produk satu halaman | docs/rencana-produk.md |
| `bab-09` | Kode diskon (cabang `fitur/kode-diskon`, merge) | tests/bab09.test.ts |
| `bab-10` | Token desain, status UI, uji kontras | tests/bab10.test.ts |
| `bab-11` | Webhook keras, otorisasi, batas laju | tests/bab11.test.ts |
| `bab-12` | Health check, daftar periksa pra-rilis | tests/bab12.test.ts |

Menguji semua tag sekaligus: `./scripts/uji-semua-tag.sh`.

## Menjalankan lokal (dengan D1 lokal)

```bash
cp .dev.vars.example .dev.vars          # isi rahasia acak
npx wrangler d1 migrations apply lapak-kecil --local
npm run dev
```

## Produksi

Isi `database_id` di `wrangler.jsonc`, buat bucket R2 `lapak-kecil-files`, pasang rahasia dengan
`npx wrangler secret put WEBHOOK_SECRET` dan `DOWNLOAD_SECRET`, lalu ikuti `docs/PRA-RILIS.md`.

## Catatan kejujuran

- Penyedia pembayaran belum diintegrasikan: webhook memakai format sederhana bertanda tangan HMAC.
  Sesuaikan dengan format dan metode tanda tangan penyedia yang Anda pilih (mis. Midtrans, Xendit).
- Login masih berupa cookie `uid` sederhana untuk keperluan belajar. Ganti dengan autentikasi sungguhan sebelum produksi.
- Batas laju di memori hanya lapisan dasar; pakai aturan rate limiting Cloudflare di produksi.
- Deploy ke Cloudflare sungguhan belum diuji (hanya build dan D1 lokal).
