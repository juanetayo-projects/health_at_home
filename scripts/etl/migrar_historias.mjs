// ETL genérica de historias clínicas: una tabla legada -> public.historias
// (cabecera) con la fila clínica completa en datos_legado (JSONB).
// Uso: node migrar_historias.mjs <tabla_legado> <CODIGO_TIPO>
//   ej: node migrar_historias.mjs ad_apertura APERTURA
import 'dotenv/config'
import mysql from 'mysql2/promise'
import { clienteAdmin } from './_supabase.mjs'

const tabla = process.argv[2]
const codigoTipo = process.argv[3]
if (!tabla || !codigoTipo) { console.error('Uso: node migrar_historias.mjs <tabla> <CODIGO_TIPO>'); process.exit(1) }

const cfg = {
  host: process.env.LEGACY_DB_HOST, port: Number(process.env.LEGACY_DB_PORT || 3306),
  user: process.env.LEGACY_DB_USER, password: process.env.LEGACY_DB_PASS,
  database: process.env.LEGACY_DB_NAME, connectTimeout: 30000, dateStrings: true,
}
const con = await mysql.createConnection(cfg)
const sb = await clienteAdmin()

// tipo_historia_id
const { data: tipos } = await sb.from('tipos_historia').select('id, codigo')
const tipoId = (tipos || []).find((t) => t.codigo === codigoTipo)?.id
if (!tipoId) { console.error(`Tipo ${codigoTipo} no existe`); process.exit(1) }

// pacientes: identidad -> { id, sede_id }
console.log('Cargando mapa de pacientes…')
const pac = new Map()
let desde = 0
for (;;) {
  const { data } = await sb.from('pacientes').select('id, identidad, sede_id').range(desde, desde + 999)
  if (!data || data.length === 0) break
  for (const p of data) pac.set(String(p.identidad), { id: p.id, sede: p.sede_id })
  if (data.length < 1000) break
  desde += 1000
}
console.log(`  ${pac.size} pacientes.`)

// profesionales: regn -> "cedula - Nombre Apellidos"
const [profs] = await con.query('SELECT regn, identidad, nombre, apellidos FROM profesionales')
const profMap = new Map(profs.map((p) => [String(p.regn), `${(p.identidad || '').trim()} - ${(p.nombre || '').trim()} ${(p.apellidos || '').trim()}`.trim()]))

// Idempotencia: borrar lo previamente migrado de este tipo
await sb.from('historias').delete().eq('tipo_historia_id', tipoId).not('ref_legado', 'is', null)

console.log(`Leyendo ${tabla}…`)
const [rows] = await con.query(`SELECT * FROM \`${tabla}\``)
console.log(`  ${rows.length} filas.`)

const rech = { sin_paciente: 0, sin_fecha: 0 }
const filas = []
for (const r of rows) {
  const p = pac.get(String(r.identidad || '').trim())
  if (!p) { rech.sin_paciente++; continue }
  const fval = (d) => { if (!d) return null; const s = String(d); return s.startsWith('0000') ? null : s.slice(0, 19) }
  const f = fval(r.fecha) || fval(r.fechacre)
  if (!f) { rech.sin_fecha++; continue }
  const mes = Number(f.slice(5, 7)) || null
  const anio = Number(f.slice(0, 4)) || null
  const profRef = r.medico ?? r.profesional ?? r.usuariocre ?? r.usuario
  filas.push({
    paciente_id: p.id,
    tipo_historia_id: tipoId,
    sede_id: p.sede,
    fecha_atencion: f.slice(0, 19),
    periodo_mes: mes,
    periodo_anio: anio,
    estado: 'Migrado',
    profesional_legado: profMap.get(String(profRef)) || null,
    ref_legado: Number(r.regn) || null,
    datos_legado: r,
  })
}
await con.end()
console.log(`Preparadas: ${filas.length}. Rechazos:`, rech)

let n = 0
const LOTE = 500
for (let i = 0; i < filas.length; i += LOTE) {
  const lote = filas.slice(i, i + LOTE)
  const { error } = await sb.from('historias').insert(lote)
  if (error) { console.error(`\n❌ lote ${i / LOTE}: ${error.message}`); process.exit(1) }
  n += lote.length
  process.stdout.write(`\r  Cargadas ${n}/${filas.length}`)
}
const { count } = await sb.from('historias').select('*', { count: 'exact', head: true }).eq('tipo_historia_id', tipoId)
console.log(`\n✅ ${tabla} -> historias[${codigoTipo}]: ${count}`)
