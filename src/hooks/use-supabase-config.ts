"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

export interface SupabaseConfig {
  url: string
  anonKey: string
  serviceKey: string
}

const STORAGE_KEY = "llanero-supabase-config"

export function useSupabaseConfig() {
  const [config, setConfig] = useState<SupabaseConfig>({
    url: "",
    anonKey: "",
    serviceKey: ""
  })
  const [hasChanges, setHasChanges] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  // Load config from localStorage on mount
  useEffect(() => {
    const autoTestConnection = async (configToTest: SupabaseConfig) => {
      setConnectionStatus("testing")
      setErrorMessage("")

      try {
        const url = new URL(configToTest.url)
        if (!url.hostname.includes('supabase')) {
          throw new Error("La URL debe ser de Supabase")
        }

        const supabase = createClient(configToTest.url, configToTest.anonKey)
        const { error } = await supabase.auth.getSession()
        
        if (error && error.message !== "Auth session missing!") {
          throw error
        }

        const { error: userError } = await supabase.auth.getUser()
        
        if (userError && !userError.message.includes("session") && !userError.message.includes("JWT")) {
          throw userError
        }

        setConnectionStatus("success")
      } catch (error: unknown) {
        console.error("Supabase connection test failed:", error)
        setConnectionStatus("error")
        
        const errorMessage = error instanceof Error ? error.message : String(error)
        
        if (errorMessage.includes("Invalid API key")) {
          setErrorMessage("Clave API inválida")
        } else if (errorMessage.includes("Invalid URL")) {
          setErrorMessage("URL inválida")
        } else if (errorMessage.includes("network")) {
          setErrorMessage("Error de conexión de red")
        } else if (errorMessage.includes("CORS")) {
          setErrorMessage("Error de CORS - verifica la configuración del proyecto")
        } else {
          setErrorMessage(errorMessage || "Error desconocido al conectar")
        }
      }
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsedConfig = JSON.parse(saved)
        setConfig(parsedConfig)
        
        // Auto-test connection if config exists
        if (parsedConfig.url && parsedConfig.anonKey) {
          autoTestConnection(parsedConfig)
        }
      }
    } catch (error) {
      console.error("Error loading Supabase config:", error)
    }
  }, [])

  const updateConfig = (field: keyof SupabaseConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }))
    setHasChanges(true)
    setConnectionStatus("idle")
    setErrorMessage("")
  }

  const saveConfig = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
      setHasChanges(false)
      return true
    } catch (error) {
      console.error("Error saving Supabase config:", error)
      return false
    }
  }

  const testConnection = async (configToTest?: SupabaseConfig) => {
    const testConfig = configToTest || config
    
    if (!testConfig.url || !testConfig.anonKey) {
      setConnectionStatus("error")
      setErrorMessage("URL y clave anónima son requeridos")
      return
    }

    setConnectionStatus("testing")
    setErrorMessage("")

    try {
      // Validate URL format
      const url = new URL(testConfig.url)
      if (!url.hostname.includes('supabase')) {
        throw new Error("La URL debe ser de Supabase")
      }

      // Create Supabase client
      const supabase = createClient(testConfig.url, testConfig.anonKey)

      // Test connection by trying to get the session
      // This is a lightweight operation that validates the connection
      const { error } = await supabase.auth.getSession()
      
      if (error && error.message !== "Auth session missing!") {
        // Auth session missing is expected for new projects
        throw error
      }

      // Additional test: try to get user (should work even without session)
      const { error: userError } = await supabase.auth.getUser()
      
      if (userError && !userError.message.includes("session") && !userError.message.includes("JWT")) {
        throw userError
      }

      setConnectionStatus("success")
    } catch (error: unknown) {
      console.error("Supabase connection test failed:", error)
      setConnectionStatus("error")
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      if (errorMessage.includes("Invalid API key")) {
        setErrorMessage("Clave API inválida")
      } else if (errorMessage.includes("Invalid URL")) {
        setErrorMessage("URL inválida")
      } else if (errorMessage.includes("network")) {
        setErrorMessage("Error de conexión de red")
      } else if (errorMessage.includes("CORS")) {
        setErrorMessage("Error de CORS - verifica la configuración del proyecto")
      } else {
        setErrorMessage(errorMessage || "Error desconocido al conectar")
      }
    }
  }

  const resetConfig = () => {
    setConfig({
      url: "",
      anonKey: "",
      serviceKey: ""
    })
    setHasChanges(false)
    setConnectionStatus("idle")
    setErrorMessage("")
    localStorage.removeItem(STORAGE_KEY)
  }

  const createSupabaseClient = () => {
    if (!config.url || !config.anonKey) {
      throw new Error("Configuración de Supabase incompleta")
    }
    return createClient(config.url, config.anonKey)
  }

  return {
    config,
    hasChanges,
    connectionStatus,
    errorMessage,
    updateConfig,
    saveConfig,
    testConnection: () => testConnection(),
    resetConfig,
    createSupabaseClient,
    isConfigValid: Boolean(config.url && config.anonKey)
  }
}