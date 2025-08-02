"use client"

import { useState, useEffect, useMemo } from "react"

interface UsePaginationProps<T> {
  data: T[]
  initialPageSize?: number
  dependencies?: any[]
}

export function usePagination<T>({ data, initialPageSize = 10, dependencies = [] }: UsePaginationProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  // Reset page when dependencies change (e.g., search, filters)
  useEffect(() => {
    setCurrentPage(1)
  }, dependencies)

  // Calculate pagination values
  const totalItems = data.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = data.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1)
  }

  return {
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    paginatedData,
    handlePageChange,
    handlePageSizeChange,
  }
}