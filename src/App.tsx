import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProveedorAuth } from '@/lib/auth'
import { RutaProtegida } from '@/componentes/RutaProtegida'
import { Layout } from '@/componentes/Layout'
import Login from '@/paginas/Login'
import RecuperarContrasena from '@/paginas/RecuperarContrasena'
import CambiarContrasena from '@/paginas/CambiarContrasena'
import Inicio from '@/paginas/Inicio'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProveedorAuth>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
            <Route path="/cambiar-contrasena" element={<CambiarContrasena />} />

            <Route element={<RutaProtegida />}>
              <Route element={<Layout />}>
                <Route index element={<Inicio />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </ProveedorAuth>
    </QueryClientProvider>
  )
}
