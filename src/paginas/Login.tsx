import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { Marca } from '@/componentes/Marca'
import { MARCA } from '@/config/marca'

export default function Login() {
  const { iniciarSesion } = useAuth()
  const navegar = useNavigate()
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function alEnviar(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setEnviando(true)
    const { error } = await iniciarSesion(correo.trim(), contrasena)
    setEnviando(false)
    if (error) {
      setError(error)
      return
    }
    navegar('/', { replace: true })
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-gradient-to-br from-marca-700 to-marca-900 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <Marca className="h-16" />
          <h1 className="mt-4 text-xl font-semibold text-marca-800">{MARCA.aplicacion}</h1>
          <p className="text-sm text-slate-500">{MARCA.descripcion}</p>
        </div>

        <form onSubmit={alEnviar} className="space-y-4">
          <div>
            <label htmlFor="correo" className="mb-1 block text-sm font-medium text-slate-700">
              Correo electrónico
            </label>
            <input
              id="correo"
              type="email"
              autoComplete="username"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-200"
              placeholder="usuario@cacsantabarbara.co"
            />
          </div>

          <div>
            <label htmlFor="contrasena" className="mb-1 block text-sm font-medium text-slate-700">
              Contraseña
            </label>
            <input
              id="contrasena"
              type="password"
              autoComplete="current-password"
              required
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-200"
              placeholder="••••••••"
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
            {enviando ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
            Ingresar
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <Link to="/recuperar-contrasena" className="text-marca-600 hover:underline">
            ¿Olvidó su contraseña?
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          {MARCA.empresa} · {MARCA.subtitulo}
        </p>
      </div>
    </div>
  )
}
