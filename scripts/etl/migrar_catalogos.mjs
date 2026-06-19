// ETL de catálogos clínicos: CIE-10 y articulos (medicamentos).
// Uso: node migrar_catalogos.mjs [cie10|articulos|all]
import 'dotenv/config'
import mysql from 'mysql2/promise'
import { clienteAdmin } from './_supabase.mjs'

const cfg = {
  host: process.env.LEGACY_DB_HOST, port: Number(process.env.LEGACY_DB_PORT || 3306),
  user: process.env.LEGACY_DB_USER, password: process.env.LEGACY_DB_PASS,
  database: process.env.LEGACY_DB_NAME, connectTimeout: 20000,
}
const limpia = (s) => { const v = (s ?? '').toString().trim(); return v === '' ? null : v }
const que = process.argv[2] || 'all'

const con = await mysql.createConnection(cfg)
const sb = await clienteAdmin()

async function cargar(tabla, filas, onConflict) {
  let n = 0
  const LOTE = 1000
  for (let i = 0; i < filas.length; i += LOTE) {
    const lote = filas.slice(i, i + LOTE)
    const { error } = await sb.from(tabla).upsert(lote, { onConflict })
    if (error) { console.error(`❌ ${tabla} lote ${i / LOTE}: ${error.message}`); process.exit(1) }
    n += lote.length
    process.stdout.write(`\r  ${tabla}: ${n}/${filas.length}`)
  }
  const { count } = await sb.from(tabla).select('*', { count: 'exact', head: true })
  console.log(`\n  ✅ ${tabla}: total ${count}`)
}

if (que === 'cie10' || que === 'all') {
  const [rows] = await con.query('SELECT codigo, descripcion, abreviado FROM cie10')
  const m = new Map()
  for (const r of rows) {
    const codigo = limpia(r.codigo)
    if (!codigo || m.has(codigo)) continue
    m.set(codigo, { codigo, descripcion: limpia(r.descripcion) || codigo, abreviado: limpia(r.abreviado), activo: true })
  }
  console.log(`CIE-10: ${m.size} únicos (de ${rows.length})`)
  await cargar('cie10', [...m.values()], 'codigo')
}

if (que === 'articulos' || que === 'all') {
  const [rows] = await con.query('SELECT codigo, codigocup, descripcion, nombre, grupo, linea, estado FROM medicamentos')
  const m = new Map()
  for (const r of rows) {
    const codigo = limpia(r.codigo)
    if (!codigo || m.has(codigo)) continue
    m.set(codigo, {
      codigo,
      codigo_cup: limpia(r.codigocup)?.slice(0, 20) ?? null,
      descripcion: limpia(r.descripcion) || limpia(r.nombre),
      grupo: limpia(r.grupo),
      linea: limpia(r.linea),
      estado: Number(r.estado) ? 'Activo' : 'Inactivo',
    })
  }
  console.log(`Articulos (medicamentos): ${m.size} únicos (de ${rows.length})`)
  await cargar('articulos', [...m.values()], 'codigo')
}

if (que === 'servicios' || que === 'all') {
  const [rows] = await con.query(
    'SELECT regn, paquete, cups, codfac, tipop, activo, valor, valorurbanof, valorruralf FROM paquetes')
  const m = new Map()
  for (const r of rows) {
    // Clave única: CUPS si existe, si no codfac, si no sintetizada por regn.
    const codigo = (limpia(r.cups) || limpia(r.codfac) || `PKG-${r.regn}`).slice(0, 20)
    if (m.has(codigo)) continue
    m.set(codigo, {
      codigo_cups: codigo,
      tipo: limpia(r.tipop) || 'Servicio',
      nombre: (limpia(r.paquete) || codigo).slice(0, 250),
      valor: Number(r.valor) || 0,
      valor_urbano_prof: r.valorurbanof != null ? Number(r.valorurbanof) : null,
      valor_rural_prof: r.valorruralf != null ? Number(r.valorruralf) : null,
      cod_facturacion: limpia(r.codfac)?.slice(0, 20) ?? null,
      activo: Number(r.activo) ? true : false,
    })
  }
  console.log(`Servicios (paquetes): ${m.size} únicos (de ${rows.length})`)
  await cargar('servicios_catalogo', [...m.values()], 'codigo_cups')
}

await con.end()
