import { env } from 'cloudflare:workers'
import { D1Store } from './d1store'

// Satu-satunya tempat yang menyentuh binding Cloudflare. Handler lain tetap murni dan mudah diuji.
export const bindings = () => env as unknown as { DB: any; FILES: any; WEBHOOK_SECRET: string; DOWNLOAD_SECRET: string }
export const store = () => new D1Store(bindings().DB)
