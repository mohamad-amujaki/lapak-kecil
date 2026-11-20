import type { APIRoute } from 'astro'
import { buatPesanan } from '../../handlers/toko'
import { store } from '../../lib/runtime'
export const POST: APIRoute = ({ request }) => buatPesanan(request, store())
