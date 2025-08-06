"use client"

import { useLocation } from 'react-router-dom'
import { useAdminStore } from '@/store/admin/admin-store'
import { MobileTopbar } from '@/components/mobile-topbar'

export function AdminTopbar() {
  const location = useLocation()
  const { breadcrumb } = useAdminStore()

  return <MobileTopbar />
}