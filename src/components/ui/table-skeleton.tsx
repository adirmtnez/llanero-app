import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface TableSkeletonProps {
  rows?: number
  columns?: number
  showCheckbox?: boolean
  showActions?: boolean
}

export function TableSkeleton({ 
  rows = 5, 
  columns = 3, 
  showCheckbox = true, 
  showActions = true 
}: TableSkeletonProps) {
  return (
    <div className="border rounded-lg bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {showCheckbox && (
                <TableHead className="w-12">
                  <Skeleton className="h-4 w-4" />
                </TableHead>
              )}
              {Array.from({ length: columns }).map((_, index) => (
                <TableHead key={index} className="min-w-[120px]">
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
              {showActions && (
                <TableHead className="w-12">
                  <Skeleton className="h-4 w-4" />
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {showCheckbox && (
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                )}
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    {colIndex === 0 ? (
                      // Primera columna con imagen/icono y texto
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-md flex-shrink-0" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    ) : (
                      // Otras columnas con texto simple
                      <Skeleton className="h-4 w-16" />
                    )}
                  </TableCell>
                ))}
                {showActions && (
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}