-- Soporte para migrar historias clínicas del legado.
alter table public.historias alter column profesional_id drop not null;
alter table public.historias add column if not exists profesional_legado text;
alter table public.historias add column if not exists datos_legado jsonb;
alter table public.historias add column if not exists ref_legado integer;
create unique index if not exists historias_tipo_ref_legado_ux
  on public.historias (tipo_historia_id, ref_legado) where ref_legado is not null;
drop policy if exists "historias escritura admin" on public.historias;
create policy "historias escritura admin" on public.historias for all to authenticated using (public.es_admin()) with check (public.es_admin());
