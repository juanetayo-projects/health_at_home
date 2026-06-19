# Health at Home · Clínica Santa Bárbara

Aplicación de **gestión clínica domiciliaria** (modernización del sistema legado SI²T/ADTWEB).
Stack: **React + Vite + TypeScript + Tailwind v4 + Supabase + Resend**, desplegada en **GitHub Pages**.

> La documentación interna (especificación maestra e ingeniería inversa del sistema legado) se mantiene **fuera del repositorio público** por contener análisis de seguridad sensible.

## Parámetros del proyecto
- **Empresa:** Clínica Santa Bárbara (CAC) · azul de marca `#1F5BA8`
- **Zona horaria:** America/Bogotá (UTC-5) — se almacena en UTC, se presenta en hora de Bogotá
- **Codificación:** UTF-8 · **Idioma:** es-CO (código y datos en español)
- **Seguridad:** Supabase Auth (sin contraseñas en claro), RLS por sede/rol, auditoría de accesos

## Desarrollo local
```bash
npm install
cp .env.example .env.local   # completar con tus credenciales de Supabase
npm run dev                  # http://localhost:5173
```

## Scripts
- `npm run dev` — servidor de desarrollo
- `npm run build` — compila TypeScript y genera el build de producción (base `/health_at_home/`)
- `npm run preview` — sirve el build
- `npm run typecheck` — verificación de tipos

## Estructura
```
src/
  componentes/   Layout, Marca, RutaProtegida, SelectorSede
  config/        marca.ts (branding)
  lib/           supabase.ts, auth.tsx, tiempo.ts (zona Bogotá)
  paginas/       Login, RecuperarContrasena, CambiarContrasena, Inicio
supabase/        migraciones (esquema, RLS, auditoría)
images/          logos originales (fuente)
public/images/   logos servidos por la app
```

## Despliegue
Automático a GitHub Pages vía GitHub Actions al hacer push a `main`.
Configurar en el repositorio (Settings → Secrets and variables → Actions):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Fases
- **Fase 0 (actual):** cimientos + seguridad (Auth, RBAC, RLS, auditoría, layout, login/recuperación, cambiar sede).
- Fases siguientes: Pacientes, Historia clínica, Programación/Facturación, Agenda/Documentos, Migración + interoperabilidad (RIPS/FEV/HCE).
