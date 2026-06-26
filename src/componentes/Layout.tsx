import { NavLink, Outlet } from 'react-router-dom'
import { Home, Users, Building2, Stethoscope, CalendarDays, FileText, LogOut, UserCircle2, Menu } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { Marca } from './Marca'
import { SelectorSede } from './SelectorSede'
import { MARCA } from '@/config/marca'

const navItems = [
  { to: '/', icon: Home, label: 'Inicio', end: true },
  { to: '/pacientes', icon: Users, label: 'Pacientes' },
  { to: '/entidades', icon: Building2, label: 'Entidades (EPS)' },
  { to: '/historia-clinica', icon: Stethoscope, label: 'Historia clínica', disabled: true },
  { to: '/agenda', icon: CalendarDays, label: 'Agenda de citas', disabled: true },
  { to: '/programacion', icon: FileText, label: 'Programación de servicios', disabled: true },
]

export function Layout() {
  const { perfil, session, cerrarSesion } = useAuth()
  const [sidebarAbierto, setSidebarAbierto] = useState(false)
  const nombre = perfil
    ? `${perfil.nombres ?? ''} ${perfil.apellidos ?? ''}`.trim() || session?.user.email
    : session?.user.email

  return (
    <div className="flex min-h-full">
      {/* Overlay móvil */}
      {sidebarAbierto && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarAbierto(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-marca-700 text-white transition-transform lg:static lg:translate-x-0 ${
          sidebarAbierto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col items-center gap-1 px-4 py-4">
          <NavLink to="/" onClick={() => setSidebarAbierto(false)}>
            <Marca variante="blanco" className="h-10" />
          </NavLink>
          <NavLink to="/" onClick={() => setSidebarAbierto(false)} className="text-center hover:text-white/80">
            <p className="truncate text-sm font-semibold leading-tight">{MARCA.aplicacion}</p>
            <p className="truncate text-[11px] text-white/60 leading-tight">{MARCA.empresa}</p>
          </NavLink>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {navItems.map(({ to, icon: Icon, label, end, disabled }) =>
            disabled ? (
              <span
                key={to}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/40 cursor-default"
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {label}
                <span className="ml-auto rounded bg-white/10 px-1.5 py-0.5 text-[10px]">Próximamente</span>
              </span>
            ) : (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setSidebarAbierto(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                    isActive
                      ? 'bg-white/15 font-semibold text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="border-t border-white/20 px-4 py-3 text-xs text-white/50">
          © {new Date().getFullYear()} {MARCA.empresa}
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex items-center gap-4 border-b border-slate-200 bg-white px-4 py-2 shadow-sm">
          <button
            onClick={() => setSidebarAbierto(true)}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex flex-1 items-center justify-end gap-4">
            <SelectorSede />
            <div className="hidden items-center gap-2 text-sm text-slate-600 md:flex">
              <UserCircle2 className="h-5 w-5" />
              <span>{nombre}</span>
            </div>
            <button
              onClick={cerrarSesion}
              className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" /> Salir
            </button>
          </div>
        </header>

        {/* Página */}
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
