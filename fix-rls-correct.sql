-- Arreglar RLS para las tablas que realmente existen

-- 1. Habilitar RLS en las tablas que existen
ALTER TABLE public.intereses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfil_intereses ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes que puedan estar causando problemas
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
DROP POLICY IF EXISTS "perfil_intereses_select_policy" ON public.perfil_intereses;
DROP POLICY IF EXISTS "perfil_intereses_insert_policy" ON public.perfil_intereses;
DROP POLICY IF EXISTS "perfil_intereses_delete_policy" ON public.perfil_intereses;

-- 3. Crear políticas básicas y permisivas

-- Políticas para intereses (solo lectura)
CREATE POLICY "intereses_select_policy" ON public.intereses
    FOR SELECT USING (true);

-- Políticas para perfiles
CREATE POLICY "perfiles_select_policy" ON public.perfiles
    FOR SELECT USING (true);

CREATE POLICY "perfiles_update_policy" ON public.perfiles
    FOR UPDATE USING (auth.uid() = perfil_id);

-- Políticas para publicaciones
CREATE POLICY "publicaciones_select_policy" ON public.publicaciones
    FOR SELECT USING (true);

CREATE POLICY "publicaciones_insert_policy" ON public.publicaciones
    FOR INSERT WITH CHECK (auth.uid() = perfil_id);

CREATE POLICY "publicaciones_update_policy" ON public.publicaciones
    FOR UPDATE USING (auth.uid() = perfil_id);

CREATE POLICY "publicaciones_delete_policy" ON public.publicaciones
    FOR DELETE USING (auth.uid() = perfil_id);

-- Políticas para likes
CREATE POLICY "likes_select_policy" ON public.likes
    FOR SELECT USING (true);

CREATE POLICY "likes_insert_policy" ON public.likes
    FOR INSERT WITH CHECK (auth.uid() = perfil_id);

CREATE POLICY "likes_delete_policy" ON public.likes
    FOR DELETE USING (auth.uid() = perfil_id);

-- Políticas para perfil_intereses
CREATE POLICY "perfil_intereses_select_policy" ON public.perfil_intereses
    FOR SELECT USING (auth.uid() = perfil_id);

CREATE POLICY "perfil_intereses_insert_policy" ON public.perfil_intereses
    FOR INSERT WITH CHECK (auth.uid() = perfil_id);

CREATE POLICY "perfil_intereses_delete_policy" ON public.perfil_intereses
    FOR DELETE USING (auth.uid() = perfil_id);
