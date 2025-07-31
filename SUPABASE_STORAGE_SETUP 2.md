# Configuración de Supabase Storage para el bucket 'admin.app'

## Pasos para configurar el bucket en Supabase Dashboard:

### 1. Crear el bucket
1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **Storage** en el menú lateral
3. Haz clic en **"Create bucket"**
4. Nombre del bucket: `admin.app`
5. Marca como **público** (Public bucket: ON)
6. Haz clic en **"Save"**

### 2. Configurar políticas de seguridad (RLS)

Ve a **SQL Editor** en Supabase Dashboard y ejecuta estas consultas:

```sql
-- Política para permitir INSERT (subir archivos)
CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'admin.app');

-- Política para permitir SELECT (leer archivos)
CREATE POLICY "Allow public to view files" ON storage.objects
FOR SELECT 
TO public 
USING (bucket_id = 'admin.app');

-- Política para permitir UPDATE (actualizar archivos)
CREATE POLICY "Allow authenticated users to update files" ON storage.objects
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'admin.app')
WITH CHECK (bucket_id = 'admin.app');

-- Política para permitir DELETE (eliminar archivos)
CREATE POLICY "Allow authenticated users to delete files" ON storage.objects
FOR DELETE 
TO authenticated 
USING (bucket_id = 'admin.app');
```

### 3. Alternativa: Políticas más permisivas (solo para desarrollo)

Si prefieres políticas más abiertas para desarrollo, puedes usar:

```sql
-- Política que permite todas las operaciones a usuarios autenticados
CREATE POLICY "Allow all operations for authenticated users" ON storage.objects
FOR ALL 
TO authenticated 
USING (bucket_id = 'admin.app')
WITH CHECK (bucket_id = 'admin.app');

-- Política que permite lectura a todos (necesaria para URLs públicas)
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT 
TO public 
USING (bucket_id = 'admin.app');
```

### 4. Verificar configuración

Después de ejecutar las consultas SQL:

1. Ve a **Storage** > **Policies** en Supabase Dashboard
2. Deberías ver las políticas creadas para `storage.objects`
3. Verifica que el bucket `admin.app` aparezca en la lista de buckets
4. Intenta subir un archivo de prueba desde el dashboard

### 5. Estructura de carpetas esperada

El bucket se organizará automáticamente así:

```
admin.app/
├── bodegons/
│   └── logos/
│       └── bodegon-{id}-logo.{ext}
└── restaurants/
    ├── logos/
    │   └── restaurant-{id}-logo.{ext}
    └── covers/
        └── restaurant-{id}-cover.{ext}
```

### 6. Solución de problemas

Si sigues teniendo problemas:

1. **Verifica autenticación**: Asegúrate de que el usuario esté autenticado
2. **Revisa los logs**: Ve a **Logs** > **Storage** en Supabase Dashboard
3. **Verifica permisos**: Confirma que las políticas se aplicaron correctamente
4. **Bucket público**: Asegúrate de que el bucket esté marcado como público

### 7. Testing

Una vez configurado, puedes probar:

1. Crear un bodegón con logo desde la aplicación
2. Verificar que el archivo aparezca en Storage > admin.app
3. Verificar que la URL pública funcione
4. Confirmar que el `logo_url` se guarde correctamente en la BD

## URLs de archivos

Las URLs públicas tendrán el formato:
```
https://[tu-proyecto].supabase.co/storage/v1/object/public/admin.app/bodegons/logos/bodegon-123-logo.jpg
```