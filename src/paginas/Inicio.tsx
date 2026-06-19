import { Users, Stethoscope, CalendarDays, FileText } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { formatearBogota } from '@/lib/tiempo'

const accesos = [
  { titulo: 'Pacientes', icono: Users, desc: 'Gestión de pacientes y fichas clínicas' },
  { titulo: 'Historia clínica', icono: Stethoscope, desc: 'Apertura, evolución y disciplinas' },
  { titulo: 'Agenda de citas', icono: CalendarDays, desc: 'Programación por profesional' },
  { titulo: 'Programación de servicios', icono: FileText, desc: 'CUPS, autorizaciones y facturación' },
]

export default function Inicio() {
  const { perfil, session } = useAuth()
  const nombre = perfil?.nombres ?? session?.user.email

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-marca-800">Bienvenido(a){nombre ? `, ${nombre}` : ''}</h1>
        <p className="text-sm text-slate-500">{formatearBogota(new Date(), "EEEE d 'de' MMMM yyyy, HH:mm")} (Bogotá)</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {accesos.map(({ titulo, icono: Icono, desc }) => (
          <div
            key={titulo}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <Icono className="mb-3 h-8 w-8 text-marca-600" />
            <h2 className="font-semibold text-slate-800">{titulo}</h2>
            <p className="mt-1 text-sm text-slate-500">{desc}</p>
          </div>
        ))}
      </div>

      <p className="mt-8 rounded-lg bg-marca-50 px-4 py-3 text-sm text-marca-800">
        Fase 0 — Cimientos y seguridad. Los módulos se habilitarán en las siguientes fases del proyecto.
      </p>
    </div>
  )
}
