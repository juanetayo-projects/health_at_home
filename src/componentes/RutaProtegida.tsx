import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth'

/** Protege rutas: exige sesión y fuerza el cambio de contraseña inicial cuando aplica. */
export function RutaProtegida() {
  const { cargando, session, debeCambiarContrasena } = useAuth()
  const ubicacion = useLocation()

  if (cargando) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-marca-600" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />
  }

  // Cambio de contraseña obligatorio en el primer ingreso (clave temporal).
  if (debeCambiarContrasena && ubicacion.pathname !== '/cambiar-contrasena') {
    return <Navigate to="/cambiar-contrasena" replace />
  }

  return <Outlet />
}
