// Localiza en qué tabla vive un código de entidad (ej. EMSSPGPPAL).
import 'dotenv/config'
import mysql from 'mysql2/promise'

const cfg = {
  host: process.env.LEGACY_DB_HOST, port: Number(process.env.LEGACY_DB_PORT || 3306),
  user: process.env.LEGACY_DB_USER, password: process.env.LEGACY_DB_PASS,
  database: process.env.LEGACY_DB_NAME, connectTimeout: 15000,
}
const con = await mysql.createConnection(cfg)

// ¿En tablas?
const [t1] = await con.query("SELECT tipo, codigo, descripcion FROM tablas WHERE codigo LIKE 'EMSS%' OR codigo LIKE 'EMSC%' LIMIT 10")
console.log('tablas con codigo EMSS/EMSC:', t1)

// ¿En nits? (por nombre)
const [t2] = await con.query("SELECT regn, tipo, nit, LEFT(nombre,40) nombre, ciudad FROM nits WHERE nombre LIKE 'EMSSANAR%' LIMIT 5")
console.log('\nnits EMSSANAR:', t2)

// distinct nits.tipo (para identificar el subtipo EPS)
const [t3] = await con.query('SELECT tipo, COUNT(*) n FROM nits GROUP BY tipo ORDER BY n DESC')
console.log('\nnits por tipo:', t3)

// ¿Cuántas secciones (sedes) distintas hay en pacientes?
const [t4] = await con.query('SELECT seccion, COUNT(*) n FROM pacientes GROUP BY seccion ORDER BY seccion')
console.log('\npacientes por seccion (sede):', t4)

// distinct de pacientes.entidad (códigos de entidad realmente usados)
const [t5] = await con.query('SELECT COUNT(DISTINCT entidad) n FROM pacientes')
console.log('\nentidades distintas usadas en pacientes:', t5)

await con.end()
