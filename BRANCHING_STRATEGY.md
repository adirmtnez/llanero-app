# Estrategia de Branching - Llanero App

## Estructura de ramas

### Ramas principales
- **`main`** - Código en producción (siempre desplegable)
- **`dev`** - Rama de desarrollo principal

### Ramas temporales
- **`feature/[descripcion]`** - Nuevas funcionalidades
- **`fix/[descripcion]`** - Corrección de bugs
- **`hotfix/[descripcion]`** - Correcciones urgentes en producción

## Flujo de trabajo

### 1. Desarrollo de funcionalidades
```bash
git checkout dev
git pull origin dev
git checkout -b feature/nueva-funcionalidad
# Desarrollo...
git add .
git commit -m "feat: descripción de la funcionalidad"
git push origin feature/nueva-funcionalidad
# Crear Pull Request hacia dev
```

### 2. Corrección de bugs
```bash
git checkout dev
git checkout -b fix/correccion-bug
# Corrección...
git commit -m "fix: descripción del fix"
# Pull Request hacia dev
```

### 3. Hotfixes críticos
```bash
git checkout main
git checkout -b hotfix/correccion-critica
# Corrección urgente...
git commit -m "hotfix: descripción urgente"
# Pull Request hacia main
# Después mergear main a dev
```

### 4. Release a producción
```bash
# Cuando dev esté listo para producción
git checkout main
git merge dev
git tag v1.0.0
git push origin main --tags
```

## Nomenclatura de commits

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Documentación
- `style:` Formato/estilo
- `refactor:` Refactorización
- `test:` Tests
- `chore:` Tareas de mantenimiento

## Reglas
1. **Nunca commit directo a `main`**
2. `dev` es la rama por defecto para desarrollo
3. Eliminar ramas feature después del merge
4. Usar Pull Requests para code review
5. Mantener commits limpios y descriptivos

## Scripts útiles
```bash
# Limpiar ramas mergeadas
git branch --merged dev | grep -v "dev\|main" | xargs git branch -d

# Ver estado de todas las ramas
git branch -vv

# Actualizar todas las ramas remotas
git fetch --all --prune
```