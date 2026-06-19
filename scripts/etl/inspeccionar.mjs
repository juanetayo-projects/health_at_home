// Inspección de la BD legada (MySQL). Lista tablas y conteos de filas.
import 'dotenv/config'
import mysql from 'mysql2/promise'

const cfg = {
  host: process.env.LEGACY_DB_HOST,
  port: Number(process.env.LEGACY_DB_PORT || 3306),
  user: process.env.LEGACY_DB_USER,
  password: process.env.LEGACY_DB_PASS,
  database: process.env.LEGACY_DB_NAME,
  connectTimeout: 15000,
}

console.log(`Conectando a ${cfg.user}@${cfg.host}:${cfg.port}/${cfg.database} …`)

try {
  const con = await mysql.createConnection(cfg)
  const [tablas] = await con.query(
    `SELECT table_name, table_rows FROM information_schema.tables
     WHERE table_schema = ? ORDER BY table_name`,
    [cfg.database],
  )
  console.log(`\n✅ Conexión OK. ${tablas.length} tablas:\n`)
  for (const t of tablas) {
    const nombre = t.TABLE_NAME || t.table_name
    console.log(`  ${nombre}  (~${t.TABLE_ROWS ?? t.table_rows ?? '?'} filas)`)
  }
  await con.end()
} catch (e) {
  console.error(`\n❌ Error: ${e.code || ''} ${e.message}`)
  process.exit(1)
}
