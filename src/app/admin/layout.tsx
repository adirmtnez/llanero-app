"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileTopbar } from "@/components/mobile-topbar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only redirect if auth check is complete and no user found
    // Supabase handles session persistence automatically
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [user, loading, router])

  // Don't render anything if redirecting to auth
  if (!loading && !user) {
    return null
  }

  // Render admin layout - trust Supabase session persistence
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