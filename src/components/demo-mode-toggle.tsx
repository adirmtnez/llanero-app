"use client"

import { Switch } from "@/components/ui/switch"
import { useDemoMode } from "@/contexts/demo-mode-context"
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar"

export function DemoModeToggle() {
  const { isDemoMode, toggleDemoMode } = useDemoMode()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center justify-between p-2 px-3">
          <div className="flex flex-col">
            <span className="text-sm font-medium">Modo Demo</span>
            <span className="text-xs text-muted-foreground">
              {isDemoMode ? "Datos de prueba" : "Datos reales"}
            </span>
          </div>
          <Switch
            checked={isDemoMode}
            onCheckedChange={toggleDemoMode}
            aria-label="Toggle demo mode"
          />
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}