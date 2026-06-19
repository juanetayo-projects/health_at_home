-- Función helper de RBAC + políticas de escritura para el maestro de Entidades.
-- La escritura del maestro de EPS queda restringida al rol Administrador.

-- Helper: ¿el usuario actual tiene rol Administrador?
create or replace function public.es_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.usuario_roles ur
    join public.roles r on r.id = ur.rol_id
    where ur.usuario_id = auth.uid()
      and r.nombre = 'Administrador'
  );
$$;

-- Escritura de entidades (maestro EPS) restringida a Administrador.
drop policy if exists "Entidades: escritura admin" on public.entidades;
create policy "Entidades: escritura admin" on public.entidades
  for all to authenticated
  using (public.es_admin())
  with check (public.es_admin());
