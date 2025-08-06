# Proyecto Llanero App - Guía para Claude

## Comandos de desarrollo
- Servidor: `npm run dev`
- Build: `npm run build` 
- Lint: `npm run lint`

## Scripts preventivos disponibles

### Limpieza y reinstalación
```bash
npm run clean      # Limpia node_modules y cache
npm run fresh      # Limpia todo y reinstala dependencias
```

### Resolución de problemas
```bash
npm run kill-processes  # Mata procesos Node.js colgados
npm run fix-git        # Limpia locks de git y muestra status
npm run health-check   # Ejecuta todas las verificaciones
```

### Uso manual (si los scripts fallan)
```bash
# Dependencias corrompidas
rm -rf node_modules package-lock.json && npm cache clean --force && npm install

# Procesos bloqueados  
pkill -f node && pkill -f next

# Git bloqueado
find .git -name "*.lock" -delete
```

## ⚠️ Problemas conocidos y soluciones

### Node.js v23.x Incompatibilidad Crítica
**Problema**: Node.js v23.11.0 causa errores de TypeScript con Next.js 15.4.4
- Error: `_config.default) is not a function`
- npm install se cuelga indefinidamente
- npx commands timeout

**Solución**: Usar Node.js v20 LTS
```bash
# Con Homebrew
brew uninstall node
brew install node@20
brew link --overwrite node@20

# Verificar versión
node --version  # Debe ser v20.x.x
npm --version   # Debe ser v10.x.x o superior
```

### npm Corrupto
**Síntomas**: npm install timeout, comandos colgados
**Solución**: Reinstalar npm completamente
```bash
curl -L https://www.npmjs.com/install.sh | sh
```

### Módulos Next.js Faltantes
**Error**: `Cannot find module '../../lib/batcher'`
**Causa**: Instalación incompleta de dependencias
**Solución**: Proyecto nuevo con traspaso de código fuente

## Estructura del proyecto
- Framework: Next.js 15.4.5
- UI: Tailwind CSS + Radix UI
- Autenticación: Supabase
- Estado: Zustand
- Enrutamiento: React Router DOM 7.7.1

## Estrategia de branching

### Ramas principales
- **`main`** - Código estable en producción
- **`dev`** - Rama de desarrollo principal (branch por defecto)

### Flujo de desarrollo
```bash
# Nueva funcionalidad
git checkout dev
git checkout -b feature/nombre-funcionalidad
# ... desarrollo ...
git push origin feature/nombre-funcionalidad
# Crear PR hacia dev

# Corrección de bug
git checkout dev
git checkout -b fix/descripcion-bug
# ... corrección ...
# PR hacia dev

# Release a producción
git checkout main
git merge dev
git push origin main
```

### Convenciones de commits
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Documentación
- `refactor:` Refactorización
- `chore:` Mantenimiento

Ver `BRANCHING_STRATEGY.md` para detalles completos.