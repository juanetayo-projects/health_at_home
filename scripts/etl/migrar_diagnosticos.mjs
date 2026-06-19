// ETL: diagnóstico principal por paciente (pacientes.diagxrips/diagnosticos)
// -> public.paciente_diagnosticos. Idempotente (borra los previos antes).
import 'dotenv/config'
import mysql from 'mysql2/promise'
import { clienteAdmin } from './_supabase.mjs'

const cfg = {
  host: process.env.LEGACY_DB_HOST, port: Number(process.env.LEGACY_DB_PORT || 3306),
  user: process.env.LEGACY_DB_USER, password: process.env.LEGACY_DB_PASS,
  database: process.env.LEGACY_DB_NAME, connectTimeout: 20000,
}
const limpia = (s) => { const v = (s ?? '').toString().trim(); return v === '' ? null : v }

const con = await mysql.createConnection(cfg)
const sb = await clienteAdmin()

// Mapa identidad -> id (nuevo). Paginado.
console.log('Cargando mapa de pacientes…')
const idPorIdentidad = new Map()
let desde = 0
for (;;) {
  const { data, error } = await sb.from('pacientes').select('id, identidad').range(desde, desde + 999)
  if (error) { console.error(error.message); process.exit(1) }
  if (!data || data.length === 0) break
  for (const p of data) idPorIdentidad.set(String(p.identidad), p.id)
  if (data.length < 1000) break
  desde += 1000
}
console.log(`  ${idPorIdentidad.size} pacientes en destino.`)

// Diagnóstico principal del legado
const [rows] = await con.query(
  "SELECT identidad, TRIM(diagxrips) cie, TRIM(diagnosticos) desc_dx FROM pacientes WHERE TRIM(IFNULL(diagnosticos,'')) <> '' OR TRIM(IFNULL(diagxrips,'')) <> ''")
await con.end()

const vistos = new Set()
const filas = []
for (const r of rows) {
  const pid = idPorIdentidad.get(String(r.identidad).trim())
  if (!pid || vistos.has(pid)) continue
  vistos.add(pid)
  filas.push({
    paciente_id: pid,
    codigo_cie10: limpia(r.cie),
    descripcion: limpia(r.desc_dx),
    tipo: 'Principal',
  })
}
console.log(`Diagnósticos a cargar: ${filas.length}`)

// Idempotencia: limpiar los principales previos (migración).
await sb.from('paciente_diagnosticos').delete().eq('tipo', 'Principal')

let n = 0
const LOTE = 1000
for (let i = 0; i < filas.length; i += LOTE) {
  const lote = filas.slice(i, i + LOTE)
  const { error } = await sb.from('paciente_diagnosticos').insert(lote)
  if (error) { console.error(`❌ lote ${i / LOTE}: ${error.message}`); process.exit(1) }
  n += lote.length
  process.stdout.write(`\r  Cargados ${n}/${filas.length}`)
}
const { count } = await sb.from('paciente_diagnosticos').select('*', { count: 'exact', head: true })
console.log(`\n✅ Diagnósticos cargados. Total: ${count}`)
