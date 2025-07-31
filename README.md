# 🏪 Llanero App

Una aplicación web moderna para la gestión integral de negocios de alimentos y productos, diseñada específicamente para bodegones y restaurantes.

## 🚀 Características Principales

### 🏢 Gestión Dual de Negocios
- **Bodegones**: Gestión completa de productos, inventario y ventas
- **Restaurantes**: Administración de menús, categorías y pedidos

### 📦 Sistema de Productos
- Catálogo completo con categorías y subcategorías
- Gestión de imágenes con Supabase Storage
- Control de inventario y precios
- Estados activo/inactivo para productos

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
│   ├── auth/              # Autenticación
│   └── dashboard/         # Panel principal
├── components/            # Componentes reutilizables
│   ├── modals/           # Modales (Dialog/Drawer)
│   ├── products/         # Componentes de productos
│   └── ui/               # Componentes base shadcn/ui
├── contexts/             # Contextos de React
├── hooks/                # Custom hooks
├── lib/                  # Utilidades y configuración
├── types/                # Definiciones de TypeScript
└── utils/                # Funciones auxiliares
```

## 🎯 Funcionalidades Destacadas

### ✨ Modales Responsivos
- **Desktop**: Componentes Dialog centrados
- **Mobile**: Drawers deslizantes desde abajo
- **Detección automática** con `useMediaQuery`

### 🔄 Gestión de Estado
- Custom hooks para cada entidad (productos, categorías, etc.)
- Manejo optimista de actualizaciones
- Cache inteligente con Supabase

### 🎨 Experiencia de Usuario
- Notificaciones toast elegantes
- Estados de carga con spinners
- Manejo de errores integrado
- Confirmaciones de acciones destructivas

### 🔒 Seguridad
- Autenticación con Supabase Auth
- Row Level Security (RLS) en base de datos
- Validación de tipos con TypeScript

## 🧪 Modo Demo

La aplicación incluye un **modo demo** con datos de prueba:
- Activado por defecto para desarrollo
- Toggle disponible en la interfaz
- Datos persistentes en localStorage

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
