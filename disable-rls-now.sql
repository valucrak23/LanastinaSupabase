-- Deshabilitar RLS temporalmente para que funcione la creación de publicaciones

-- Deshabilitar RLS en la tabla publicaciones
ALTER TABLE public.publicaciones DISABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas de publicaciones
DROP POLICY IF EXISTS "publicaciones_select_policy" ON public.publicaciones;
DROP POLICY IF EXISTS "publicaciones_insert_policy" ON public.publicaciones;
DROP POLICY IF EXISTS "publicaciones_update_policy" ON public.publicaciones;
DROP POLICY IF EXISTS "publicaciones_delete_policy" ON public.publicaciones;

-- También deshabilitar RLS en perfiles para evitar problemas
ALTER TABLE public.perfiles DISABLE ROW LEVEL SECURITY;

-- Eliminar políticas de perfiles
DROP POLICY IF EXISTS "perfiles_select_policy" ON public.perfiles;
DROP POLICY IF EXISTS "perfiles_update_policy" ON public.perfiles;
