-- Distingue el origen de cada historia (tabla legada) para separar
-- apertura/evolución de terapias dentro del mismo tipo y dar idempotencia por tabla.
alter table public.historias add column if not exists tabla_legado text;
drop index if exists public.historias_tipo_ref_legado_ux;
create unique index if not exists historias_tabla_ref_legado_ux
  on public.historias (tabla_legado, ref_legado) where tabla_legado is not null;
