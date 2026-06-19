-- ============================================================================
-- Semilla inicial — Health at Home · Clínica Santa Bárbara
-- Sedes, roles y permisos base. Idempotente.
-- ============================================================================

-- ------------------------------------------------------------------ Sedes
insert into public.sedes (codigo, nombre, ciudad) values
  ('ADTCALI', 'ADT Cali', 'Cali'),
  ('ADTPALMIRA', 'ADT Palmira', 'Palmira'),
  ('ADTTULUA', 'ADT Tuluá', 'Tuluá'),
  ('ADTPOPAYAN', 'ADT Popayán', 'Popayán'),
  ('ADTBUENAVENTURA', 'ADT Buenaventura', 'Buenaventura')
on conflict (codigo) do nothing;

-- ------------------------------------------------------------------ Roles
insert into public.roles (nombre, descripcion) values
  ('Administrador', 'Configuración total, usuarios/roles, maestros, todas las sedes'),
  ('Coordinador de sede', 'Gestión operativa de su(s) sede(s)'),
  ('Médico', 'Apertura, evolución, control y epicrisis de pacientes asignados'),
  ('Terapeuta', 'Historias de terapia (física/ocupacional/respiratoria/fonoaudiología)'),
  ('Enfermería', 'Notas de enfermería y valoración'),
  ('Nutricionista', 'Historias de nutrición'),
  ('Gerontólogo', 'Historias de gerontología'),
  ('Psicólogo', 'Historias de psicología'),
  ('Trabajo Social', 'Test/Trabajo social'),
  ('Admisiones', 'Pacientes, programación de servicios y autorizaciones'),
  ('Facturación', 'Reportes, cuentas de cobro, soportes a facturación'),
  ('Nómina', 'Reportes de profesionales y alimentación a nómina'),
  ('Auditor', 'Solo lectura: visor de historias y bitácora de auditoría')
on conflict (nombre) do nothing;

-- ------------------------------------------------------------------ Permisos base (modulo, accion)
insert into public.permisos (modulo, accion, descripcion) values
  ('pacientes', 'ver', 'Consultar pacientes'),
  ('pacientes', 'crear', 'Crear pacientes'),
  ('pacientes', 'editar', 'Editar pacientes'),
  ('historias', 'ver', 'Ver historias clínicas'),
  ('historias', 'crear', 'Crear historias clínicas'),
  ('historias', 'editar', 'Editar historias clínicas'),
  ('programacion', 'ver', 'Ver programación de servicios'),
  ('programacion', 'crear', 'Crear programación de servicios'),
  ('facturacion', 'ver', 'Ver reportes de facturación'),
  ('facturacion', 'exportar', 'Exportar soportes y cuentas de cobro'),
  ('agenda', 'ver', 'Ver agenda de citas'),
  ('agenda', 'crear', 'Crear/editar citas'),
  ('maestros', 'ver', 'Ver maestros y catálogos'),
  ('maestros', 'editar', 'Editar maestros y catálogos'),
  ('usuarios', 'ver', 'Ver usuarios'),
  ('usuarios', 'editar', 'Gestionar usuarios y roles'),
  ('auditoria', 'ver', 'Ver bitácora de auditoría')
on conflict (modulo, accion) do nothing;

-- El rol Administrador recibe todos los permisos
insert into public.rol_permisos (rol_id, permiso_id)
select r.id, p.id
from public.roles r cross join public.permisos p
where r.nombre = 'Administrador'
on conflict do nothing;
