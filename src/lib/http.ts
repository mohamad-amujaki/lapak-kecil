import { UID_RE } from './validasi'
export function uidDariCookie(req: Request): string | null {
  const m = /(?:^|;\s*)uid=([^;]+)/.exec(req.headers.get('cookie') ?? '')
  const uid = m ? decodeURIComponent(m[1]) : null
  return uid && UID_RE.test(uid) ? uid : null
}
export function json(data: unknown, status = 200, headers: HeadersInit = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  })
}
