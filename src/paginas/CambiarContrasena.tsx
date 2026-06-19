import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, KeyRound } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { Marca } from '@/componentes/Marca'

const MIN = 8

/** Cambio de contraseña — usado para el cambio forzado en el primer ingreso y para el restablecimiento. */
export default function CambiarContrasena() {
  const { refrescarPerfil, session } = useAuth()
  const navegar = useNavigate()
  const [nueva, setNueva] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  function validar(): string | null {
    if (nueva.length < MIN) return `La contraseña debe tener al menos ${MIN} caracteres.`
    if (!/[A-Za-z]/.test(nueva) || !/[0-9]/.test(nueva)) return 'Debe incluir letras y números.'
    if (nueva !== confirmar) return 'Las contraseñas no coinciden.'
    return null
  }

  async function alEnviar(e: FormEvent) {
    e.preventDefault()
    const v = validar()
    if (v) {
      setError(v)
      return
    }
    setError(null)
    setEnviando(true)
    const { error: errClave } = await supabase.auth.updateUser({ password: nueva })
    if (errClave) {
      setEnviando(false)
      setError(errClave.message)
      return
    }
    // Baja la bandera de cambio forzado en el perfil.
    if (session) {
      await supabase.from('perfiles').update({ debe_cambiar_contrasena: false }).eq('id', session.user.id)
      await refrescarPerfil()
    }
    setEnviando(false)
    navegar('/', { replace: true })
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-gradient-to-br from-marca-700 to-marca-900 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <Marca className="h-14" />
          <h1 className="mt-4 text-lg font-semibold text-marca-800">Establecer nueva contraseña</h1>
          <p className="text-sm text-slate-500">Por seguridad, define una contraseña personal.</p>
        </div>

        <form onSubmit={alEnviar} className="space-y-4">
          <div>
            <label htmlFor="nueva" className="mb-1 block text-sm font-medium text-slate-700">
              Nueva contraseña
            </label>
            <input
              id="nueva"
              type="password"
              autoComplete="new-password"
              required
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-200"
            />
          </div>
          <div>
            <label htmlFor="confirmar" className="mb-1 block text-sm font-medium text-slate-700">
              Confirmar contraseña
            </label>
            <input
              id="confirmar"
              type="password"
              autoComplete="new-password"
              required
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-200"
            />
          </div>
          <p className="text-xs text-slate-500">Mínimo {MIN} caracteres, con letras y números.</p>
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={enviando}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-marca-600 px-4 py-2.5 font-medium text-white transition hover:bg-marca-700 disabled:opacity-60"
          >
            {enviando ? <Loader2 className="h-5 w-5 animate-spin" /> : <KeyRound className="h-5 w-5" />}
            Guardar contraseña
          </button>
        </form>
      </div>
    </div>
  )
}
