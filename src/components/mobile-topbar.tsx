"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  BadgeCheck,
  Bell,
  LogOut,
  Settings,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { useAdminNavigation } from "@/hooks/admin/use-admin-navigation"
import { toast } from "sonner"

export function MobileTopbar() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const { navigateToConfiguraciones } = useAdminNavigation()
  
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

  const handleLogout = async () => {
    try {
      const { error } = await signOut()
      if (error) {
        toast.error("Error al cerrar sesión")
      } else {
        // Clear session storage to show loading screen on next login
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('admin-session-initialized')
        }
        toast.success("Sesión cerrada exitosamente")
        router.push("/auth")
      }
    } catch (err) {
      toast.error("Error al cerrar sesión")
    }
  }

  // Generate user initials for avatar fallback
  const getUserInitials = (name: string, email: string) => {
    if (name && name.trim()) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return email.charAt(0).toUpperCase()
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b md:hidden">
      <div className="flex items-center justify-between px-4 h-14">
        <SidebarTrigger className="h-8 w-8" />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-muted text-xs font-medium">
              {getUserInitials(persistentUser.name, persistentUser.email)}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 rounded-lg"
            side="bottom"
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={persistentUser.avatar} alt={persistentUser.name} />
                  <AvatarFallback className="rounded-lg">{getUserInitials(persistentUser.name, persistentUser.email)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{persistentUser.name}</span>
                  <span className="truncate text-xs">{persistentUser.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Cuenta
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notificaciones
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigateToConfiguraciones()}>
                <Settings />
                Configuraciones
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}