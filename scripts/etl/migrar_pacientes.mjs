// ETL: pacientes (legado cacsb_adtw.pacientes) -> Supabase public.pacientes
// Idempotente (upsert por identidad). Carga catálogos de `tablas` al vuelo.
// No imprime PHI (solo conteos y rechazos agregados).
import 'dotenv/config'
import mysql from 'mysql2/promise'
import { clienteAdmin } from './_supabase.mjs'

const cfg = {
  host: process.env.LEGACY_DB_HOST, port: Number(process.env.LEGACY_DB_PORT || 3306),
  user: process.env.LEGACY_DB_USER, password: process.env.LEGACY_DB_PASS,
  database: process.env.LEGACY_DB_NAME, connectTimeout: 20000, dateStrings: true,
}

const norm = (s) => (s || '').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toUpperCase()
const limpia = (s) => { const v = (s ?? '').toString().trim(); return v === '' ? null : v }
const fecha = (d) => (!d || d === '0000-00-00' || String(d).startsWith('0000')) ? null : String(d).slice(0, 10)

console.log('Cargando catálogos del legado…')
const con = await mysql.createConnection(cfg)
const mapaTabla = async (tipo) => {
  const [r] = await con.query('SELECT codigo, descripcion FROM tablas WHERE tipo = ?', [tipo])
  return new Map(r.map((x) => [String(x.codigo), x.descripcion]))
}
const sedesLeg = await mapaTabla(1)    // seccion -> nombre sede
const ciudades = await mapaTabla(3)    // DANE -> ciudad
const estados = await mapaTabla(17)    // estadopaciente -> texto
const tiposUsr = await mapaTabla(80)   // tipousuario -> texto
const tiposId = await mapaTabla(60)    // tipoid -> texto

// tipoid (texto) -> código corto del nuevo esquema
const codId = (txt) => {
  const t = norm(txt)
  if (t.includes('CIUDADAN')) return 'CC'
  if (t.includes('TARJETA')) return 'TI'
  if (t.includes('EXTRANJER')) return 'CE'
  if (t.includes('REGISTRO')) return 'RC'
  if (t.includes('PASAPORTE')) return 'PA'
  if (t.includes('MENOR')) return 'MS'
  if (t.includes('ADULTO')) return 'AS'
  return 'CC'
}

const sb = await clienteAdmin()
// Mapas desde Supabase: sede nombre normalizado -> id ; entidad nit -> id
const { data: sedesNew } = await sb.from('sedes').select('id, nombre')
const sedeIdPorNombre = new Map(sedesNew.map((s) => [norm(s.nombre), s.id]))
const sedePorSeccion = new Map()
for (const [cod, nombre] of sedesLeg) sedePorSeccion.set(String(cod), sedeIdPorNombre.get(norm(nombre)) || null)

const entidadId = new Map()
{
  let desde = 0
  for (;;) {
    const { data } = await sb.from('entidades').select('id, nit').range(desde, desde + 999)
    if (!data || data.length === 0) break
    for (const e of data) entidadId.set(String(e.nit).replace(/[^0-9]/g, ''), e.id)
    if (data.length < 1000) break
    desde += 1000
  }
}

console.log('Leyendo pacientes del legado…')
const [filas] = await con.query(`SELECT * FROM pacientes`)
await con.end()
console.log(`  ${filas.length} filas leídas.`)

const rechazos = { sin_fechanac: 0, sin_sede: 0, sin_identidad: 0 }
const porIdentidad = new Map() // dedup por identidad (último por fechamod)

for (const p of filas) {
  const identidad = limpia(p.identidad)
  if (!identidad) { rechazos.sin_identidad++; continue }
  const fnac = fecha(p.fechanac)
  if (!fnac) { rechazos.sin_fechanac++; continue }
  const sede_id = sedePorSeccion.get(String(p.seccion))
  if (!sede_id) { rechazos.sin_sede++; continue }

  const direccion = limpia(p.direccion) ||
    [p.tipovia, p.tipovia1, p.tipoviac, p.tipovia2, p.tipovia3].map((x) => limpia(x)).filter(Boolean).join(' ') || null

  const fila = {
    identidad,
    tipo_identidad: codId(tiposId.get(String(p.tipoid))),
    apellidos: [limpia(p.primer_apellido), limpia(p.segundo_apellido)].filter(Boolean).join(' ') || '(SIN DATO)',
    nombres: [limpia(p.primer_nombre), limpia(p.segundo_nombre)].filter(Boolean).join(' ') || '(SIN DATO)',
    sexo: (norm(p.sexo) === 'M' || norm(p.sexo) === 'F') ? norm(p.sexo) : 'F',
    fecha_nacimiento: fnac,
    rh: limpia(p.rh),
    email: limpia(p.email),
    direccion,
    barrio: limpia(p.barrio),
    telefono_fijo: limpia(p.telefonos),
    ciudad_atencion: ciudades.get(String(p.ciudadatencion)) || null,
    ciudad_visita: ciudades.get(String(p.ciudadvisita)) || null,
    comuna: p.comuna ? String(p.comuna) : null,
    responsable_nombre: limpia(p.responsable),
    responsable_telefono: limpia(p.responabletelef),
    medico_tratante: limpia(p.medicotra),
    tipo_usuario: tiposUsr.get(String(p.tipousuario)) || null,
    fecha_ingreso: fecha(p.fechaing),
    entidad_id: entidadId.get(String(p.entidad || '').replace(/[^0-9]/g, '')) || null,
    aceptado: !!Number(p.aceptado),
    estado: estados.get(String(p.estadopaciente)) || 'Activo',
    fecha_estado: fecha(p.fechaestado),
    alto_riesgo: ['1', 'S', 'SI'].includes(norm(p.altoriesgo)),
    sede_id,
  }
  porIdentidad.set(identidad, fila) // último gana
}

const limpias = [...porIdentidad.values()]
console.log(`\nPreparadas: ${limpias.length} pacientes únicos.`)
console.log(`Rechazos:`, rechazos)

let cargados = 0
const LOTE = 500
for (let i = 0; i < limpias.length; i += LOTE) {
  const lote = limpias.slice(i, i + LOTE)
  const { error } = await sb.from('pacientes').upsert(lote, { onConflict: 'identidad' })
  if (error) { console.error(`❌ Lote ${i / LOTE}: ${error.message}`); process.exit(1) }
  cargados += lote.length
  process.stdout.write(`\r  Cargados ${cargados}/${limpias.length}`)
}
const { count } = await sb.from('pacientes').select('*', { count: 'exact', head: true })
console.log(`\n✅ ETL completa. Total en pacientes: ${count}`)
