"use client"

import * as React from "react"
import { useLocation } from "react-router-dom"
import {
  Command,
  DollarSign,
  GalleryVerticalEnd,
  Home,
  Package,
  ShoppingCart,
  Truck,
  Store,
  UtensilsCrossed,
  CreditCard,
  Users,
  Megaphone,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { useAuth } from "@/contexts/auth-context"
import { useAdminNavigation } from "@/hooks/admin/use-admin-navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  const { user } = useAuth()
  const {
    navigateToView,
    navigateToDashboard,
    navigateToBodegones,
    navigateToRestaurantes,
    navigateToConfiguraciones
  } = useAdminNavigation()
  
  // Maintain user data persistence to avoid flashing during navigation
  const [persistentUser, setPersistentUser] = React.useState({
    name: "Adirson",
    email: "adirsonmtnez@gmail.com",
    avatar: "/avatars/admin.jpg",
  })

  // Update persistent user data when actual user data is available
  React.useEffect(() => {
    if (user?.email && user?.full_name) {
      setPersistentUser({
        name: user.full_name,
        email: user.email,
        avatar: "/avatars/admin.jpg",
      })
    }
  }, [user])

  // Navigation data with internal routing
  const data = {
    user: persistentUser,
    teams: [
      {
        name: "Llanero Admin",
        logo: GalleryVerticalEnd,
        plan: "Administración",
      },
    ],
    navMain: [
      {
        title: "Dashboard",
        url: "/",
        icon: Home,
        isActive: location.pathname === "/",
        onClick: () => navigateToDashboard()
      },
      {
        title: "Bodegones",
        url: "/bodegones",
        icon: Store,
        isActive: location.pathname.startsWith("/bodegones"),
        onClick: () => navigateToBodegones(),
        items: [
          {
            title: "General",
            url: "/bodegones",
            onClick: () => navigateToBodegones()
          },
          {
            title: "Productos",
            url: "/bodegones/productos",
            onClick: () => navigateToBodegones("/productos")
          },
          {
            title: "Categorías",
            url: "/bodegones/productos/categorias",
            onClick: () => navigateToBodegones("/productos/categorias")
          },
          {
            title: "Subcategorías",
            url: "/bodegones/productos/sub-categorias",
            onClick: () => navigateToBodegones("/productos/sub-categorias")
          },
        ],
      },
      {
        title: "Restaurantes",
        url: "/restaurantes",
        icon: UtensilsCrossed,
        isActive: location.pathname.startsWith("/restaurantes"),
        onClick: () => navigateToRestaurantes(),
        items: [
          {
            title: "Localidades",
            url: "/restaurantes",
            onClick: () => navigateToRestaurantes()
          },
          {
            title: "Productos",
            url: "/restaurantes/productos", 
            onClick: () => navigateToRestaurantes("/productos")
          },
          {
            title: "Categorías",
            url: "/restaurantes/productos/categorias",
            onClick: () => navigateToRestaurantes("/productos/categorias")
          },
          {
            title: "Subcategorías",
            url: "/restaurantes/productos/sub-categorias",
            onClick: () => navigateToRestaurantes("/productos/sub-categorias")
          },
        ],
      },
      {
        title: "Pedidos",
        url: "/pedidos",
        icon: ShoppingCart,
        isActive: location.pathname === "/pedidos",
        onClick: () => navigateToView({
          view: 'pedidos',
          path: '/pedidos',
          breadcrumb: [
            { label: 'Admin', path: '/' },
            { label: 'Pedidos', path: '/pedidos', isActive: true }
          ]
        })
      },
      {
        title: "Repartidores",
        url: "/repartidores",
        icon: Truck,
        isActive: location.pathname === "/repartidores",
        onClick: () => navigateToView({
          view: 'repartidores',
          path: '/repartidores',
          breadcrumb: [
            { label: 'Admin', path: '/' },
            { label: 'Repartidores', path: '/repartidores', isActive: true }
          ]
        })
      },
      {
        title: "Equipo",
        url: "/equipo",
        icon: Users,
        isActive: location.pathname === "/equipo",
        onClick: () => navigateToView({
          view: 'equipo',
          path: '/equipo',
          breadcrumb: [
            { label: 'Admin', path: '/' },
            { label: 'Equipo', path: '/equipo', isActive: true }
          ]
        })
      },
      {
        title: "Métodos de Pago",
        url: "/metodos-pago",
        icon: CreditCard,
        isActive: location.pathname === "/metodos-pago",
        onClick: () => navigateToView({
          view: 'metodos-pago',
          path: '/metodos-pago',
          breadcrumb: [
            { label: 'Admin', path: '/' },
            { label: 'Métodos de Pago', path: '/metodos-pago', isActive: true }
          ]
        })
      },
    ],
    projects: [
      {
        name: "Configuraciones",
        url: "/configuraciones",
        icon: Command,
        onClick: () => navigateToConfiguraciones()
      },
      {
        name: "Marketing",
        url: "/marketing",
        icon: Megaphone,
        onClick: () => navigateToView({
          view: 'marketing',
          path: '/marketing',
          breadcrumb: [
            { label: 'Admin', path: '/' },
            { label: 'Marketing', path: '/marketing', isActive: true }
          ]
        })
      },
    ],
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}