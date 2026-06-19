import type { ReactNode } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'

const baseInput =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-200'

interface CampoProps {
  etiqueta: string
  requerido?: boolean
  registro: UseFormRegisterReturn
  type?: string
  placeholder?: string
}

export function CampoTexto({ etiqueta, requerido, registro, type = 'text', placeholder }: CampoProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {etiqueta} {requerido && <span className="text-red-500">*</span>}
      </span>
      <input type={type} placeholder={placeholder} className={baseInput} {...registro} />
    </label>
  )
}

interface SelectProps extends CampoProps {
  opciones: readonly string[] | { valor: string; texto: string }[]
  vacio?: string
}

export function CampoSelect({ etiqueta, requerido, registro, opciones, vacio }: SelectProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {etiqueta} {requerido && <span className="text-red-500">*</span>}
      </span>
      <select className={baseInput} {...registro}>
        {vacio !== undefined && <option value="">{vacio}</option>}
        {opciones.map((o) =>
          typeof o === 'string' ? (
            <option key={o} value={o}>
              {o}
            </option>
          ) : (
            <option key={o.valor} value={o.valor}>
              {o.texto}
            </option>
          ),
        )}
      </select>
    </label>
  )
}

export function CampoCheck({ etiqueta, registro }: { etiqueta: string; registro: UseFormRegisterReturn }) {
  return (
    <label className="flex items-center gap-2 py-2 text-sm font-medium text-slate-700">
      <input type="checkbox" className="h-4 w-4 rounded border-slate-300" {...registro} />
      {etiqueta}
    </label>
  )
}

export function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 border-b border-slate-100 pb-2 text-lg font-semibold text-marca-800">{titulo}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  )
}
