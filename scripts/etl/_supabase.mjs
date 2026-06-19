// Cliente Supabase autenticado como admin para la ETL.
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

export async function clienteAdmin() {
  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { error } = await sb.auth.signInWithPassword({
    email: process.env.ETL_ADMIN_EMAIL,
    password: process.env.ETL_ADMIN_PASSWORD,
  })
  if (error) throw new Error(`Login admin falló: ${error.message}`)
  return sb
}
