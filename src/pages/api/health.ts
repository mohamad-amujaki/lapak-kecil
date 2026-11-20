import type { APIRoute } from 'astro'
import { bindings } from '../../lib/runtime'
import { cekKesehatan } from '../../lib/kesehatan'
export const GET: APIRoute = async () => {
  const hasil = await cekKesehatan(bindings())
  return new Response(JSON.stringify(hasil), { status: hasil.ok ? 200 : 503, headers: { 'content-type': 'application/json' } })
}
