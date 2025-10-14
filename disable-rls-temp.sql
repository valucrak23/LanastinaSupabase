-- Deshabilitar RLS temporalmente para que funcione la aplicación

-- Deshabilitar RLS en todas las tablas principales
ALTER TABLE public.intereses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.publicaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes DISABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "intereses_select_policy" ON public.intereses;
DROP POLICY IF EXISTS "perfiles_select_policy" ON public.perfiles;
DROP POLICY IF EXISTS "perfiles_update_policy" ON public.perfiles;
DROP POLICY IF EXISTS "publicaciones_select_policy" ON public.publicaciones;
DROP POLICY IF EXISTS "publicaciones_insert_policy" ON public.publicaciones;
DROP POLICY IF EXISTS "publicaciones_update_policy" ON public.publicaciones;
DROP POLICY IF EXISTS "publicaciones_delete_policy" ON public.publicaciones;
DROP POLICY IF EXISTS "likes_select_policy" ON public.likes;
DROP POLICY IF EXISTS "likes_insert_policy" ON public.likes;
DROP POLICY IF EXISTS "likes_delete_policy" ON public.likes;
