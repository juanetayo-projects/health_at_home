import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Save, Loader2, AlertTriangle, Building2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { CampoTexto, CampoSelect, CampoCheck, Seccion } from '@/componentes/campos'

const UNIDADES = ['ADT', 'VIH', 'Salud Mental', 'Consulta Especializada']

type Valores = Record<string, string | boolean | null>

export default function FichaEntidad() {
  const { id } = useParams()
  const esNueva = !id
  const navegar = useNavigate()
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState } = useForm<Valores>({
    defaultValues: { activo: true },
  })

  const { data: entidad, isLoading, isError } = useQuery({
    queryKey: ['entidad', id],
    enabled: !esNueva,
    queryFn: async () => {
      const { data, error } = await supabase.from('entidades').select('*').eq('id', id).single()
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
      const { data, error } = await supabase.from('entidades').insert(payload).select('id').single()
      if (error) return setErrorGuardar(error.message)
      navegar(`/entidades/${data.id}`, { replace: true })
    } else {
      const { error } = await supabase.from('entidades').update(payload).eq('id', id)
      if (error) return setErrorGuardar(error.message)
      navegar('/entidades')
    }
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
    <form onSubmit={handleSubmit(alGuardar)} className="mx-auto max-w-4xl space-y-5 pb-24">
      <div className="flex items-center justify-between">
        <Link to="/entidades" className="inline-flex items-center gap-1 text-sm text-marca-600 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Entidades
        </Link>
        <h1 className="flex items-center gap-2 text-xl font-semibold text-marca-800">
          <Building2 className="h-5 w-5" /> {esNueva ? 'Nueva entidad' : 'Editar entidad'}
        </h1>
      </div>

      <Seccion titulo="Datos de la entidad">
        <CampoTexto etiqueta="Código" requerido registro={register('codigo', { required: true })} />
        <CampoTexto etiqueta="NIT" requerido registro={register('nit', { required: true })} />
        <CampoSelect etiqueta="Unidad" opciones={UNIDADES} vacio="—" registro={register('unidad')} />
        <div className="sm:col-span-2 lg:col-span-3">
          <CampoTexto etiqueta="Nombre" requerido registro={register('nombre', { required: true })} />
        </div>
        <CampoTexto etiqueta="Ciudad" registro={register('ciudad')} />
        <CampoTexto etiqueta="Teléfono" registro={register('telefono')} />
        <CampoTexto etiqueta="Correo electrónico" type="email" registro={register('email')} />
        <div className="sm:col-span-2 lg:col-span-3">
          <CampoTexto etiqueta="Dirección" registro={register('direccion')} />
        </div>
        <CampoCheck etiqueta="Activa" registro={register('activo')} />
      </Seccion>

      {errorGuardar && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {errorGuardar}
        </p>
      )}

      <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-4xl justify-end gap-3">
          <Link to="/entidades" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={formState.isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-marca-600 px-5 py-2 text-sm font-medium text-white hover:bg-marca-700 disabled:opacity-60"
          >
            {formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar
          </button>
        </div>
      </div>
    </form>
  )
}
