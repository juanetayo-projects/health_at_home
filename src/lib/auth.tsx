import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

export interface Perfil {
  id: string
  nombres: string | null
  apellidos: string | null
  cedula: string | null
  especialidad: string | null
  registro_medico: string | null
  sede_activa_id: string | null
  activo: boolean
  /** Opcional: solo si el esquema lo incluye. */
  debe_cambiar_contrasena?: boolean
}

interface EstadoAuth {
  cargando: boolean
  session: Session | null
  perfil: Perfil | null
  /** El usuario debe cambiar su contraseña antes de operar (clave inicial/temporal). */
  debeCambiarContrasena: boolean
  iniciarSesion: (correo: string, contrasena: string) => Promise<{ error: string | null }>
  cerrarSesion: () => Promise<void>
  refrescarPerfil: () => Promise<void>
}

const AuthContext = createContext<EstadoAuth | undefined>(undefined)

async function cargarPerfil(userId: string): Promise<Perfil | null> {
  const { data, error } = await supabase
    .from('perfiles')
    .select('id, nombres, apellidos, cedula, especialidad, registro_medico, sede_activa_id, activo')
    .eq('id', userId)
    .maybeSingle()
  if (error) {
    console.error('No se pudo cargar el perfil:', error.message)
    return null
  }
  return data as Perfil | null
}

export function ProveedorAuth({ children }: { children: ReactNode }) {
  const [cargando, setCargando] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [perfil, setPerfil] = useState<Perfil | null>(null)

  useEffect(() => {
    let activo = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!activo) return
      setSession(data.session)
      if (data.session) setPerfil(await cargarPerfil(data.session.user.id))
      setCargando(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange(async (_evento, nuevaSesion) => {
      setSession(nuevaSesion)
      setPerfil(nuevaSesion ? await cargarPerfil(nuevaSesion.user.id) : null)
    })

    return () => {
      activo = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const iniciarSesion: EstadoAuth['iniciarSesion'] = async (correo, contrasena) => {
    const { error } = await supabase.auth.signInWithPassword({ email: correo, password: contrasena })
    if (error) return { error: traducirError(error.message) }
    return { error: null }
  }

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
  }

  const refrescarPerfil = async () => {
    if (session) setPerfil(await cargarPerfil(session.user.id))
  }

  const valor: EstadoAuth = {
    cargando,
    session,
    perfil,
    debeCambiarContrasena: Boolean(perfil?.debe_cambiar_contrasena),
    iniciarSesion,
    cerrarSesion,
    refrescarPerfil,
  }

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth(): EstadoAuth {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <ProveedorAuth>')
  return ctx
}

function traducirError(mensaje: string): string {
  if (/invalid login credentials/i.test(mensaje)) return 'Usuario o contraseña incorrectos.'
  if (/email not confirmed/i.test(mensaje)) return 'El correo aún no ha sido confirmado.'
  return mensaje
}
