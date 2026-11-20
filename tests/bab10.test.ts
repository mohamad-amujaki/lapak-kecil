import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { rasioKontras } from '../src/lib/kontras'

const css = readFileSync('src/styles/tokens.css', 'utf8')
const token = (n: string) => new RegExp(`--${n}:\\s*(#[0-9a-fA-F]{6})`).exec(css)![1]

describe('Bab 10: token desain dan kontras (WCAG AA, minimal 4.5:1)', () => {
  const pasangan: [string, string][] = [
    ['warna-teks', 'warna-latar'],
    ['warna-utama-teks', 'warna-utama'],
    ['warna-galat', 'warna-latar'],
    ['warna-berhasil', 'warna-latar'],
    ['warna-aksen', 'warna-latar'],
  ]
  it.each(pasangan)('%s di atas %s cukup kontras', (a, b) => {
    expect(rasioKontras(token(a), token(b))).toBeGreaterThanOrEqual(4.5)
  })
  it('ukuran sentuh minimal 44px', () => {
    expect(css).toMatch(/--sentuh-min:\s*44px/)
  })
  it('halaman memakai token, bukan warna mentah', () => {
    const layout = readFileSync('src/layouts/Dasar.astro', 'utf8')
    expect(layout).not.toMatch(/#[0-9a-fA-F]{3,6}\b/)
  })
})
