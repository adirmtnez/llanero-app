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
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { DemoModeToggle } from "@/components/demo-mode-toggle"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

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

  // Dynamic data based on current pathname
  const data = {
    user: {
      name: "Admin User",
      email: "admin@llanero-app.com",
      avatar: "/avatars/admin.jpg",
    },
    teams: [
      {
        name: "Llanero App",
        logo: GalleryVerticalEnd,
        plan: "Admin Panel",
      },
    ],
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
        title: "Ventas",
        url: "/admin/ventas",
        icon: DollarSign,
        isActive: isNavItemActive("/admin/ventas", false),
      },
      {
        title: "Repartidores",
        url: "/admin/repartidores",
        icon: Truck,
        isActive: isNavItemActive("/admin/repartidores", false),
      },
    ],
    projects: [
      {
        name: "Components Test",
        url: "/shadcn-components",
        icon: Command,
      },
    ],
  }

  return (
    <Sidebar collapsible="icon" className="bg-[#EBEBEB]" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <DemoModeToggle />
        <Separator className="my-2" />
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
