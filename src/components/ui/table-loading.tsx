"use client"

import { useEffect, useState } from "react"
import { TableSkeleton } from "./table-skeleton"

interface TableLoadingProps {
  rows?: number
  columns?: number
  showCheckbox?: boolean
  showActions?: boolean
}

export function TableLoading(props: TableLoadingProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Show a simple loading placeholder on server, skeleton on client
  if (!mounted) {
    return (
      <div className="border rounded-lg bg-white overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Cargando...</p>
          </div>
        </div>
      </div>
    )
  }

  return <TableSkeleton {...props} />
}