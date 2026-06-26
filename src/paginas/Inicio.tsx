import { Link } from 'react-router-dom'
import { Users, Building2 } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { formatearBogota } from '@/lib/tiempo'

const accesos = [
  { titulo: 'Pacientes', icono: Users, desc: 'Gestión de pacientes y fichas clínicas', ruta: '/pacientes' },
  { titulo: 'Entidades (EPS)', icono: Building2, desc: 'Maestro de entidades y pagadores', ruta: '/entidades' },
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {accesos.map(({ titulo, icono: Icono, desc, ruta }) => (
          <Link
            key={titulo}
            to={ruta}
            className="block rounded-xl border-2 border-marca-300 bg-white p-5 shadow-lg transition hover:border-marca-500 hover:shadow-xl"
          >
            <Icono className="mb-3 h-8 w-8 text-marca-600" />
            <h2 className="font-semibold text-slate-800">{titulo}</h2>
            <p className="mt-1 text-sm text-slate-500">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
