-- Tabla para registrar cambios de contraseña (límite 1 por semana)
CREATE TABLE IF NOT EXISTS cambios_contraseña (
    cambio_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    perfil_id UUID NOT NULL REFERENCES perfiles(perfil_id) ON DELETE CASCADE,
    fecha_cambio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para consultas rápidas
CREATE INDEX idx_cambios_password_perfil ON cambios_contraseña(perfil_id);
CREATE INDEX idx_cambios_password_fecha ON cambios_contraseña(fecha_cambio);

-- RLS para la tabla
ALTER TABLE cambios_contraseña ENABLE ROW LEVEL SECURITY;

-- Solo el usuario puede ver sus propios cambios
CREATE POLICY "usuarios pueden ver sus propios cambios de contraseña"
    ON cambios_contraseña
    FOR SELECT
    USING (auth.uid() = perfil_id);

-- Solo el usuario puede insertar sus propios cambios
CREATE POLICY "usuarios pueden registrar sus cambios de contraseña"
    ON cambios_contraseña
    FOR INSERT
    WITH CHECK (auth.uid() = perfil_id);

