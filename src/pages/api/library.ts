import type { APIRoute } from 'astro'
import { library } from '../../handlers/toko'
import { store } from '../../lib/runtime'
export const GET: APIRoute = ({ request }) => library(request, store())
