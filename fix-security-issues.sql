-- Arreglar problemas de seguridad en Supabase

-- 1. Habilitar RLS (Row Level Security) en la tabla intereses
ALTER TABLE public.intereses ENABLE ROW LEVEL SECURITY;

-- 2. Crear políticas RLS para intereses (solo lectura pública)
CREATE POLICY "Intereses son visibles para todos" ON public.intereses
    FOR SELECT USING (true);

-- 3. Arreglar funciones con search_path mutable
-- Función: obtener_inicial
CREATE OR REPLACE FUNCTION public.obtener_inicial(nombre_completo TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN UPPER(LEFT(nombre_completo, 1));
END;
$$;

-- Función: obtener_foto_perfil
CREATE OR REPLACE FUNCTION public.obtener_foto_perfil(perfil_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN (SELECT foto_perfil_url FROM perfiles WHERE perfiles.perfil_id = obtener_foto_perfil.perfil_id);
END;
$$;

-- Función: handle_updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Función: actualizar_updated_at
CREATE OR REPLACE FUNCTION public.actualizar_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Función: actualizar_contador_likes
CREATE OR REPLACE FUNCTION public.actualizar_contador_likes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE publicaciones 
        SET total_likes = total_likes + 1 
        WHERE publicacion_id = NEW.publicacion_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE publicaciones 
        SET total_likes = total_likes - 1 
        WHERE publicacion_id = OLD.publicacion_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- 4. Arreglar vista con SECURITY DEFINER
-- Si existe vista_publicaciones, recrearla sin SECURITY DEFINER
DROP VIEW IF EXISTS public.vista_publicaciones;

CREATE VIEW public.vista_publicaciones AS
SELECT 
    p.publicacion_id,
    p.titulo,
    p.descripcion,
    p.imagen_url,
    p.perfil_id,
    p.created_at,
    pr.nombre,
    pr.apellido,
    pr.username,
    pr.foto_perfil_url,
    COUNT(l.like_id) as total_likes
FROM publicaciones p
LEFT JOIN perfiles pr ON p.perfil_id = pr.perfil_id
LEFT JOIN likes l ON p.publicacion_id = l.publicacion_id
GROUP BY p.publicacion_id, pr.perfil_id;

-- 5. Habilitar protección contra contraseñas filtradas
-- Esto se debe hacer desde el dashboard de Supabase en Authentication > Settings
-- Buscar "Leaked password protection" y habilitarlo

-- 6. Verificar que RLS esté habilitado en todas las tablas principales
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_intereses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reportes_publicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reportes_usuarios ENABLE ROW LEVEL SECURITY;

-- 7. Crear políticas básicas de RLS
-- Políticas para perfiles
CREATE POLICY "Perfiles son visibles para todos" ON public.perfiles
    FOR SELECT USING (true);

CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON public.perfiles
    FOR UPDATE USING (auth.uid() = perfil_id);

-- Políticas para publicaciones
CREATE POLICY "Publicaciones son visibles para todos" ON public.publicaciones
    FOR SELECT USING (true);

CREATE POLICY "Usuarios autenticados pueden crear publicaciones" ON public.publicaciones
    FOR INSERT WITH CHECK (auth.uid() = perfil_id);

CREATE POLICY "Usuarios pueden actualizar sus propias publicaciones" ON public.publicaciones
    FOR UPDATE USING (auth.uid() = perfil_id);

CREATE POLICY "Usuarios pueden eliminar sus propias publicaciones" ON public.publicaciones
    FOR DELETE USING (auth.uid() = perfil_id);

-- Políticas para likes
CREATE POLICY "Likes son visibles para todos" ON public.likes
    FOR SELECT USING (true);

CREATE POLICY "Usuarios autenticados pueden dar like" ON public.likes
    FOR INSERT WITH CHECK (auth.uid() = perfil_id);

CREATE POLICY "Usuarios pueden quitar sus propios likes" ON public.likes
    FOR DELETE USING (auth.uid() = perfil_id);

-- Políticas para usuario_intereses
CREATE POLICY "Usuario intereses son visibles para el propietario" ON public.usuario_intereses
    FOR SELECT USING (auth.uid() = perfil_id);

CREATE POLICY "Usuarios pueden gestionar sus propios intereses" ON public.usuario_intereses
    FOR ALL USING (auth.uid() = perfil_id);

-- Políticas para reportes
CREATE POLICY "Usuarios autenticados pueden crear reportes" ON public.reportes_publicaciones
    FOR INSERT WITH CHECK (auth.uid() = perfil_id_reportero);

CREATE POLICY "Usuarios autenticados pueden crear reportes de usuarios" ON public.reportes_usuarios
    FOR INSERT WITH CHECK (auth.uid() = perfil_id_reportero);
