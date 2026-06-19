import 'dotenv/config'
import mysql from 'mysql2/promise'
const cfg = { host: process.env.LEGACY_DB_HOST, port: Number(process.env.LEGACY_DB_PORT||3306), user: process.env.LEGACY_DB_USER, password: process.env.LEGACY_DB_PASS, database: process.env.LEGACY_DB_NAME, connectTimeout: 15000 }
const con = await mysql.createConnection(cfg)
const [r] = await con.query("SELECT tipo, codigo, descripcion, descripcion1 FROM tablas WHERE descripcion LIKE '%PALMIRA%' OR descripcion LIKE '%TULUA%' OR descripcion LIKE '%POPAYAN%' OR descripcion LIKE '%BUENAVENTURA%' OR descripcion LIKE '%ADT%' ORDER BY tipo, codigo LIMIT 40")
console.log('Posible catálogo de sedes en tablas:')
for (const x of r) console.log(`  tipo=${x.tipo} codigo=${JSON.stringify(x.codigo)} desc=${JSON.stringify(x.descripcion)} / ${JSON.stringify(x.descripcion1)}`)
await con.end()
