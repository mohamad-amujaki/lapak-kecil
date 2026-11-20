export const UID_RE = /^[A-Za-z0-9_-]{1,64}$/
export const KUNCI_RE = /^[A-Za-z0-9_-]{8,64}$/

export function validasiPesanan(body: unknown): { ok: true; produkId: string; kode?: unknown } | { ok: false; error: string } {
  if (typeof body !== 'object' || body === null) return { ok: false, error: 'isi harus objek JSON' }
  const { produkId, kode } = body as Record<string, unknown>
  if (typeof produkId !== 'string' || !/^[a-z0-9-]{1,40}$/.test(produkId)) return { ok: false, error: 'produkId tidak valid' }
  return { ok: true, produkId, kode }
}
