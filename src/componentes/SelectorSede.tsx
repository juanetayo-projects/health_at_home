import { useEffect, useState } from 'react'
import { Building2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Sede {
  id: string
  nombre: string
}

const CLAVE_SEDE = 'has_sede_actual'

/** Selector multi-sede (equivalente a "Cambiar Sede" del sistema legado). */
export function SelectorSede() {
  const [sedes, setSedes] = useState<Sede[]>([])
  const [sedeActual, setSedeActual] = useState<string>(() => localStorage.getItem(CLAVE_SEDE) ?? '')

  useEffect(() => {
    // Carga las sedes a las que el usuario tiene acceso (RLS filtra por usuario_sedes).
    supabase
      .from('sedes')
      .select('id, nombre')
      .eq('activo', true)
      .order('nombre')
      .then(({ data }) => {
        if (data) setSedes(data as Sede[])
      })
  }, [])

  function cambiar(id: string) {
    setSedeActual(id)
    localStorage.setItem(CLAVE_SEDE, id)
    // En fases siguientes esto disparará la recarga de datos del periodo/sede.
    window.dispatchEvent(new CustomEvent('sede-cambiada', { detail: id }))
  }

  return (
    <label className="flex items-center gap-2 text-sm text-white/90">
      <Building2 className="h-4 w-4" />
      <select
        value={sedeActual}
        onChange={(e) => cambiar(e.target.value)}
        className="rounded-md border border-white/30 bg-marca-700 px-2 py-1 text-white outline-none focus:border-white"
      >
        {sedes.length === 0 && <option value="">— Sin sedes —</option>}
        {sedes.map((s) => (
          <option key={s.id} value={s.id}>
            {s.nombre}
          </option>
        ))}
      </select>
    </label>
  )
}
