import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Stethoscope, Plus, Trash2, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Diagnostico {
  id: string
  codigo_cie10: string
  descripcion: string | null
  tipo: string | null
  riesgo_hemodinamico: boolean | null
  riesgo_vital: boolean | null
}

export function SeccionDiagnosticos({ pacienteId }: { pacienteId: string }) {
  const qc = useQueryClient()
  const [codigo, setCodigo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [tipo, setTipo] = useState('Principal')

  const { data, isLoading } = useQuery({
    queryKey: ['diagnosticos', pacienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('paciente_diagnosticos')
        .select('id, codigo_cie10, descripcion, tipo, riesgo_hemodinamico, riesgo_vital')
        .eq('paciente_id', pacienteId)
        .order('created_at')
      if (error) throw error
      return (data ?? []) as Diagnostico[]
    },
  })

  const agregar = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('paciente_diagnosticos')
        .insert({ paciente_id: pacienteId, codigo_cie10: codigo.trim().toUpperCase(), descripcion, tipo })
      if (error) throw error
    },
    onSuccess: () => {
      setCodigo('')
      setDescripcion('')
      qc.invalidateQueries({ queryKey: ['diagnosticos', pacienteId] })
    },
  })

  const eliminar = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('paciente_diagnosticos').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['diagnosticos', pacienteId] }),
  })

  const input = 'rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-200'

  return (
    <section className="overflow-hidden rounded-lg border border-marca-300 bg-white shadow-md">
      <h2 className="flex items-center gap-1.5 bg-marca-600 px-3 py-1.5 text-sm font-semibold text-white">
        <Stethoscope className="h-3.5 w-3.5" /> Diagnósticos (CIE-10)
      </h2>
      <div className="p-3">

      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
      ) : data && data.length > 0 ? (
        <table className="mb-3 w-full text-xs">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-0.5 pr-2">Código</th>
              <th className="py-0.5 pr-2">Descripción</th>
              <th className="py-0.5 pr-2">Tipo</th>
              <th className="py-0.5 pr-2">Riesgos</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((d) => (
              <tr key={d.id}>
                <td className="py-1 pr-2 font-mono text-[11px]">{d.codigo_cie10}</td>
                <td className="py-1 pr-2">{d.descripcion ?? '—'}</td>
                <td className="py-1 pr-2">{d.tipo}</td>
                <td className="py-1 pr-2 text-[11px] text-red-600">
                  {[d.riesgo_vital && 'Vital', d.riesgo_hemodinamico && 'Hemodinámico'].filter(Boolean).join(', ')}
                </td>
                <td className="py-1 text-right">
                  <button
                    type="button"
                    onClick={() => eliminar.mutate(d.id)}
                    className="text-slate-400 hover:text-red-600"
                    aria-label="Eliminar diagnóstico"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="mb-3 text-xs text-slate-500">Sin diagnósticos registrados.</p>
      )}

      <div className="flex flex-wrap items-end gap-1.5">
        <input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="CIE-10" className={`${input} w-24`} />
        <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción" className={`${input} flex-1`} />
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={input}>
          <option>Principal</option>
          <option>Relacionado</option>
        </select>
        <button
          type="button"
          disabled={!codigo.trim() || agregar.isPending}
          onClick={() => agregar.mutate()}
          className="flex items-center gap-1 rounded-lg bg-marca-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-marca-700 disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" /> Agregar
        </button>
      </div>
      {agregar.isError && <p className="mt-1.5 text-xs text-red-600">{(agregar.error as Error).message}</p>}
      </div>
    </section>
  )
}
