import type { APIRoute } from 'astro'
import { unduh } from '../../handlers/unduh'
import { store, bindings } from '../../lib/runtime'
export const GET: APIRoute = ({ request }) => unduh(request, store(), bindings())
