import 'dotenv/config'
import mysql from 'mysql2/promise'
const cfg = { host: process.env.LEGACY_DB_HOST, port: Number(process.env.LEGACY_DB_PORT||3306), user: process.env.LEGACY_DB_USER, password: process.env.LEGACY_DB_PASS, database: process.env.LEGACY_DB_NAME, connectTimeout: 15000 }
const con = await mysql.createConnection(cfg)
const buscar = async (label, like) => {
  const [r] = await con.query(`SELECT tipo, codigo, descripcion FROM tablas WHERE descripcion LIKE ? ORDER BY tipo, CAST(codigo AS UNSIGNED) LIMIT 20`, [like])
  console.log(`\n== ${label} (LIKE ${like}) ==`)
  for (const x of r) console.log(`  tipo=${x.tipo} codigo=${JSON.stringify(x.codigo)} -> ${JSON.stringify(x.descripcion)}`)
}
await buscar('tipo identidad', '%dula%')        // Cédula
await buscar('estado paciente', '%Alta m%')      // Alta medica
await buscar('tipo usuario', '%Subsidiad%')      // Subsidiado
// Volcar catálogos completos de los tipos encontrados (se ajusta tras ver resultados)
const dump = async (tipo) => { const [r]=await con.query('SELECT codigo, descripcion FROM tablas WHERE tipo=? ORDER BY CAST(codigo AS UNSIGNED)',[tipo]); console.log(`\n-- tablas tipo=${tipo} (${r.length}) --`); for(const x of r) console.log(`  ${x.codigo}: ${x.descripcion}`) }
for (const t of (process.argv.slice(2))) await dump(Number(t))
await con.end()
