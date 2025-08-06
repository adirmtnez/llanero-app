"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useAdminNavigation } from "@/hooks/admin/use-admin-navigation"

interface BreadcrumbItemData {
  label: string
  path: string
  isActive?: boolean
}

interface AdminBreadcrumbProps {
  items: BreadcrumbItemData[]
}

export function AdminBreadcrumb({ items }: AdminBreadcrumbProps) {
  const { navigateToView } = useAdminNavigation()

  const handleBreadcrumbClick = (item: BreadcrumbItemData) => {
    if (!item.isActive) {
      navigateToView({
        view: item.path.split('/')[1] || 'dashboard',
        path: item.path,
        breadcrumb: items.map(i => ({
          label: i.label,
          path: i.path,
          isActive: i.path === item.path
        }))
      })
    }
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          <div key={item.path} className="flex items-center">
            {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
            <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
              {item.isActive ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink 
                  onClick={() => handleBreadcrumbClick(item)}
                  className="cursor-pointer"
                >
                  {item.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}