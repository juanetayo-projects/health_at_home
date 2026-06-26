import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  abierto: boolean
  alCerrar: () => void
  titulo: string
  children: ReactNode
  ancho?: 'max-w-2xl' | 'max-w-4xl' | 'max-w-6xl'
}

export function Modal({ abierto, alCerrar, titulo, children, ancho = 'max-w-4xl' }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (abierto && !el.open) el.showModal()
    if (!abierto && el.open) el.close()
  }, [abierto])

  return (
    <dialog
      ref={ref}
      onClose={alCerrar}
      className={`w-full ${ancho} rounded-2xl border-2 border-marca-300 bg-white p-0 shadow-2xl backdrop:bg-black/50`}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-marca-600 px-6 py-3">
        <h2 className="text-lg font-semibold text-white">{titulo}</h2>
        <button
          onClick={alCerrar}
          className="rounded-lg p-1 text-white/70 transition hover:bg-marca-700 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="max-h-[80vh] overflow-y-auto p-6">
        {children}
      </div>
    </dialog>
  )
}
