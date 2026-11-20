# Aturan proyek untuk agen pengodean

1. Satu tugas, satu cabang. Jangan ubah file di luar lingkup tugas.
2. Jalankan `npm test` sebelum menyatakan selesai. Jangan mengubah file di `tests/` kecuali diminta.
3. Folder terlarang tanpa izin eksplisit: `src/handlers/unduh.ts`, `src/lib/hmac.ts`, `migrations/` (area uang dan akses).
4. Harga, diskon, dan hak akses selalu dihitung di server. Jangan percaya angka dari klien.
5. Semua kueri database berparameter. Jangan ada rahasia di kode, log, atau percakapan.
