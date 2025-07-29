import { AppSidebar } from "@/components/app-sidebar"
import { MobileTopbar } from "@/components/mobile-topbar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { DemoModeProvider } from "@/contexts/demo-mode-context"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DemoModeProvider>
      <SidebarProvider>
        <AppSidebar />
        <MobileTopbar />
        <SidebarInset className="bg-[#F8F9FA] pt-20 md:pt-0">
          {children}
        </SidebarInset>
      </SidebarProvider>
    </DemoModeProvider>
  )
}