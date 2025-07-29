import { AppSidebar } from "@/components/app-sidebar"
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
        <SidebarInset className="bg-[#F8F9FA]">
          {children}
        </SidebarInset>
      </SidebarProvider>
    </DemoModeProvider>
  )
}