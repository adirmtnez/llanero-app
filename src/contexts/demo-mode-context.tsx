"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface DemoModeContextType {
  isDemoMode: boolean
  toggleDemoMode: () => void
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined)

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(true) // Default to demo mode

  // Load demo mode state from localStorage on mount
  useEffect(() => {
    const savedDemoMode = localStorage.getItem('demoMode')
    if (savedDemoMode !== null) {
      setIsDemoMode(JSON.parse(savedDemoMode))
    }
  }, [])

  // Save demo mode state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('demoMode', JSON.stringify(isDemoMode))
  }, [isDemoMode])

  const toggleDemoMode = () => {
    setIsDemoMode(prev => !prev)
  }

  return (
    <DemoModeContext.Provider value={{ isDemoMode, toggleDemoMode }}>
      {children}
    </DemoModeContext.Provider>
  )
}

export function useDemoMode() {
  const context = useContext(DemoModeContext)
  if (context === undefined) {
    throw new Error('useDemoMode must be used within a DemoModeProvider')
  }
  return context
}