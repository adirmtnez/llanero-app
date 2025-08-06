"use client"

import * as React from "react"
import { ChevronsUpDown, Plus, Store, ChefHat } from "lucide-react"
import { useBodegones } from "@/hooks/use-bodegones"
import { useRestaurants } from "@/hooks/use-restaurants"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const { bodegones, loading: bodegonesLoading } = useBodegones()
  const { restaurants, loading: restaurantsLoading } = useRestaurants()


  // Estado para verificar si está montado (para evitar problemas de hidratación)
  const [isMounted, setIsMounted] = React.useState(false)
  
  // Estado para el elemento activo (Llanero app por defecto)
  const [activeItem, setActiveItem] = React.useState({
    name: "Llanero app",
    type: "app",
    logo: Store,
    plan: "Gestión completa"
  })

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  // No renderizar hasta que esté montado para evitar problemas de hidratación
  if (!isMounted) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <Store className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Llanero app</span>
              <span className="truncate text-xs">Gestión completa</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <activeItem.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeItem.name}</span>
                <span className="truncate text-xs">{activeItem.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            {/* Sección Bodegones */}
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Bodegones
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => setActiveItem({
                name: "Todos los bodegones",
                type: "bodegones-all", 
                logo: Store,
                plan: "Vista general"
              })}
              className="gap-2 p-2"
            >
              <div className="flex size-6 items-center justify-center rounded-md border">
                <Store className="size-3.5 shrink-0" />
              </div>
              Todos
            </DropdownMenuItem>
            
            {bodegonesLoading ? (
              <DropdownMenuItem disabled className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <Store className="size-3.5 shrink-0 animate-pulse" />
                </div>
                Cargando...
              </DropdownMenuItem>
            ) : bodegones.length > 0 ? (
              bodegones.map((bodegon, index) => (
                <DropdownMenuItem
                  key={bodegon.id}
                  onClick={() => setActiveItem({
                    name: bodegon.name,
                    type: "bodegon",
                    logo: Store,
                    plan: bodegon.address || "Bodegón"
                  })}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <Store className="size-3.5 shrink-0" />
                  </div>
                  {bodegon.name}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <Store className="size-3.5 shrink-0 opacity-50" />
                </div>
                No hay bodegones
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            {/* Sección Restaurantes */}
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Restaurantes
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => setActiveItem({
                name: "Todos los restaurantes",
                type: "restaurants-all",
                logo: ChefHat,
                plan: "Vista general"
              })}
              className="gap-2 p-2"
            >
              <div className="flex size-6 items-center justify-center rounded-md border">
                <ChefHat className="size-3.5 shrink-0" />
              </div>
              Todos
            </DropdownMenuItem>

            {restaurantsLoading ? (
              <DropdownMenuItem disabled className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <ChefHat className="size-3.5 shrink-0 animate-pulse" />
                </div>
                Cargando...
              </DropdownMenuItem>
            ) : restaurants.length > 0 ? (
              restaurants.map((restaurant, index) => (
                <DropdownMenuItem
                  key={restaurant.id}
                  onClick={() => setActiveItem({
                    name: restaurant.name,
                    type: "restaurant",
                    logo: ChefHat,
                    plan: "Restaurante"
                  })}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <ChefHat className="size-3.5 shrink-0" />
                  </div>
                  {restaurant.name}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <ChefHat className="size-3.5 shrink-0 opacity-50" />
                </div>
                No hay restaurantes
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
            
            {/* Opción para volver a Llanero app */}
            <DropdownMenuItem
              onClick={() => setActiveItem({
                name: "Llanero app",
                type: "app",
                logo: Store,
                plan: "Gestión completa"
              })}
              className="gap-2 p-2"
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Store className="size-4" />
              </div>
              <div className="font-medium">Llanero app</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
