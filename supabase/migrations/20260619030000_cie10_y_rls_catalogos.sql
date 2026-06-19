-- Catálogo CIE-10 (no existía en el esquema nuevo) + políticas de escritura
-- (es_admin) para los catálogos destino de la ETL de migración.

create table if not exists public.cie10 (
  id uuid primary key default gen_random_uuid(),
  codigo varchar(10) not null unique,
  descripcion text not null,
  abreviado varchar(20),
  activo boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.cie10 enable row level security;
drop policy if exists "cie10 select" on public.cie10;
create policy "cie10 select" on public.cie10 for select to authenticated using (true);
drop policy if exists "cie10 escritura admin" on public.cie10;
create policy "cie10 escritura admin" on public.cie10 for all to authenticated using (public.es_admin()) with check (public.es_admin());

drop policy if exists "articulos escritura admin" on public.articulos;
create policy "articulos escritura admin" on public.articulos for all to authenticated using (public.es_admin()) with check (public.es_admin());
drop policy if exists "servicios escritura admin" on public.servicios_catalogo;
create policy "servicios escritura admin" on public.servicios_catalogo for all to authenticated using (public.es_admin()) with check (public.es_admin());
drop policy if exists "tablas_param escritura admin" on public.tablas_param;
create policy "tablas_param escritura admin" on public.tablas_param for all to authenticated using (public.es_admin()) with check (public.es_admin());
