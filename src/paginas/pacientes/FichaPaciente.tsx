import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { Save, Loader2, AlertTriangle, UserPlus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { CampoTexto, CampoSelect, CampoCheck, Seccion } from '@/componentes/campos'
import { ESTADOS_PACIENTE } from '@/lib/tipos'
import { SeccionDiagnosticos } from './SeccionDiagnosticos'
import { SeccionCuidadores } from './SeccionCuidadores'
import { SeccionVivienda } from './SeccionVivienda'

const TIPOS_ID = ['CC', 'TI', 'CE', 'RC', 'PA', 'MS', 'NU', 'AS']
const SEXOS = [
  { valor: 'M', texto: 'Masculino' },
  { valor: 'F', texto: 'Femenino' },
]
const RH = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const ESTADO_CIVIL = ['Soltero(a)', 'Casado(a)', 'Unión libre', 'Separado(a)', 'Divorciado(a)', 'Viudo(a)']
const TIPO_USUARIO = ['Subsidiado', 'Contributivo', 'Vinculado', 'Particular']
const TIPO_PACIENTE = ['Agudo', 'Crónico', 'Paliativo']
const PERIODO_VISITAS = ['Diaria', 'Semanal', 'Quincenal', 'Mensual']

const NULLABLES = ['fecha_nacimiento', 'fecha_ingreso', 'fecha_estado', 'entidad_id']

type Valores = Record<string, string | boolean | null>

interface FichaPacienteProps {
  pacienteId?: string
  onCerrar?: () => void
}

export function FichaPaciente({ pacienteId, onCerrar }: FichaPacienteProps) {
  const esNuevo = !pacienteId
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState } = useForm<Valores>({
    defaultValues: { tipo_identidad: 'CC', sexo: 'F', estado: 'Activo', tipo_usuario: 'Subsidiado', aceptado: false, alto_riesgo: false },
  })

  const { data: entidades } = useQuery({
    queryKey: ['entidades-activas'],
    queryFn: async () => {
      const { data } = await supabase.from('entidades').select('id, nombre').eq('activo', true).order('nombre')
      return (data ?? []) as { id: string; nombre: string }[]
    },
  })

  const { data: sedes } = useQuery({
    queryKey: ['sedes-activas'],
    queryFn: async () => {
      const { data } = await supabase.from('sedes').select('id, nombre').eq('activo', true).order('nombre')
      return (data ?? []) as { id: string; nombre: string }[]
    },
  })

  const { data: paciente, isLoading: cargandoPaciente, isError } = useQuery({
    queryKey: ['paciente', pacienteId],
    enabled: !esNuevo,
    queryFn: async () => {
      const { data, error } = await supabase.from('pacientes').select('*').eq('id', pacienteId).single()
      if (error) throw error
      return data as Valores
    },
  })

  useEffect(() => {
    if (paciente) {
      const limpio: Valores = {}
      for (const [k, v] of Object.entries(paciente)) limpio[k] = v === null ? '' : (v as string | boolean)
      reset(limpio)
    }
  }, [paciente, reset])

  async function alGuardar(valores: Valores) {
    setErrorGuardar(null)
    const payload: Record<string, unknown> = { ...valores }
    for (const campo of NULLABLES) if (!payload[campo]) payload[campo] = null
    delete payload.id
    delete payload.created_at
    delete payload.updated_at

    if (esNuevo) {
      const { error } = await supabase.from('pacientes').insert(payload).select('id').single()
      if (error) return setErrorGuardar(error.message)
    } else {
      const { error } = await supabase.from('pacientes').update(payload).eq('id', pacienteId)
      if (error) return setErrorGuardar(error.message)
    }
    onCerrar?.()
  }

  if (!esNuevo && cargandoPaciente) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }
  if (!esNuevo && isError) {
    return (
      <div className="flex items-center gap-2 p-12 text-red-600">
        <AlertTriangle className="h-6 w-6" /> No se pudo cargar el paciente.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(alGuardar)} className="space-y-3">
      <h2 className="flex items-center gap-2 text-base font-semibold text-marca-800">
        <UserPlus className="h-4 w-4" /> {esNuevo ? 'Nuevo paciente' : 'Editar paciente'}
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Seccion titulo="Identificación">
          <CampoSelect etiqueta="Tipo ID" requerido opciones={TIPOS_ID} registro={register('tipo_identidad', { required: true })} />
          <CampoTexto etiqueta="Identidad" requerido registro={register('identidad', { required: true })} />
          <CampoTexto etiqueta="Apellidos" requerido registro={register('apellidos', { required: true })} />
          <CampoTexto etiqueta="Nombres" requerido registro={register('nombres', { required: true })} />
        </Seccion>

        <Seccion titulo="Datos personales">
          <CampoSelect etiqueta="Sexo" requerido opciones={SEXOS} registro={register('sexo', { required: true })} />
          <CampoSelect etiqueta="RH" opciones={RH} vacio="—" registro={register('rh')} />
          <CampoSelect etiqueta="Estado civil" opciones={ESTADO_CIVIL} vacio="—" registro={register('estado_civil')} />
          <CampoTexto etiqueta="F. nacimiento" requerido type="date" registro={register('fecha_nacimiento', { required: true })} />
          <CampoTexto etiqueta="Religión" registro={register('religion')} />
          <CampoTexto etiqueta="Nivel educativo" registro={register('nivel_educativo')} />
          <CampoTexto etiqueta="Etnia" registro={register('etnia')} />
        </Seccion>

        <Seccion titulo="Contacto">
          <CampoTexto etiqueta="Teléfono móvil" registro={register('telefono_movil')} />
          <CampoTexto etiqueta="Teléfono fijo" registro={register('telefono_fijo')} />
          <CampoTexto etiqueta="Correo" type="email" registro={register('email')} />
          <CampoTexto etiqueta="Dirección" registro={register('direccion')} />
          <CampoTexto etiqueta="Barrio" registro={register('barrio')} />
          <CampoTexto etiqueta="Comuna" registro={register('comuna')} />
          <CampoTexto etiqueta="Ciudad atención" registro={register('ciudad_atencion')} />
          <CampoTexto etiqueta="Ciudad visita" registro={register('ciudad_visita')} />
          <CampoTexto etiqueta="Tipo inmueble" registro={register('tipo_inmueble')} />
        </Seccion>

        <Seccion titulo="Responsable">
          <CampoTexto etiqueta="Nombre" registro={register('responsable_nombre')} />
          <CampoTexto etiqueta="Teléfono" registro={register('responsable_telefono')} />
          <CampoTexto etiqueta="Médico tratante" registro={register('medico_tratante')} />
        </Seccion>

        <Seccion titulo="Atención y afiliación">
          <CampoSelect etiqueta="Tipo paciente" opciones={TIPO_PACIENTE} vacio="—" registro={register('tipo_paciente')} />
          <CampoSelect etiqueta="Periodo visitas" opciones={PERIODO_VISITAS} vacio="—" registro={register('periodo_visitas')} />
          <CampoTexto etiqueta="F. ingreso" type="date" registro={register('fecha_ingreso')} />
          <CampoSelect etiqueta="Tipo usuario" opciones={TIPO_USUARIO} registro={register('tipo_usuario')} />
          <CampoSelect
            etiqueta="Entidad (EPS)"
            opciones={(entidades ?? []).map((e) => ({ valor: e.id, texto: e.nombre }))}
            vacio="— Sin asignar —"
            registro={register('entidad_id')}
          />
          <CampoSelect etiqueta="Sede" requerido opciones={(sedes ?? []).map((s) => ({ valor: s.id, texto: s.nombre }))} vacio="— Seleccione —" registro={register('sede_id', { required: true })} />
          <CampoSelect etiqueta="Estado" requerido opciones={ESTADOS_PACIENTE} registro={register('estado', { required: true })} />
          <CampoTexto etiqueta="F. estado" type="date" registro={register('fecha_estado')} />
          <div className="flex flex-col justify-center gap-0.5">
            <CampoCheck etiqueta="Aceptado" registro={register('aceptado')} />
            <CampoCheck etiqueta="Alto riesgo" registro={register('alto_riesgo')} />
          </div>
        </Seccion>
      </div>

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

      {!esNuevo && pacienteId && (
        <div className="space-y-3 border-t border-slate-200 pt-3">
          <SeccionDiagnosticos pacienteId={pacienteId} />
          <SeccionCuidadores pacienteId={pacienteId} />
          <SeccionVivienda pacienteId={pacienteId} />
        </div>
      )}
    </form>
  )
}
