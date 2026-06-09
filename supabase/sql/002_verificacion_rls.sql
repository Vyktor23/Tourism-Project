-- Verificación de RLS en tablas public (solo lectura)
-- (solo lectura; no modifica datos)

-- Perfiles y roles
select id, email, role, created_at
from public.profiles
order by created_at;

-- Políticas activas en tablas public
select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- ¿RLS activado?
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relname in (
    'departamentos', 'provincias', 'municipios', 'destinos', 'eventos',
    'platos', 'informacion_practica',
    'municipio_platos', 'profiles'
  )
order by c.relname;

-- Probar escritura con JWT autenticado según políticas RLS activas en el proyecto.
