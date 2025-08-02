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

- **Framework**: [Next.js 15](https://nextjs.org) con App Router
- **Frontend**: [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://www.radix-ui.com)
- **Backend**: [Supabase](https://supabase.com) (Database + Auth + Storage)
- **Icons**: [Lucide React](https://lucide.dev)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski)

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+ 
- npm, yarn, pnpm o bun

### Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd llanero-app
```

2. **Instalar dependencias**
```bash
npm install
# o
yarn install
# o
pnpm install
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
# o
yarn dev
# o
pnpm dev
```

5. **Abrir en el navegador**
Visita [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── admin/             # Páginas administrativas
│   │   ├── bodegones/     # Módulo bodegones independiente
│   │   │   └── productos/ # CRUD productos bodegón
│   │   ├── restaurantes/  # Módulo restaurantes independiente
│   │   │   └── productos/ # CRUD productos restaurante
│   │   ├── auth/          # Autenticación
│   │   └── dashboard/     # Panel principal
├── components/            # Componentes reutilizables
│   ├── bodegones/        # Componentes específicos bodegones
│   │   ├── product-form.tsx    # Formulario productos bodegón
│   │   └── products-table.tsx  # Tabla productos bodegón
│   ├── restaurants/      # Componentes específicos restaurantes
│   │   ├── product-form.tsx    # Formulario productos restaurante
│   │   ├── products-grid.tsx   # Vista tarjetas productos
│   │   └── delete-product-modal.tsx # Modal confirmación
│   ├── modals/           # Modales (Dialog/Drawer)
│   └── ui/               # Componentes base shadcn/ui
├── hooks/                # Custom hooks especializados
│   ├── bodegones/        # Hooks para bodegones
│   │   ├── use-bodegon-products.ts
│   │   ├── use-bodegon-categories.ts
│   │   └── use-bodegon-subcategories.ts
│   └── restaurants/      # Hooks para restaurantes
│       ├── use-restaurant-products.ts
│       ├── use-restaurant-categories.ts
│       └── use-restaurant-subcategories.ts
├── lib/                  # Utilidades y configuración
├── types/                # Definiciones de TypeScript
└── utils/                # Funciones auxiliares
```

## 🎯 Funcionalidades Destacadas

### 🏗️ Arquitectura Modular Separada
- **Separación completa**: Bodegones y restaurantes como módulos independientes
- **Hooks especializados**: Custom hooks por tipo de negocio
- **Componentes dedicados**: Formularios y vistas optimizadas por contexto
- **Navegación restructurada**: Sidebar con grupos independientes

### ✨ Interfaz de Usuario Moderna
- **Vista de tarjetas optimizada**: Grid responsive con padding ajustado (py-0)
- **Tags categorizados**: Colores distintivos para categorías y subcategorías
- **Modales responsivos**: Dialog (desktop) y Drawer (mobile) con detección automática
- **Formateo de precios automático**: Separadores de miles y decimales en tiempo real

### 🔄 Gestión de Estado Avanzada
- **Custom hooks especializados**: Separación por tipo de producto
- **Manejo de inventario**: Sistema de disponibilidad por bodegón con checkboxes
- **Actualización optimista**: Estados intermedios y validaciones automáticas
- **Cache inteligente** con Supabase Real-time

### 🎨 Experiencia de Usuario Pulida
- **Notificaciones contextuales**: Toast messages con Sonner
- **Estados de carga consistentes**: Spinners y skeletons
- **Manejo de errores robusto**: Validaciones y mensajes informativos
- **Confirmaciones elegantes**: Modales de confirmación para acciones destructivas

### 🔒 Seguridad y Validación
- **Autenticación robusta**: Supabase Auth con RLS
- **Validación de archivos**: Tipos permitidos (JPEG, PNG, WebP)
- **Validación de formularios**: Campos requeridos y formatos
- **TypeScript estricto**: Tipado completo en toda la aplicación

## 🧪 Desarrollo y Testing

### Estructura Modular
- **Separación completa**: Cada tipo de producto tiene sus propios workflows
- **Testing independiente**: Los módulos pueden probarse por separado
- **Escalabilidad**: Fácil adición de nuevos tipos de negocio

### Base de Datos
- **Supabase**: PostgreSQL con Row Level Security
- **Tablas especializadas**: `bodegon_products`, `restaurant_products`
- **Relaciones inteligentes**: Categorías y subcategorías por tipo de negocio

## 📚 Documentación Adicional

- [Configuración de Supabase Storage](./SUPABASE_STORAGE_SETUP.md)
- [Componentes UI](https://ui.shadcn.com)
- [Next.js Documentation](https://nextjs.org/docs)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**Desarrollado con ❤️ para la gestión moderna de negocios de alimentos**
