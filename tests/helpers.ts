import { tandatangani } from '../src/lib/hmac'
export const SECRET = 'rahasia-uji'
export const req = (path: string, uid = 'pengunjung', init: RequestInit = {}) =>
  new Request('http://localhost:3000' + path, {
    ...init,
    headers: { cookie: `uid=${uid}`, ...(init.headers as object) },
  })
export const post = (path: string, body: unknown, uid = 'pengunjung') =>
  req(path, uid, { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } })
export async function webhookReq(body: object, secret = SECRET) {
  const isi = JSON.stringify(body)
  return new Request('http://localhost:3000/api/webhook', {
    method: 'POST',
    body: isi,
    headers: { 'x-signature': await tandatangani(secret, isi) },
  })
}
