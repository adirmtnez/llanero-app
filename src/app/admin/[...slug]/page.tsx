"use client"

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// Load AdminShell only on client side to avoid SSR issues with React Router
const AdminShell = dynamic(
  () => import("@/components/admin/AdminShell").then(mod => ({ default: mod.AdminShell })),
  {
    ssr: false
  }
)

// This page handles all admin sub-routes (like /admin/pedidos, /admin/bodegones/productos, etc.)
// The React Router in AdminShell will handle the internal routing
export default function AdminCatchAllPage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null // Return nothing during SSR
  }

  return <AdminShell />
}