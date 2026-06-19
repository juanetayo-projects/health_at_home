// Tipos del dominio (reflejan el esquema real del backend Supabase `homecare`).

export interface Paciente {
  id: string
  tipo_identidad: string
  identidad: string
  apellidos: string
  nombres: string
  sexo: string
  fecha_nacimiento: string | null
  ciudad_atencion: string | null
  ciudad_visita: string | null
  tipo_usuario: string | null
  estado: string
  alto_riesgo: boolean
  entidad_id: string | null
  sede_id: string
  created_at: string
  entidades?: { nombre: string; codigo: string } | null
  sedes?: { nombre: string } | null
}

export interface Entidad {
  id: string
  codigo: string
  nit: string
  nombre: string
  unidad: string | null
  direccion?: string | null
  ciudad?: string | null
  telefono?: string | null
  email?: string | null
  activo: boolean
}

export const ESTADOS_PACIENTE = [
  'Activo',
  'Alta medica',
  'Trasladado',
  'Rechazado',
  'Egresado',
] as const
