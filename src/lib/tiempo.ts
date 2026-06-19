// Utilidades de fecha/hora — zona horaria oficial: America/Bogota (GMT-5, sin horario de verano).
// Regla del proyecto: almacenar en UTC y presentar/capturar en hora de Bogotá.

import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz'
import { es } from 'date-fns/locale'

export const ZONA_BOGOTA = 'America/Bogota'

/** Formatea una fecha (UTC o Date) en hora de Bogotá, con locale español. patrón por defecto: dd/MM/yyyy HH:mm */
export function formatearBogota(fecha: Date | string | number, patron = 'dd/MM/yyyy HH:mm'): string {
  return formatInTimeZone(new Date(fecha), ZONA_BOGOTA, patron, { locale: es })
}

/** Solo fecha en Bogotá: dd/MM/yyyy */
export function fechaBogota(fecha: Date | string | number): string {
  return formatInTimeZone(new Date(fecha), ZONA_BOGOTA, 'dd/MM/yyyy')
}

/** Convierte un Date a su equivalente "visual" en Bogotá (para inputs/calendarios). */
export function aHoraBogota(fecha: Date | string | number): Date {
  return toZonedTime(new Date(fecha), ZONA_BOGOTA)
}

/** Convierte una hora local de Bogotá (p. ej. capturada en un input) a UTC para almacenar. */
export function bogotaAUtc(fechaLocal: Date | string): Date {
  return fromZonedTime(fechaLocal, ZONA_BOGOTA)
}

/** Periodo contable actual (mes/año) en hora de Bogotá. */
export function periodoActual(): { mes: number; anio: number } {
  const ahora = aHoraBogota(new Date())
  return { mes: ahora.getMonth() + 1, anio: ahora.getFullYear() }
}

/** Edad en años y meses a partir de una fecha de nacimiento (yyyy-MM-dd). */
export function calcularEdad(fechaNacimiento: string | null): string {
  if (!fechaNacimiento) return '—'
  const nac = new Date(fechaNacimiento + 'T00:00:00')
  const hoy = aHoraBogota(new Date())
  let anios = hoy.getFullYear() - nac.getFullYear()
  let meses = hoy.getMonth() - nac.getMonth()
  if (hoy.getDate() < nac.getDate()) meses -= 1
  if (meses < 0) {
    anios -= 1
    meses += 12
  }
  return `${anios} años ${meses} meses`
}
