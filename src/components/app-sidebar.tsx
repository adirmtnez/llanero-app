"use client"

import * as React from "react"
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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
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
      isActive: true,
    },
    {
      title: "Productos",
      url: "/admin/productos",
      icon: Package,
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
    },
    {
      title: "Ventas",
      url: "/admin/ventas",
      icon: DollarSign,
    },
    {
      title: "Repartidores",
      url: "/admin/repartidores",
      icon: Truck,
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
