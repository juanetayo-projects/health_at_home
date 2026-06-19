// ETL: Entidades/EPS (nits tipo=1) -> Supabase public.entidades
// Idempotente (upsert por codigo = NIT). No imprime PHI.
import 'dotenv/config'
import mysql from 'mysql2/promise'
import { clienteAdmin } from './_supabase.mjs'

const cfg = {
  host: process.env.LEGACY_DB_HOST, port: Number(process.env.LEGACY_DB_PORT || 3306),
  user: process.env.LEGACY_DB_USER, password: process.env.LEGACY_DB_PASS,
  database: process.env.LEGACY_DB_NAME, connectTimeout: 15000,
}

const con = await mysql.createConnection(cfg)

// Mapa DANE -> ciudad (tablas tipo=3)
const [ciudadesRows] = await con.query("SELECT codigo, descripcion FROM tablas WHERE tipo = 3")
const ciudades = new Map(ciudadesRows.map((r) => [String(r.codigo), r.descripcion]))

// EPS = nits tipo = 1
const [nits] = await con.query(
  "SELECT nit, nombre, ciudad, direccion, telefonos, email1 FROM nits WHERE tipo = 1 AND nit IS NOT NULL AND nit <> ''",
)
await con.end()

// Normaliza y deduplica por nit
const porNit = new Map()
for (const n of nits) {
  const codigo = String(n.nit).trim()
  if (!codigo || porNit.has(codigo)) continue
  porNit.set(codigo, {
    codigo,
    nit: codigo,
    nombre: (n.nombre || '').trim() || codigo,
    unidad: null,
    ciudad: ciudades.get(String(n.ciudad)) || null,
    direccion: (n.direccion || '').trim() || null,
    telefono: (n.telefonos || '').trim() || null,
    email: (n.email1 || '').trim() || null,
    activo: true,
  })
}
const filas = [...porNit.values()]
console.log(`Entidades a cargar: ${filas.length} (de ${nits.length} filas nits tipo=1)`)

const sb = await clienteAdmin()
const { error, count } = await sb.from('entidades').upsert(filas, { onConflict: 'codigo', count: 'exact' })
if (error) {
  console.error('❌ Error upsert:', error.message)
  process.exit(1)
}
const { count: total } = await sb.from('entidades').select('*', { count: 'exact', head: true })
console.log(`✅ Upsert OK (${count ?? filas.length} filas). Total en entidades: ${total}`)
