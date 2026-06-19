import 'dotenv/config'
import mysql from 'mysql2/promise'
const cfg = { host: process.env.LEGACY_DB_HOST, port: Number(process.env.LEGACY_DB_PORT||3306), user: process.env.LEGACY_DB_USER, password: process.env.LEGACY_DB_PASS, database: process.env.LEGACY_DB_NAME, connectTimeout: 15000 }
const con = await mysql.createConnection(cfg)
const [r] = await con.query('SELECT sede, sedes, COUNT(*) n FROM usuarios GROUP BY sede, sedes ORDER BY sede')
console.log('usuarios: sede(num) -> sedes(nombre):')
for (const x of r) console.log(`  ${x.sede}: ${JSON.stringify(x.sedes)} (${x.n} usuarios)`)
await con.end()
