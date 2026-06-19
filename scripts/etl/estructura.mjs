// Muestra las columnas (nombre + tipo) de las tablas indicadas por argv.
// No imprime datos (evita exponer PHI). Para columnas de catálogo no sensibles
// permite ver valores distintos con --distinct tabla columna.
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

const con = await mysql.createConnection(cfg)

if (process.argv[2] === '--distinct') {
  const [tabla, col] = [process.argv[3], process.argv[4]]
  const [rows] = await con.query(`SELECT \`${col}\` AS v, COUNT(*) AS n FROM \`${tabla}\` GROUP BY \`${col}\` ORDER BY n DESC LIMIT 60`)
  console.log(`Valores distintos de ${tabla}.${col}:`)
  for (const r of rows) console.log(`  ${JSON.stringify(r.v)}  (${r.n})`)
} else {
  const tablas = process.argv.slice(2)
  for (const t of tablas) {
    const [cols] = await con.query(
      `SELECT column_name, column_type, is_nullable, column_key
       FROM information_schema.columns WHERE table_schema = ? AND table_name = ? ORDER BY ordinal_position`,
      [cfg.database, t],
    )
    console.log(`\n=== ${t} (${cols.length} columnas) ===`)
    for (const c of cols) {
      const nombre = c.COLUMN_NAME || c.column_name
      const tipo = c.COLUMN_TYPE || c.column_type
      const key = c.COLUMN_KEY || c.column_key
      console.log(`  ${nombre}: ${tipo}${key ? ' [' + key + ']' : ''}`)
    }
  }
}
await con.end()
