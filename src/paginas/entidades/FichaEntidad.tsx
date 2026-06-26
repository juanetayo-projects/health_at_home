import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { Save, Loader2, AlertTriangle, Building2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { CampoTexto, CampoSelect, CampoCheck, Seccion } from '@/componentes/campos'

const UNIDADES = ['ADT', 'VIH', 'Salud Mental', 'Consulta Especializada']

type Valores = Record<string, string | boolean | null>

interface FichaEntidadProps {
  entidadId?: string
  onCerrar?: () => void
}

export function FichaEntidad({ entidadId, onCerrar }: FichaEntidadProps) {
  const esNueva = !entidadId
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState } = useForm<Valores>({
    defaultValues: { activo: true },
  })

  const { data: entidad, isLoading, isError } = useQuery({
    queryKey: ['entidad', entidadId],
    enabled: !esNueva,
    queryFn: async () => {
      const { data, error } = await supabase.from('entidades').select('*').eq('id', entidadId).single()
      if (error) throw error
      return data as Valores
    },
  })

  useEffect(() => {
    if (entidad) {
      const limpio: Valores = {}
      for (const [k, v] of Object.entries(entidad)) limpio[k] = v === null ? '' : (v as string | boolean)
      reset(limpio)
    }
  }, [entidad, reset])

  async function alGuardar(valores: Valores) {
    setErrorGuardar(null)
    const payload: Record<string, unknown> = { ...valores }
    delete payload.id
    delete payload.created_at
    delete payload.updated_at

    if (esNueva) {
      const { error } = await supabase.from('entidades').insert(payload).select('id').single()
      if (error) return setErrorGuardar(error.message)
    } else {
      const { error } = await supabase.from('entidades').update(payload).eq('id', entidadId)
      if (error) return setErrorGuardar(error.message)
    }
    onCerrar?.()
  }

  if (!esNueva && isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }
  if (!esNueva && isError) {
    return (
      <div className="flex items-center gap-2 p-12 text-red-600">
        <AlertTriangle className="h-6 w-6" /> No se pudo cargar la entidad.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(alGuardar)} className="space-y-3">
      <h2 className="flex items-center gap-2 text-base font-semibold text-marca-800">
        <Building2 className="h-4 w-4" /> {esNueva ? 'Nueva entidad' : 'Editar entidad'}
      </h2>

      <Seccion titulo="Datos de la entidad">
        <CampoTexto etiqueta="Código" requerido registro={register('codigo', { required: true })} />
        <CampoTexto etiqueta="NIT" requerido registro={register('nit', { required: true })} />
        <CampoSelect etiqueta="Unidad" opciones={UNIDADES} vacio="—" registro={register('unidad')} />
        <CampoTexto etiqueta="Nombre" requerido registro={register('nombre', { required: true })} />
        <CampoTexto etiqueta="Ciudad" registro={register('ciudad')} />
        <CampoTexto etiqueta="Teléfono" registro={register('telefono')} />
        <CampoTexto etiqueta="Correo" type="email" registro={register('email')} />
        <CampoTexto etiqueta="Dirección" registro={register('direccion')} />
        <CampoCheck etiqueta="Activa" registro={register('activo')} />
      </Seccion>

      {errorGuardar && (
        <p className="rounded-lg bg-red-50 px-2 py-1.5 text-xs text-red-700" role="alert">
          {errorGuardar}
        </p>
      )}

      <div className="flex justify-end gap-2 border-t border-slate-200 pt-3">
        {onCerrar && (
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={formState.isSubmitting}
          className="flex items-center gap-1.5 rounded-lg bg-marca-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-marca-700 disabled:opacity-60"
        >
          {formState.isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Guardar
        </button>
      </div>
    </form>
  )
}
