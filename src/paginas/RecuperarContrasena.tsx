import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Mail, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Marca } from '@/componentes/Marca'

export default function RecuperarContrasena() {
  const [correo, setCorreo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function alEnviar(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setEnviando(true)
    // El correo de restablecimiento lo entrega Supabase Auth (SMTP: Resend, dominio cacsantabarbara.co).
    const { error } = await supabase.auth.resetPasswordForEmail(correo.trim(), {
      redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}#/cambiar-contrasena`,
    })
    setEnviando(false)
    if (error) {
      setError(error.message)
      return
    }
    setEnviado(true)
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-gradient-to-br from-marca-700 to-marca-900 p-4">
      <div className="w-full max-w-md rounded-2xl border-2 border-marca-300 bg-white p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <Marca className="h-14" />
          <h1 className="mt-4 text-lg font-semibold text-marca-800">Recuperar contraseña</h1>
        </div>

        {enviado ? (
          <p className="rounded-lg bg-green-50 px-3 py-3 text-sm text-green-700">
            Si el correo existe, enviamos un enlace para restablecer la contraseña. Revisa tu bandeja de entrada y la
            carpeta de spam.
          </p>
        ) : (
          <form onSubmit={alEnviar} className="space-y-4">
            <p className="text-sm text-slate-600">
              Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
            </p>
            <div>
              <label htmlFor="correo" className="mb-1 block text-sm font-medium text-slate-700">
                Correo electrónico
              </label>
              <input
                id="correo"
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-200"
                placeholder="usuario@cacsantabarbara.co"
              />
            </div>
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
              {enviando ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mail className="h-5 w-5" />}
              Enviar enlace
            </button>
          </form>
        )}

        <div className="mt-4 text-center text-sm">
          <Link to="/login" className="inline-flex items-center gap-1 text-marca-600 hover:underline">
            <ArrowLeft className="h-4 w-4" /> Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
