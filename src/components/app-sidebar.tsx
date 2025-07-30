"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user } = useAuth()

  // Function to check if a nav item is active
  const isNavItemActive = (itemUrl: string, hasItems?: boolean) => {
    if (hasItems) {
      // For items with subitems, check if current path starts with the item URL
      return pathname.startsWith(itemUrl)
    } else {
      // For simple items, check exact match or if it's the admin root
      return pathname === itemUrl || (itemUrl === "/admin" && pathname === "/admin")
    }
  }

  // Function to check if an administration item is active
  const isAdminItemActive = (itemUrl: string) => {
    return pathname === itemUrl
  }

  // Dynamic data based on current pathname
  const data = {
    user: {
      name: user?.full_name || user?.email?.split('@')[0] || "Usuario",
      email: user?.email || "usuario@llanero-app.com",
      avatar: "/avatars/admin.jpg",
    },
    navMain: [
      {
        title: "Inicio",
        url: "/admin",
        icon: Home,
        isActive: isNavItemActive("/admin", false),
      },
      {
        title: "Productos",
        url: "/admin/productos",
        icon: Package,
        isActive: isNavItemActive("/admin/productos", true),
        items: [
          {
            title: "Todos",
            url: "/admin/productos",
          },
          {
            title: "Categorias",
            url: "/admin/productos/categorias",
          },
          {
            title: "Sub Categorias",
            url: "/admin/productos/sub-categorias",
          },
        ],
      },
      {
        title: "Pedidos",
        url: "/admin/pedidos",
        icon: ShoppingCart,
        isActive: isNavItemActive("/admin/pedidos", false),
      },
      {
        title: "Marketing",
        url: "/admin/marketing",
        icon: Megaphone,
        isActive: isNavItemActive("/admin/marketing", false),
      },
    ],
    administration: [
      {
        name: "Bodegones",
        url: "/admin/bodegones",
        icon: Store,
        isActive: isAdminItemActive("/admin/bodegones"),
      },
      {
        name: "Restaurantes",
        url: "/admin/restaurantes",
        icon: UtensilsCrossed,
        isActive: isAdminItemActive("/admin/restaurantes"),
      },
      {
        name: "Métodos de pago",
        url: "/admin/metodos-pago",
        icon: CreditCard,
        isActive: isAdminItemActive("/admin/metodos-pago"),
      },
      {
        name: "Equipo",
        url: "/admin/equipo",
        icon: Users,
        isActive: isAdminItemActive("/admin/equipo"),
      },
      {
        name: "Repartidores",
        url: "/admin/repartidores",
        icon: Truck,
        isActive: isAdminItemActive("/admin/repartidores"),
      },
    ],
  }

  return (
    <Sidebar collapsible="icon" className="bg-[#EBEBEB]" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.administration} title="Administración" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
