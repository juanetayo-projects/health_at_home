import { Outlet } from 'react-router-dom'
import { LogOut, UserCircle2 } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { Marca } from './Marca'
import { SelectorSede } from './SelectorSede'
import { MARCA } from '@/config/marca'

export function Layout() {
  const { perfil, session, cerrarSesion } = useAuth()
  const nombre = perfil
    ? `${perfil.nombres ?? ''} ${perfil.apellidos ?? ''}`.trim() || session?.user.email
    : session?.user.email

  return (
    <div className="flex min-h-full flex-col">
      <header className="bg-marca-700 text-white shadow">
        <div className="flex items-center justify-between gap-4 px-4 py-2">
          <div className="flex items-center gap-3">
            <Marca variante="blanco" className="h-9" />
            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-tight">{MARCA.aplicacion}</p>
              <p className="text-xs text-white/70 leading-tight">{MARCA.empresa}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <SelectorSede />
            <div className="hidden items-center gap-2 text-sm md:flex">
              <UserCircle2 className="h-5 w-5" />
              <span>{nombre}</span>
            </div>
            <button
              onClick={cerrarSesion}
              className="flex items-center gap-1 rounded-md bg-marca-800 px-3 py-1.5 text-sm transition hover:bg-marca-900"
            >
              <LogOut className="h-4 w-4" /> Salir
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-2 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} {MARCA.empresa} · {MARCA.aplicacion}
      </footer>
    </div>
  )
}
