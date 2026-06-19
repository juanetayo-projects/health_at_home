import { createClient } from '@supabase/supabase-js'

// El frontend usa ÚNICAMENTE la anon key. La seguridad real la dan Supabase Auth + RLS.
// Nunca exponer la service_role key en el cliente.
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const hayConfigSupabase = Boolean(url && anonKey)

if (!hayConfigSupabase) {
  // Aviso temprano en desarrollo si falta configuración (.env.local).
  // Se usan valores de marcador para que la app renderice; las llamadas de red fallarán
  // hasta que se configuren las variables (en producción vienen de GitHub Secrets).
  console.warn(
    '[Health at Home] Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. Copia .env.example a .env.local y complétalas.',
  )
}

// createClient exige una URL válida; usamos un marcador local si falta configuración.
const urlEfectiva = url || 'http://localhost:54321'
const anonEfectiva = anonKey || 'anon-placeholder'

export const supabase = createClient(urlEfectiva, anonEfectiva, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
