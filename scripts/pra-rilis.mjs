#!/usr/bin/env node
// Daftar periksa pra-rilis otomatis (Bab 12). Keluar dengan kode 1 bila ada yang gagal.
import { execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

export function periksa({ lacak = () => execSync('git ls-files', { encoding: 'utf8' }).split('\n').filter(Boolean), baca = f => readFileSync(f, 'utf8') } = {}) {
  const hasil = []
  const ok = (nama, lulus, saran = '') => hasil.push({ nama, lulus, saran })
  const files = lacak()
  ok('Tidak ada .dev.vars atau .env di Git', !files.some(f => /(^|\/)(\.dev\.vars|\.env)$/.test(f)), 'Hapus dari Git dan ganti rahasianya')
  const rahasiaMentah = files.filter(f => /\.(ts|astro|mjs|jsonc?)$/.test(f) && f !== 'scripts/pra-rilis.mjs' && !f.startsWith('tests/')).filter(f => /(secret|token|apikey)\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}['"]/i.test(baca(f)))
  ok('Tidak ada rahasia mentah di kode', rahasiaMentah.length === 0, rahasiaMentah.join(', '))
  ok('ID database D1 sudah diganti', !baca('wrangler.jsonc').includes('GANTI-DENGAN'), 'Isi database_id di wrangler.jsonc')
  ok('Tes serangan ada untuk webhook, unduh, dan akses silang', ['tests/bab01.test.ts', 'tests/bab07.test.ts', 'tests/bab11.test.ts'].every(f => files.includes(f)))
  ok('Halaman kesehatan tersedia', files.includes('src/pages/api/health.ts'))
  ok('Rencana mundur terdokumentasi', files.includes('docs/PRA-RILIS.md'))
  return hasil
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const hasil = periksa()
  for (const h of hasil) console.log(`${h.lulus ? '[x]' : '[ ]'} ${h.nama}${h.lulus ? '' : '  -> ' + h.saran}`)
  process.exit(hasil.every(h => h.lulus) ? 0 : 1)
}
