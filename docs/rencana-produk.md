# Rencana satu halaman: Lapak Kecil (Bab 8)

- **Masalah:** pembuat template desain kesulitan menjual file digital tanpa membangun toko sendiri.
- **Pengguna:** pembeli template (Rp29.000-49.000) dan satu penjual.
- **Hasil yang diharapkan:** pembeli membayar lalu mengunduh dalam kurang dari 3 menit.
- **Fitur inti (maks. 3):** katalog; checkout dan pembayaran; unduh khusus pembeli.
- **Tidak dulu:** akun lengkap, keranjang multi-produk, kode diskon (Bab 9), dasbor admin, ulasan.
- **Risiko terbesar:** akses gratis lewat bukti pembayaran palsu (Bab 1, Bab 11).

## Tugas dan bukti

| Tugas | Hasil terlihat | Bukti | Taruhan |
|---|---|---|---|
| Katalog menampilkan produk | Dua produk tampil | Tangkapan layar | kecil |
| Checkout membuat pesanan | Baris baru di tabel pesanan | tests/bab06.test.ts | besar |
| Webhook menandai lunas | Status berubah | tests/bab01.test.ts | besar |
| Unduh hanya untuk pembeli | Pengunjung ditolak | tests/bab07.test.ts | besar |
