import { Link } from 'react-router-dom'
import { Construction, ArrowLeft } from 'lucide-react'

export default function EnConstruccion({ titulo = 'En construcción' }: { titulo?: string }) {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <Construction className="mx-auto mb-4 h-12 w-12 text-marca-400" />
      <h1 className="text-xl font-semibold text-marca-800">{titulo}</h1>
      <p className="mt-2 text-sm text-slate-500">
        Este módulo se habilitará en el siguiente incremento del proyecto.
      </p>
      <Link to="/" className="mt-6 inline-flex items-center gap-1 text-marca-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Volver al inicio
      </Link>
    </div>
  )
}
