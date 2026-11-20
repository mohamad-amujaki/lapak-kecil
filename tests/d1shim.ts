// Pengganti D1 untuk tes: SQLite bawaan Node dengan bentuk API yang sama.
import { DatabaseSync } from 'node:sqlite'
import { readFileSync, readdirSync } from 'node:fs'
import type { D1Like } from '../src/lib/d1store'

export function buatD1Uji(): D1Like {
  const db = new DatabaseSync(':memory:')
  for (const f of readdirSync('migrations').sort()) db.exec(readFileSync(`migrations/${f}`, 'utf8'))
  return {
    prepare(sql: string) {
      const st = db.prepare(sql)
      return {
        bind: (...v: unknown[]) => ({
          first: async () => (st.get(...(v as any[])) as any) ?? null,
          run: async () => st.run(...(v as any[])),
          all: async () => ({ results: st.all(...(v as any[])) as any[] }),
        }),
      }
    },
  }
}
