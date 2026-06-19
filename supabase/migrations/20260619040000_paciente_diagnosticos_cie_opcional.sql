-- El legado guarda diagnósticos en texto libre, a menudo sin código CIE.
alter table public.paciente_diagnosticos alter column codigo_cie10 drop not null;
