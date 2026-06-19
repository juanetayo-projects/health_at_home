// Prueba combinaciones plausibles de (usuario, contraseña) contra la BD legada,
// SIN especificar base de datos (aísla la autenticación 1045). Pocos intentos.
import 'dotenv/config'
import mysql from 'mysql2/promise'

const host = process.env.LEGACY_DB_HOST
const port = Number(process.env.LEGACY_DB_PORT || 3306)

// Pares (usuario, contraseña) en orden de probabilidad. El par ya fallido se omite.
const combos = [
  ['cacsb_root_adtw', 'Miami2013$'],
  ['cacsb_adtw', 'cacsb_root_adtw'],
  ['cacsb_root_adtw', 'cacsb_root_adtw'],
]

for (const [user, password] of combos) {
  process.stdout.write(`Probando ${user} … `)
  try {
    const con = await mysql.createConnection({ host, port, user, password, connectTimeout: 15000 })
    const [dbs] = await con.query('SHOW DATABASES')
    console.log('✅ OK')
    console.log('Bases visibles:', dbs.map((d) => Object.values(d)[0]).join(', '))
    await con.end()
    process.exit(0)
  } catch (e) {
    console.log(`❌ ${e.code || ''}`)
  }
  await new Promise((r) => setTimeout(r, 2000))
}
console.log('\nNinguna combinación funcionó.')
process.exit(1)
