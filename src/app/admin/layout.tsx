"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileTopbar } from "@/components/mobile-topbar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  console.log('AdminLayout render:', { user: user?.email, loading })

  useEffect(() => {
    console.log('AdminLayout: Component mounted')
    
    // Add a safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('AdminLayout: Loading timeout reached, forcing auth check')
        router.push("/auth")
      }
    }, 10000) // 10 second timeout
    
    return () => {
      console.log('AdminLayout: Component unmounted')
      clearTimeout(timeout)
    }
  }, [loading, router])

  useEffect(() => {
    console.log('AdminLayout: Auth state effect:', { user: user?.email, loading })
    if (!loading && !user) {
      console.log('AdminLayout: Redirecting to auth - no user found')
      router.push("/auth")
    }
  }, [user, loading, router])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Don't render admin content if user is not authenticated
  if (!user) {
    return null
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <MobileTopbar />
      <SidebarInset className="bg-[#F8F9FA] pt-20 md:pt-0">
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}