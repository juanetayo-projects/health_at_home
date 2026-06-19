// Inventaria procedimientos, funciones y triggers de la BD legada.
// Uso:
//   node rutinas.mjs            -> lista nombres
//   node rutinas.mjs PROC nombre  -> imprime definición de un procedimiento/función
//   node rutinas.mjs TRIG nombre  -> imprime definición de un trigger
import 'dotenv/config'
import mysql from 'mysql2/promise'

const cfg = {
  host: process.env.LEGACY_DB_HOST, port: Number(process.env.LEGACY_DB_PORT || 3306),
  user: process.env.LEGACY_DB_USER, password: process.env.LEGACY_DB_PASS,
  database: process.env.LEGACY_DB_NAME, connectTimeout: 15000,
}
const con = await mysql.createConnection(cfg)
const db = cfg.database
const tipo = process.argv[2]
const nombre = process.argv[3]

if (!tipo) {
  const [rutinas] = await con.query(
    'SELECT routine_name, routine_type FROM information_schema.routines WHERE routine_schema = ? ORDER BY routine_type, routine_name', [db])
  const g = (o, k) => o[k] ?? o[k.toUpperCase()]
  console.log(`== Rutinas (${rutinas.length}) ==`)
  for (const r of rutinas) console.log(`  [${g(r, 'routine_type')}] ${g(r, 'routine_name')}`)

  const [triggers] = await con.query(
    'SELECT trigger_name, event_manipulation, event_object_table, action_timing FROM information_schema.triggers WHERE trigger_schema = ? ORDER BY event_object_table', [db])
  console.log(`\n== Triggers (${triggers.length}) ==`)
  for (const t of triggers) console.log(`  ${g(t, 'trigger_name')}: ${g(t, 'action_timing')} ${g(t, 'event_manipulation')} ON ${g(t, 'event_object_table')}`)
} else if (tipo === 'TRIG') {
  const [r] = await con.query(
    'SELECT action_statement, action_timing, event_manipulation, event_object_table FROM information_schema.triggers WHERE trigger_schema = ? AND trigger_name = ?', [db, nombre])
  console.log(JSON.stringify(r[0], null, 2))
} else {
  const tipoSql = tipo === 'FUNC' ? 'FUNCTION' : 'PROCEDURE'
  const [r] = await con.query(`SHOW CREATE ${tipoSql} \`${nombre}\``)
  const def = r[0]?.['Create Procedure'] || r[0]?.['Create Function']
  console.log(def || JSON.stringify(r[0]))
}
await con.end()
