import type { APIRoute } from 'astro'
import { mintaTautan } from '../../handlers/unduh'
import { store, bindings } from '../../lib/runtime'
export const GET: APIRoute = ({ request }) => mintaTautan(request, store(), bindings())
