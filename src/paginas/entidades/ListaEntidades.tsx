import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { Building2, Search, Plus, Loader2, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Entidad } from '@/lib/tipos'

const POR_PAGINA = 15

export default function ListaEntidades() {
  const [pagina, setPagina] = useState(0)
  const [busqueda, setBusqueda] = useState('')
  const [texto, setTexto] = useState('')

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['entidades', pagina, busqueda],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const desde = pagina * POR_PAGINA
      let q = supabase
        .from('entidades')
        .select('id, codigo, nit, nombre, unidad, ciudad, activo', { count: 'exact' })
        .order('nombre', { ascending: true })
        .range(desde, desde + POR_PAGINA - 1)
      if (busqueda) {
        q = q.or(`nombre.ilike.%${busqueda}%,codigo.ilike.%${busqueda}%,nit.ilike.%${busqueda}%`)
      }
      const { data, error, count } = await q
      if (error) throw error
      return { filas: (data ?? []) as Entidad[], total: count ?? 0 }
    },
  })

  const total = data?.total ?? 0
  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA))

  function buscar(e: React.FormEvent) {
    e.preventDefault()
    setPagina(0)
    setBusqueda(texto.trim())
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-marca-800">
          <Building2 className="h-6 w-6" /> Entidades (EPS)
        </h1>
        <Link
          to="/entidades/nueva"
          className="flex items-center gap-1 rounded-lg bg-marca-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-marca-700"
        >
          <Plus className="h-4 w-4" /> Crear entidad
        </Link>
      </div>

      <form onSubmit={buscar} className="mb-4 flex gap-2">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Buscar por nombre, código o NIT…"
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
            <Loader2 className="h-6 w-6 animate-spin" /> Cargando entidades…
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2 p-12 text-red-600">
            <AlertTriangle className="h-6 w-6" /> Error al cargar: {(error as Error).message}
          </div>
        ) : data && data.filas.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Building2 className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            {busqueda ? 'No hay entidades que coincidan con la búsqueda.' : 'Aún no hay entidades registradas.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-marca-50 text-left text-marca-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Código</th>
                  <th className="px-4 py-3 font-semibold">Nombre</th>
                  <th className="px-4 py-3 font-semibold">NIT</th>
                  <th className="px-4 py-3 font-semibold">Unidad</th>
                  <th className="px-4 py-3 font-semibold">Ciudad</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.filas.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs">{e.codigo}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{e.nombre}</td>
                    <td className="px-4 py-3 font-mono text-xs">{e.nit}</td>
                    <td className="px-4 py-3">{e.unidad ?? '—'}</td>
                    <td className="px-4 py-3">{e.ciudad ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${e.activo ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                        {e.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/entidades/${e.id}`} className="text-marca-600 hover:underline">
                        Editar
                      </Link>
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
            {total.toLocaleString('es-CO')} entidad{total === 1 ? '' : 'es'}
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
    </div>
  )
}
