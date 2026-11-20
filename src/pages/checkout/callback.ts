import type { APIRoute } from 'astro'
import { callback } from '../../handlers/toko'
import { store } from '../../lib/runtime'
export const GET: APIRoute = ({ request }) => callback(request, store())
