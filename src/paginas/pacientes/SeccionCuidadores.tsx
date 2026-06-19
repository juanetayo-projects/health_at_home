import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { HeartHandshake, Plus, Trash2, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Cuidador {
  id: string
  nombre: string
  parentesco: string | null
  telefono: string | null
  estado_civil: string | null
}

export function SeccionCuidadores({ pacienteId }: { pacienteId: string }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ nombre: '', parentesco: '', telefono: '', estado_civil: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['cuidadores', pacienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('paciente_cuidadores')
        .select('id, nombre, parentesco, telefono, estado_civil')
        .eq('paciente_id', pacienteId)
        .order('created_at')
      if (error) throw error
      return (data ?? []) as Cuidador[]
    },
  })

  const agregar = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('paciente_cuidadores').insert({ paciente_id: pacienteId, ...form })
      if (error) throw error
    },
    onSuccess: () => {
      setForm({ nombre: '', parentesco: '', telefono: '', estado_civil: '' })
      qc.invalidateQueries({ queryKey: ['cuidadores', pacienteId] })
    },
  })

  const eliminar = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('paciente_cuidadores').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cuidadores', pacienteId] }),
  })

  const input = 'rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-200'

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2 text-lg font-semibold text-marca-800">
        <HeartHandshake className="h-5 w-5" /> Cuidadores
      </h2>

      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
      ) : data && data.length > 0 ? (
        <table className="mb-4 w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-1 pr-2">Nombre</th>
              <th className="py-1 pr-2">Parentesco</th>
              <th className="py-1 pr-2">Teléfono</th>
              <th className="py-1 pr-2">Estado civil</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((c) => (
              <tr key={c.id}>
                <td className="py-2 pr-2 font-medium">{c.nombre}</td>
                <td className="py-2 pr-2">{c.parentesco ?? '—'}</td>
                <td className="py-2 pr-2">{c.telefono ?? '—'}</td>
                <td className="py-2 pr-2">{c.estado_civil ?? '—'}</td>
                <td className="py-2 text-right">
                  <button
                    type="button"
                    onClick={() => eliminar.mutate(c.id)}
                    className="text-slate-400 hover:text-red-600"
                    aria-label="Eliminar cuidador"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="mb-4 text-sm text-slate-500">Sin cuidadores registrados.</p>
      )}

      <div className="flex flex-wrap items-end gap-2">
        <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre" className={`${input} flex-1`} />
        <input value={form.parentesco} onChange={(e) => setForm({ ...form, parentesco: e.target.value })} placeholder="Parentesco" className={`${input} w-36`} />
        <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="Teléfono" className={`${input} w-36`} />
        <input value={form.estado_civil} onChange={(e) => setForm({ ...form, estado_civil: e.target.value })} placeholder="Estado civil" className={`${input} w-36`} />
        <button
          type="button"
          disabled={!form.nombre.trim() || agregar.isPending}
          onClick={() => agregar.mutate()}
          className="flex items-center gap-1 rounded-lg bg-marca-600 px-3 py-2 text-sm font-medium text-white hover:bg-marca-700 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Agregar
        </button>
      </div>
      {agregar.isError && <p className="mt-2 text-sm text-red-600">{(agregar.error as Error).message}</p>}
    </section>
  )
}
