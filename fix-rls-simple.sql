-- Arreglar problemas de RLS (Row Level Security) de forma simple

-- 1. Habilitar RLS en todas las tablas principales
ALTER TABLE public.intereses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_intereses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reportes_publicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reportes_usuarios ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes que puedan estar causando problemas
DROP POLICY IF EXISTS "Intereses son visibles para todos" ON public.intereses;
DROP POLICY IF EXISTS "Perfiles son visibles para todos" ON public.perfiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.perfiles;
DROP POLICY IF EXISTS "Publicaciones son visibles para todos" ON public.publicaciones;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear publicaciones" ON public.publicaciones;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus propias publicaciones" ON public.publicaciones;
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus propias publicaciones" ON public.publicaciones;
DROP POLICY IF EXISTS "Likes son visibles para todos" ON public.likes;
DROP POLICY IF EXISTS "Usuarios autenticados pueden dar like" ON public.likes;
DROP POLICY IF EXISTS "Usuarios pueden quitar sus propios likes" ON public.likes;
DROP POLICY IF EXISTS "Usuario intereses son visibles para el propietario" ON public.usuario_intereses;
DROP POLICY IF EXISTS "Usuarios pueden gestionar sus propios intereses" ON public.usuario_intereses;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear reportes" ON public.reportes_publicaciones;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear reportes de usuarios" ON public.reportes_usuarios;

-- 3. Crear políticas básicas y permisivas para que funcione la aplicación

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

-- Políticas para usuario_intereses
CREATE POLICY "usuario_intereses_select_policy" ON public.usuario_intereses
    FOR SELECT USING (auth.uid() = perfil_id);

CREATE POLICY "usuario_intereses_insert_policy" ON public.usuario_intereses
    FOR INSERT WITH CHECK (auth.uid() = perfil_id);

CREATE POLICY "usuario_intereses_delete_policy" ON public.usuario_intereses
    FOR DELETE USING (auth.uid() = perfil_id);

-- Políticas para reportes
CREATE POLICY "reportes_publicaciones_insert_policy" ON public.reportes_publicaciones
    FOR INSERT WITH CHECK (auth.uid() = perfil_id_reportero);

CREATE POLICY "reportes_usuarios_insert_policy" ON public.reportes_usuarios
    FOR INSERT WITH CHECK (auth.uid() = perfil_id_reportero);
