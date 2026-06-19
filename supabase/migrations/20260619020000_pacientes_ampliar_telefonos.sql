-- Los teléfonos del legado guardan varios números en un solo campo.
-- Se amplían los campos de teléfono para no truncar datos en la migración.
alter table public.pacientes
  alter column telefono_fijo type varchar(60),
  alter column telefono_movil type varchar(60),
  alter column responsable_telefono type varchar(60);
