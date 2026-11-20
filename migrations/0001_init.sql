CREATE TABLE IF NOT EXISTS pesanan (
  id TEXT PRIMARY KEY,
  uid TEXT NOT NULL,
  produk_id TEXT NOT NULL,
  harga INTEGER NOT NULL CHECK (harga >= 0),
  status TEXT NOT NULL DEFAULT 'menunggu' CHECK (status IN ('menunggu','lunas')),
  kunci_idempotensi TEXT,
  dibuat TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pesanan_kunci ON pesanan (uid, kunci_idempotensi) WHERE kunci_idempotensi IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pesanan_uid ON pesanan (uid);
