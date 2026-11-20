// Log terstruktur satu baris. Jangan masukkan email, cookie, atau rahasia ke sini.
export const catat = (peristiwa: string, data: Record<string, unknown> = {}) =>
  console.log(JSON.stringify({ t: new Date().toISOString(), peristiwa, ...data }))
