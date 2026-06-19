# Backend Supabase — Health at Home

> ⚠️ **Importante:** el backend ya existe y es la **fuente de verdad**.
> Proyecto Supabase **`homecare`** (ref `ounomznpqtuqyadhnlgh`, región `us-east-1`).
> URL: `https://ounomznpqtuqyadhnlgh.supabase.co`

El esquema productivo ya está creado en ese proyecto (sedes, perfiles, RBAC, multi-sede,
pacientes, entidades, contratos, catálogos, `tipos_historia`, `historias` + tablas tipadas
por disciplina `h_*`, citas, documentos, `audit_log`), con **RLS habilitado** en todas las
tablas y el usuario administrador `juan.etayo@cacsantabarbara.co` ya provisionado.

## Estado de las migraciones
- `migrations/20260619000000_fase0_cimientos.sql` documenta la **línea base de Fase 0**
  generada por el frontend. **Difiere del esquema actual** del proyecto (que es más completo),
  por lo que **NO debe aplicarse con `supabase db push` sobre el proyecto existente.**
- **Pendiente (recomendado):** regenerar las migraciones versionadas a partir del esquema real
  (`supabase db pull`) para que el repositorio refleje fielmente la base productiva.

## Conexión del frontend
El frontend usa `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (anon/publishable key, pública por
diseño). En CI/CD viven como **GitHub Secrets**; en local, en `.env.local` (no versionado).

## Seguridad — acción inmediata
La contraseña inicial del administrador es temporal y débil. **Debe cambiarse cuanto antes**
y habilitarse MFA para el rol Administrador.
