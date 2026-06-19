import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProveedorAuth } from '@/lib/auth'
import { RutaProtegida } from '@/componentes/RutaProtegida'
import { Layout } from '@/componentes/Layout'
import Login from '@/paginas/Login'
import RecuperarContrasena from '@/paginas/RecuperarContrasena'
import CambiarContrasena from '@/paginas/CambiarContrasena'
import Inicio from '@/paginas/Inicio'
import ListaPacientes from '@/paginas/pacientes/ListaPacientes'
import EnConstruccion from '@/paginas/EnConstruccion'

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
                <Route path="pacientes" element={<ListaPacientes />} />
                <Route path="pacientes/nuevo" element={<EnConstruccion titulo="Nuevo paciente" />} />
                <Route path="pacientes/:id" element={<EnConstruccion titulo="Ficha del paciente" />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </ProveedorAuth>
    </QueryClientProvider>
  )
}
