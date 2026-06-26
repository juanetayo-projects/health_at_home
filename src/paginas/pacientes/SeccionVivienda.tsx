import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Home, Save, Loader2, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Vivienda {
  tipo_vivienda: string
  estrato: string
  pisos: string
  habitaciones: string
  banos: string
  cocina: string
  servicios_publicos: string
  observaciones: string
}

const VACIA: Vivienda = {
  tipo_vivienda: '', estrato: '', pisos: '', habitaciones: '', banos: '', cocina: '', servicios_publicos: '', observaciones: '',
}

export function SeccionVivienda({ pacienteId }: { pacienteId: string }) {
  const qc = useQueryClient()
  const [form, setForm] = useState<Vivienda>(VACIA)

  const { data, isLoading } = useQuery({
    queryKey: ['vivienda', pacienteId],
    queryFn: async () => {
      const { data, error } = await supabase.from('paciente_vivienda').select('*').eq('paciente_id', pacienteId).maybeSingle()
      if (error) throw error
      return data
    },
  })

  useEffect(() => {
    if (data) {
      setForm({
        tipo_vivienda: data.tipo_vivienda ?? '',
        estrato: data.estrato?.toString() ?? '',
        pisos: data.pisos?.toString() ?? '',
        habitaciones: data.habitaciones?.toString() ?? '',
        banos: data.banos?.toString() ?? '',
        cocina: data.cocina ?? '',
        servicios_publicos: (data.servicios_publicos ?? []).join(', '),
        observaciones: data.observaciones ?? '',
      })
    }
  }, [data])

  const guardar = useMutation({
    mutationFn: async () => {
      const payload = {
        paciente_id: pacienteId,
        tipo_vivienda: form.tipo_vivienda || null,
        estrato: form.estrato ? Number(form.estrato) : null,
        pisos: form.pisos ? Number(form.pisos) : null,
        habitaciones: form.habitaciones ? Number(form.habitaciones) : null,
        banos: form.banos ? Number(form.banos) : null,
        cocina: form.cocina || null,
        servicios_publicos: form.servicios_publicos
          ? form.servicios_publicos.split(',').map((s) => s.trim()).filter(Boolean)
          : null,
        observaciones: form.observaciones || null,
      }
      const { error } = await supabase.from('paciente_vivienda').upsert(payload, { onConflict: 'paciente_id' })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vivienda', pacienteId] }),
  })

  const input = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-200'
  const set = (k: keyof Vivienda) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value })

  if (isLoading) return <Loader2 className="h-5 w-5 animate-spin text-slate-400" />

  return (
    <section className="overflow-hidden rounded-xl border-2 border-marca-300 bg-white shadow-lg">
      <h2 className="flex items-center gap-2 bg-marca-600 px-5 py-3 text-lg font-semibold text-white">
        <Home className="h-5 w-5" /> Vivienda
      </h2>
      <div className="p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block"><span className="mb-1 block text-sm font-medium text-slate-700">Tipo de vivienda</span>
          <input className={input} value={form.tipo_vivienda} onChange={set('tipo_vivienda')} placeholder="Casa, Apartamento…" /></label>
        <label className="block"><span className="mb-1 block text-sm font-medium text-slate-700">Estrato</span>
          <input type="number" min={1} max={6} className={input} value={form.estrato} onChange={set('estrato')} /></label>
        <label className="block"><span className="mb-1 block text-sm font-medium text-slate-700">Cocina</span>
          <input className={input} value={form.cocina} onChange={set('cocina')} placeholder="Independiente, Compartida…" /></label>
        <label className="block"><span className="mb-1 block text-sm font-medium text-slate-700">Pisos</span>
          <input type="number" min={0} className={input} value={form.pisos} onChange={set('pisos')} /></label>
        <label className="block"><span className="mb-1 block text-sm font-medium text-slate-700">Habitaciones</span>
          <input type="number" min={0} className={input} value={form.habitaciones} onChange={set('habitaciones')} /></label>
        <label className="block"><span className="mb-1 block text-sm font-medium text-slate-700">Baños</span>
          <input type="number" min={0} className={input} value={form.banos} onChange={set('banos')} /></label>
        <label className="block sm:col-span-2 lg:col-span-3"><span className="mb-1 block text-sm font-medium text-slate-700">Servicios públicos (separados por coma)</span>
          <input className={input} value={form.servicios_publicos} onChange={set('servicios_publicos')} placeholder="Agua, Energía, Gas, Internet" /></label>
        <label className="block sm:col-span-2 lg:col-span-3"><span className="mb-1 block text-sm font-medium text-slate-700">Observaciones</span>
          <textarea className={input} rows={2} value={form.observaciones} onChange={set('observaciones')} /></label>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          disabled={guardar.isPending}
          onClick={() => guardar.mutate()}
          className="flex items-center gap-2 rounded-lg bg-marca-600 px-4 py-2 text-sm font-medium text-white hover:bg-marca-700 disabled:opacity-60"
        >
          {guardar.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Guardar vivienda
        </button>
        {guardar.isSuccess && <span className="flex items-center gap-1 text-sm text-green-600"><Check className="h-4 w-4" /> Guardado</span>}
        {guardar.isError && <span className="text-sm text-red-600">{(guardar.error as Error).message}</span>}
      </div>
      </div>
    </section>
  )
}
