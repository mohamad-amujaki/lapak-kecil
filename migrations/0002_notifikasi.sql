CREATE TABLE IF NOT EXISTS notifikasi (
  event_id TEXT PRIMARY KEY,
  diterima TEXT NOT NULL DEFAULT (datetime('now'))
);
