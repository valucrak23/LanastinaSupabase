-- LANASTINA - ESTRUCTURA DE BASE DE DATOS

-- 1. PERFILES
CREATE TABLE perfiles (
  perfil_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  edad INTEGER,
  descripcion TEXT,
  foto_perfil_url TEXT,
  es_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_perfiles_username ON perfiles(username);
CREATE INDEX idx_perfiles_email ON perfiles(email);

-- 2. INTERESES
CREATE TABLE intereses (
  interes_id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  icono TEXT
);

INSERT INTO intereses (nombre, icono) VALUES
  ('Tejido a dos agujas', '🧶'),
  ('Crochet', '🪡'),
  ('Amigurumi', '🧸'),
  ('Tejido circular', '⭕'),
  ('Macramé', '🪢'),
  ('Punto jacquard', '🎨'),
  ('Tejido para bebés', '👶'),
  ('Ropa tejida', '👗'),
  ('Accesorios', '🧣'),
  ('Decoración del hogar', '🏠');

-- 3. PERFIL-INTERESES
CREATE TABLE perfil_intereses (
  perfil_id UUID REFERENCES perfiles(perfil_id) ON DELETE CASCADE,
  interes_id INTEGER REFERENCES intereses(interes_id) ON DELETE CASCADE,
  PRIMARY KEY (perfil_id, interes_id)
);

ALTER TABLE perfil_intereses ENABLE ROW LEVEL SECURITY;

-- 4. PUBLICACIONES
CREATE TABLE publicaciones (
  publicacion_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id UUID NOT NULL REFERENCES perfiles(perfil_id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  imagen_url TEXT,
  total_likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. LIKES
CREATE TABLE likes (
  like_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publicacion_id UUID NOT NULL REFERENCES publicaciones(publicacion_id) ON DELETE CASCADE,
  perfil_id UUID NOT NULL REFERENCES perfiles(perfil_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(publicacion_id, perfil_id)
);

-- FUNCIONES
CREATE OR REPLACE FUNCTION obtener_iniciales(perfil_id UUID)
RETURNS TEXT AS $$
DECLARE
  iniciales TEXT;
BEGIN
  SELECT UPPER(LEFT(nombre, 1) || LEFT(apellido, 1))
  INTO iniciales
  FROM perfiles
  WHERE perfiles.perfil_id = $1;
  
  RETURN COALESCE(iniciales, '??');
END;
$$ LANGUAGE plpgsql;

-- TRIGGERS PARA CONTADORES
CREATE OR REPLACE FUNCTION actualizar_contador_likes() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE publicaciones SET total_likes = total_likes + 1 WHERE publicacion_id = NEW.publicacion_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE publicaciones SET total_likes = total_likes - 1 WHERE publicacion_id = OLD.publicacion_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_likes_contador
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_contador_likes();

-- VISTAS
CREATE OR REPLACE VIEW vista_publicaciones AS
SELECT 
  p.publicacion_id, p.titulo, p.descripcion, p.imagen_url, p.total_likes, p.created_at,
  p.perfil_id, perf.nombre, perf.apellido, perf.username, perf.foto_perfil_url
FROM publicaciones p
JOIN perfiles perf ON p.perfil_id = perf.perfil_id
ORDER BY p.created_at DESC;

-- RLS POLICIES
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE publicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- PERFILES
CREATE POLICY "Todos pueden ver perfiles públicos (excepto admins)" 
  ON perfiles FOR SELECT 
  USING (es_admin = false OR auth.uid() = perfil_id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" 
  ON perfiles FOR UPDATE 
  USING (auth.uid() = perfil_id);

CREATE POLICY "Los usuarios pueden insertar su propio perfil" 
  ON perfiles FOR INSERT 
  WITH CHECK (auth.uid() = perfil_id);

-- PERFIL_INTERESES
CREATE POLICY "Todos pueden ver los intereses de perfiles" 
  ON perfil_intereses FOR SELECT 
  USING (true);

CREATE POLICY "Los usuarios pueden gestionar sus propios intereses" 
  ON perfil_intereses FOR ALL 
  USING (auth.uid() = perfil_id);

-- PUBLICACIONES
CREATE POLICY "Todos pueden ver las publicaciones" 
  ON publicaciones FOR SELECT 
  USING (true);

CREATE POLICY "Los usuarios autenticados pueden crear publicaciones" 
  ON publicaciones FOR INSERT 
  WITH CHECK (auth.uid() = perfil_id);

CREATE POLICY "Los usuarios pueden actualizar sus propias publicaciones" 
  ON publicaciones FOR UPDATE 
  USING (auth.uid() = perfil_id);

CREATE POLICY "Los usuarios pueden eliminar sus propias publicaciones" 
  ON publicaciones FOR DELETE 
  USING (auth.uid() = perfil_id);

-- LIKES
CREATE POLICY "Todos pueden ver los likes" 
  ON likes FOR SELECT 
  USING (true);

CREATE POLICY "Los usuarios autenticados pueden dar like" 
  ON likes FOR INSERT 
  WITH CHECK (auth.uid() = perfil_id);

CREATE POLICY "Los usuarios pueden quitar su propio like" 
  ON likes FOR DELETE 
  USING (auth.uid() = perfil_id);
