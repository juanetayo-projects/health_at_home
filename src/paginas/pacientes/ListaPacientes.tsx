import { useState } from 'react'
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { Users, Search, Plus, Loader2, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { calcularEdad } from '@/lib/tiempo'
import { Modal } from '@/componentes/Modal'
import { FichaPaciente } from './FichaPaciente'
import type { Paciente } from '@/lib/tipos'

const POR_PAGINA = 15

function colorEstado(estado: string): string {
  switch (estado) {
    case 'Activo':
      return 'bg-green-100 text-green-800'
    case 'Alta medica':
    case 'Egresado':
      return 'bg-slate-100 text-slate-700'
    case 'Trasladado':
      return 'bg-amber-100 text-amber-800'
    case 'Rechazado':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

export default function ListaPacientes() {
  const [pagina, setPagina] = useState(0)
  const [busqueda, setBusqueda] = useState('')
  const [texto, setTexto] = useState('')
  const [modalId, setModalId] = useState<string | undefined>()
  const queryClient = useQueryClient()

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['pacientes', pagina, busqueda],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const desde = pagina * POR_PAGINA
      let q = supabase
        .from('pacientes')
        .select(
          'id, tipo_identidad, identidad, apellidos, nombres, sexo, fecha_nacimiento, ciudad_atencion, estado, alto_riesgo, entidades(nombre, codigo)',
          { count: 'exact' },
        )
        .order('apellidos', { ascending: true })
        .range(desde, desde + POR_PAGINA - 1)

      if (busqueda) {
        q = q.or(
          `nombres.ilike.%${busqueda}%,apellidos.ilike.%${busqueda}%,identidad.ilike.%${busqueda}%`,
        )
      }
      const { data, error, count } = await q
      if (error) throw error
      return { filas: (data ?? []) as unknown as Paciente[], total: count ?? 0 }
    },
  })

  const total = data?.total ?? 0
  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA))

  function buscar(e: React.FormEvent) {
    e.preventDefault()
    setPagina(0)
    setBusqueda(texto.trim())
  }

  function cerrarModal() {
    setModalId(undefined)
    queryClient.invalidateQueries({ queryKey: ['pacientes'] })
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-marca-800">
          <Users className="h-6 w-6" /> Pacientes
        </h1>
        <button
          onClick={() => setModalId('')}
          className="flex items-center gap-1 rounded-lg bg-marca-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-marca-700"
        >
          <Plus className="h-4 w-4" /> Crear paciente
        </button>
      </div>

      <form onSubmit={buscar} className="mb-4 flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Buscar por nombre, apellido o identidad…"
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-200"
          />
        </div>
        <button type="submit" className="rounded-lg bg-marca-600 px-4 py-2 text-sm font-medium text-white hover:bg-marca-700">
          Buscar
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border-2 border-marca-300 bg-white shadow-lg">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin" /> Cargando pacientes…
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2 p-12 text-red-600">
            <AlertTriangle className="h-6 w-6" /> Error al cargar: {(error as Error).message}
          </div>
        ) : data && data.filas.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            {busqueda ? 'No hay pacientes que coincidan con la búsqueda.' : 'Aún no hay pacientes registrados.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-marca-50 text-left text-marca-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Identidad</th>
                  <th className="px-4 py-3 font-semibold">Paciente</th>
                  <th className="px-4 py-3 font-semibold">Sexo</th>
                  <th className="px-4 py-3 font-semibold">Edad</th>
                  <th className="px-4 py-3 font-semibold">Ciudad atención</th>
                  <th className="px-4 py-3 font-semibold">Entidad</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.filas.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs">{p.identidad}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {p.apellidos} {p.nombres}
                      {p.alto_riesgo && (
                        <span className="ml-2 rounded bg-red-50 px-1.5 py-0.5 text-xs text-red-600">Alto riesgo</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{p.sexo}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{calcularEdad(p.fecha_nacimiento)}</td>
                    <td className="px-4 py-3">{p.ciudad_atencion ?? '—'}</td>
                    <td className="px-4 py-3">{p.entidades?.nombre ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${colorEstado(p.estado)}`}>
                        {p.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setModalId(p.id)}
                        className="text-marca-600 hover:underline"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {total > 0 && (
        <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
          <span>
            {total.toLocaleString('es-CO')} paciente{total === 1 ? '' : 's'}
            {isFetching && <Loader2 className="ml-2 inline h-3 w-3 animate-spin" />}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagina((p) => Math.max(0, p - 1))}
              disabled={pagina === 0}
              className="flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Anterior
            </button>
            <span>
              Página {pagina + 1} de {totalPaginas}
            </span>
            <button
              onClick={() => setPagina((p) => (p + 1 < totalPaginas ? p + 1 : p))}
              disabled={pagina + 1 >= totalPaginas}
              className="flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 disabled:opacity-40"
            >
              Siguiente <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <Modal abierto={modalId !== undefined} alCerrar={cerrarModal} titulo="Paciente" ancho="max-w-6xl">
        <FichaPaciente pacienteId={modalId} onCerrar={cerrarModal} />
      </Modal>
    </div>
  )
}
