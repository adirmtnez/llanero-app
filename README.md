# 🏪 Llanero App

Una aplicación web moderna para la gestión integral de negocios de alimentos y productos, diseñada específicamente para bodegones y restaurantes.

## 🚀 Características Principales

### 🏢 Gestión Dual de Negocios
- **Bodegones**: Gestión completa de productos, inventario y disponibilidad por ubicación
- **Restaurantes**: Administración independiente de menús, categorías y productos

### 📦 Sistema de Productos Modular
- **Arquitectura separada**: Workflows completamente independientes para bodegones y restaurantes
- **Catálogo dual**: Categorías y subcategorías especializadas por tipo de negocio
- **Gestión de imágenes**: Upload múltiple con Supabase Storage (JPEG, PNG, WebP)
- **Control de inventario**: Sistema de disponibilidad por bodegón
- **Estados inteligentes**: Activo/Inactivo con validaciones automáticas
- **Vista de tarjetas moderna**: Interfaz optimizada con tags para categorías

### 🎨 Interfaz de Usuario Avanzada
- **Vista de tarjetas responsive**: Grid adaptativo con hover effects y padding optimizado
- **Tags categorizados**: Visualización por colores (azul para categorías, morado para subcategorías)
- **Formateo automático de precios**: Separadores de miles y decimales en tiempo real
- **Modales de confirmación**: Patrones Dialog/Drawer según dispositivo

### 🛠️ Funcionalidades Administrativas
- **Dashboard**: Panel de control centralizado
- **Gestión de Pedidos**: Seguimiento y actualización de estados
- **Marketing**: Herramientas promocionales
- **Métodos de Pago**: Configuración de opciones de pago
- **Equipo y Repartidores**: Gestión de personal
- **Autenticación**: Sistema seguro con Supabase Auth

### 📱 Diseño Responsivo
- **Desktop**: Modales con Dialog components
- **Mobile**: Drawers optimizados para pantallas táctiles
- **UI Moderna**: Componentes shadcn/ui con Tailwind CSS

## 🛠️ Tecnologías

- **Framework**: [Next.js 15.4.5](https://nextjs.org) con App Router
- **Frontend**: [React 19](https://react.dev) + [TypeScript 5](https://www.typescriptlang.org)
- **Routing**: [React Router DOM 7.7.1](https://reactrouter.com) - SPA completa
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://www.radix-ui.com)
- **Backend**: [Supabase](https://supabase.com) (Database + Auth + Storage)
- **State Management**: [Zustand 5](https://zustand-demo.pmnd.rs)
- **Icons**: [Lucide React](https://lucide.dev)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski)
- **Themes**: [Next Themes](https://github.com/pacocoursey/next-themes)

## 🚀 Inicio Rápido

### Prerrequisitos
- **Node.js v20 LTS** (⚠️ v23.x NO compatible)
- npm v10+ o yarn

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/adirmtnez/llanero-app.git
cd llanero-app
```

2. **Instalar dependencias**
```bash
npm install
# o usar nuestro script preventivo
npm run fresh  # Limpia todo y reinstala desde cero
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

4. **Ejecutar el servidor de desarrollo**
```bash
npm run dev
```

5. **Abrir en el navegador**
Visita [http://localhost:3000](http://localhost:3000)

### 🛠️ Scripts Preventivos

Para resolver problemas comunes del desarrollo:

```bash
# Limpiar dependencias y reinstalar
npm run fresh

# Resolver problemas de git (locks, etc.)
npm run fix-git

# Matar procesos colgados de Node.js
npm run kill-processes

# Diagnóstico completo del proyecto
npm run health-check
```

## 🤝 Contribución

Este proyecto sigue un flujo de trabajo Git Flow estructurado. Ver [BRANCHING_STRATEGY.md](./BRANCHING_STRATEGY.md) para detalles completos.

### Flujo rápido:

1. **Fork el proyecto**

2. **Clonar y configurar**
```bash
git clone https://github.com/tu-usuario/llanero-app.git
cd llanero-app
git checkout dev  # Rama de desarrollo principal
```

3. **Crear rama para tu feature**
```bash
git checkout -b feature/nueva-funcionalidad
```

4. **Desarrollar y commitear**
```bash
# Usar convenciones de commits
git commit -m "feat: agregar nueva funcionalidad"
# Otros ejemplos:
# git commit -m "fix: corregir bug en formulario"
# git commit -m "docs: actualizar documentación"
```

5. **Push y Pull Request**
```bash
git push origin feature/nueva-funcionalidad
# Crear PR hacia la rama 'dev'
```

### Estructura de ramas:
- **`main`** - Código estable en producción
- **`dev`** - Desarrollo activo (branch por defecto)
- **`feature/*`** - Nuevas funcionalidades
- **`fix/*`** - Corrección de bugs
- **`hotfix/*`** - Correcciones urgentes

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**Desarrollado con ❤️ para la gestión moderna de negocios de alimentos**