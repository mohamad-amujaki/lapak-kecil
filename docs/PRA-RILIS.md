# Daftar periksa pra-rilis dan rencana mundur (Bab 12)

## Sebelum rilis (centang dengan bukti)
- [ ] `npm test` lulus (semua uji serangan ditolak, jalur normal lolos)
- [ ] `node scripts/pra-rilis.mjs` tidak menampilkan butir kosong
- [ ] Rahasia terpasang: `npx wrangler secret put WEBHOOK_SECRET` dan `DOWNLOAD_SECRET`
- [ ] Migrasi diterapkan: `npx wrangler d1 migrations apply lapak-kecil --remote`
- [ ] `/api/health` mengembalikan 200 di alamat sungguhan
- [ ] Cadangan data: `npx wrangler d1 export lapak-kecil --remote --output cadangan.sql`
- [ ] Halaman galat ramah dan kontak dukungan tampil
- [ ] Satu pembelian uji (mode uji penyedia pembayaran) berjalan dari awal sampai unduh

## Rencana mundur
1. Lihat versi: `npx wrangler deployments list`
2. Kembalikan: `npx wrangler rollback` (pilih versi sebelumnya)
3. Bila migrasi bermasalah: pulihkan dari `cadangan.sql`
4. Catat waktu dan penyebab di `docs/PASCA-KEJADIAN.md`

## Perawatan
| Waktu | Rutinitas |
|---|---|
| Harian (5 menit) | Cek `/api/health`, log galat, pesanan lunas tanpa akses |
| Mingguan (30 menit) | Perbarui dependensi, tinjau log, coba satu serangan dari tabel ancaman, cek cadangan |
| Bulanan | Tinjau umpan balik dan perbarui rencana produk |
