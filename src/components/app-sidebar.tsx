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
    } else if (user?.email) {
      setPersistentUser({
        name: user.email.split('@')[0],
        email: user.email,
        avatar: "/avatars/admin.jpg",
      })
    }
  }, [user])

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
    user: persistentUser,
    navMain: [
      {
        title: "Inicio",
        url: "/admin",
        icon: Home,
        isActive: isNavItemActive("/admin", false),
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
    bodegones: [
      {
        title: "Localidades",
        url: "/admin/bodegones",
        icon: Store,
        isActive: isNavItemActive("/admin/bodegones", false),
      },
      {
        title: "Productos",
        url: "/admin/bodegones/productos",
        icon: Package,
        isActive: isNavItemActive("/admin/bodegones/productos", true),
        items: [
          {
            title: "Todos",
            url: "/admin/bodegones/productos",
          },
          {
            title: "Categorías",
            url: "/admin/bodegones/productos/categorias",
          },
          {
            title: "Sub Categorías",
            url: "/admin/bodegones/productos/sub-categorias",
          },
        ],
      },
    ],
    restaurantes: [
      {
        title: "Localidades",
        url: "/admin/restaurantes",
        icon: UtensilsCrossed,
        isActive: isNavItemActive("/admin/restaurantes", false),
      },
      {
        title: "Productos",
        url: "/admin/restaurantes/productos",
        icon: Package,
        isActive: isNavItemActive("/admin/restaurantes/productos", true),
        items: [
          {
            title: "Todos",
            url: "/admin/restaurantes/productos",
          },
          {
            title: "Categorías",
            url: "/admin/restaurantes/productos/categorias",
          },
          {
            title: "Sub Categorías",
            url: "/admin/restaurantes/productos/sub-categorias",
          },
        ],
      },
    ],
    administration: [
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
        <NavMain items={data.bodegones} title="Bodegones" />
        <NavMain items={data.restaurantes} title="Restaurantes" />
        <NavProjects projects={data.administration} title="Administración" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
