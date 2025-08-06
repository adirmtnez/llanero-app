"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileTopbar } from "@/components/mobile-topbar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"
import Image from "next/image"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [shouldShowLoader, setShouldShowLoader] = useState(() => {
    // Check if we've already authenticated in this session
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('admin-session-initialized')
    }
    return true
  })

  useEffect(() => {
    // Once auth completes, mark session as initialized
    if (!loading) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('admin-session-initialized', 'true')
      }
      setShouldShowLoader(false)
      
      // Only redirect if no user found
      if (!user) {
        router.push("/auth")
      }
    }
  }, [user, loading, router])

  // Show loading screen only on first session load
  if (loading && shouldShowLoader) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA]">
        <div className="flex flex-col items-center space-y-6">
          {/* Logo */}
          <Image
            src="https://zykwuzuukrmgztpgnbth.supabase.co/storage/v1/object/public/adminapp//Llanero%20Logo.png"
            alt="Llanero"
            width={120}
            height={40}
            className="object-contain"
          />
          
          {/* Loading spinner */}
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
            <span className="text-gray-600 font-medium">Verificando autenticación...</span>
          </div>
        </div>
      </div>
    )
  }

  // Don't render anything if redirecting to auth
  if (!user && !loading) {
    return null
  }

  // Render admin layout - trust Supabase session persistence
  return (
    <div>
      {children}
    </div>
  )
}