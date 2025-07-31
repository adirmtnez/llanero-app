-- Tabla para guardar configuraciones de la aplicación
CREATE TABLE IF NOT EXISTS app_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_app_settings_updated_at 
    BEFORE UPDATE ON app_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar configuración inicial de Supabase (vacía)
INSERT INTO app_settings (key, value, description) 
VALUES (
  'supabase_config',
  '{"url": "", "anonKey": "", "serviceKey": ""}',
  'Configuración de conexión a Supabase'
) ON CONFLICT (key) DO NOTHING;

-- Habilitar RLS (Row Level Security)
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Política para permitir acceso completo (ajustar según necesidades de seguridad)
CREATE POLICY "Allow all operations on app_settings" ON app_settings
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Comentarios para documentación
COMMENT ON TABLE app_settings IS 'Tabla para almacenar configuraciones globales de la aplicación';
COMMENT ON COLUMN app_settings.key IS 'Clave única identificadora de la configuración';
COMMENT ON COLUMN app_settings.value IS 'Valor de la configuración en formato JSON';
COMMENT ON COLUMN app_settings.description IS 'Descripción de qué hace la configuración';