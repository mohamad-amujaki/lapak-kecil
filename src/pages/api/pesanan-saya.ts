import type { APIRoute } from 'astro'
import { lihatPesanan } from '../../handlers/toko'
import { store } from '../../lib/runtime'
export const GET: APIRoute = ({ request }) => lihatPesanan(request, store())
