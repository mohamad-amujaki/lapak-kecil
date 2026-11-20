import type { APIRoute } from 'astro'
import { webhook } from '../../handlers/toko'
import { store, bindings } from '../../lib/runtime'
export const POST: APIRoute = ({ request }) => webhook(request, store(), bindings())
