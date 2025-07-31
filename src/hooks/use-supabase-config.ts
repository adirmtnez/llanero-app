"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { useAppSettings } from "./use-app-settings"

export interface SupabaseConfig {
  url: string
  anonKey: string
  serviceKey: string
}

const STORAGE_KEY = "llanero-supabase-config"
const DB_KEY = "supabase_config"

export function useSupabaseConfig() {
  const [config, setConfig] = useState<SupabaseConfig>({
    url: "",
    anonKey: "",
    serviceKey: ""
  })
  const [hasChanges, setHasChanges] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoadingFromDB, setIsLoadingFromDB] = useState(false)

  // Helper functions to interact with database directly
  const loadConfigFromDB = async (tempConfig: SupabaseConfig) => {
    if (!tempConfig.url || tempConfig.url.trim() === '' || !tempConfig.serviceKey || tempConfig.serviceKey.trim() === '') {
      throw new Error("Configuración temporal incompleta")
    }

    // Validar formato antes de intentar conexión
    let url: URL
    try {
      url = new URL(tempConfig.url.trim())
    } catch (urlError) {
      throw new Error("Formato de URL inválido en configuración temporal")
    }

    if (!url.hostname.includes('supabase') || !url.protocol.startsWith('https')) {
      throw new Error("URL de configuración temporal inválida")
    }

    if (!tempConfig.serviceKey.trim().startsWith('eyJ')) {
      throw new Error("Clave de servicio temporal inválida")
    }

    const supabase = createClient(tempConfig.url, tempConfig.serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', DB_KEY)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No se encontró el registro, devolver null
        return null
      }
      throw error
    }

    return data?.value || null
  }

  const saveConfigToDB = async (configToSave: SupabaseConfig) => {
    if (!configToSave.url || configToSave.url.trim() === '' || !configToSave.serviceKey || configToSave.serviceKey.trim() === '') {
      throw new Error("Configuración incompleta para guardar")
    }

    // Validar formato antes de intentar guardar
    let url: URL
    try {
      url = new URL(configToSave.url.trim())
    } catch (urlError) {
      throw new Error("Formato de URL inválido para guardar")
    }

    if (!url.hostname.includes('supabase') || !url.protocol.startsWith('https')) {
      throw new Error("URL inválida para guardar")
    }

    if (!configToSave.serviceKey.trim().startsWith('eyJ')) {
      throw new Error("Clave de servicio inválida para guardar")
    }

    if (!configToSave.anonKey || configToSave.anonKey.trim() === '' || !configToSave.anonKey.trim().startsWith('eyJ')) {
      throw new Error("Clave anónima inválida para guardar")
    }

    const supabase = createClient(configToSave.url, configToSave.serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { error } = await supabase
      .from('app_settings')
      .upsert({
        key: DB_KEY,
        value: configToSave,
        description: 'Configuración de conexión a Supabase',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      })

    if (error) throw error
    return true
  }

  // Load config from database or localStorage on mount
  useEffect(() => {
    const loadConfig = async () => {
      const autoTestConnection = async (configToTest: SupabaseConfig) => {
        setConnectionStatus("testing")
        setErrorMessage("")

        try {
          // Check if URL is provided and not empty
          if (!configToTest.url || configToTest.url.trim() === '') {
            throw new Error("URL es requerida")
          }

          // Check if anonKey is provided and not empty
          if (!configToTest.anonKey || configToTest.anonKey.trim() === '') {
            throw new Error("Clave anónima es requerida")
          }

          // Validate URL format more strictly
          let url: URL
          try {
            url = new URL(configToTest.url.trim())
          } catch (urlError) {
            throw new Error("Formato de URL inválido")
          }

          if (!url.hostname.includes('supabase') || !url.protocol.startsWith('https')) {
            throw new Error("La URL debe ser HTTPS de Supabase (ej: https://proyecto.supabase.co)")
          }

          // Validate key format - should be JWT-like
          if (!configToTest.anonKey.trim().startsWith('eyJ')) {
            throw new Error("La clave anónima debe ser un JWT válido")
          }

          const supabase = createClient(configToTest.url, configToTest.anonKey)
          
          // Test connection using auth.getSession() - more reliable
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
          
          // Check if we can make basic requests - session missing is normal for new projects
          if (sessionError && !sessionError.message.includes('Auth session missing')) {
            throw sessionError
          }
          
          // Try a simple auth operation to verify the connection
          const { error: userError } = await supabase.auth.getUser()
          
          // These errors are acceptable and indicate the connection works
          if (userError) {
            const acceptableErrors = [
              'auth session missing',
              'jwt expired',
              'invalid jwt',
              'no jwt provided',
              'session not found'
            ]
            
            const errorMsg = userError.message?.toLowerCase() || ''
            const isAcceptableError = acceptableErrors.some(acceptableError => 
              errorMsg.includes(acceptableError)
            )
            
            if (!isAcceptableError) {
              throw userError
            }
          }

          setConnectionStatus("success")
        } catch (error: unknown) {
          console.error("Supabase connection test failed:", error)
          setConnectionStatus("error")
          
          // Better error message extraction
          let errorMessage = "Error desconocido al conectar"
          
          if (error instanceof Error) {
            errorMessage = error.message
          } else if (typeof error === 'object' && error !== null) {
            // Handle Supabase error objects
            const supaError = error as any
            if (supaError.message) {
              errorMessage = supaError.message
            } else if (supaError.error_description) {
              errorMessage = supaError.error_description
            } else if (supaError.details) {
              errorMessage = supaError.details
            } else {
              errorMessage = JSON.stringify(error)
            }
          } else if (error) {
            errorMessage = String(error)
          }
          
          // Categorize error messages
          const lowerErrorMsg = errorMessage.toLowerCase()
          
          if (lowerErrorMsg.includes("invalid api key") || lowerErrorMsg.includes("invalid jwt") || lowerErrorMsg.includes("jwt")) {
            setErrorMessage("Clave API inválida o formato incorrecto")
          } else if (lowerErrorMsg.includes("invalid url") || lowerErrorMsg.includes("fetch")) {
            setErrorMessage("URL inválida o no accesible")
          } else if (lowerErrorMsg.includes("network") || lowerErrorMsg.includes("failed to fetch")) {
            setErrorMessage("Error de conexión de red")
          } else if (lowerErrorMsg.includes("cors")) {
            setErrorMessage("Error de CORS - verifica la configuración del proyecto")
          } else if (lowerErrorMsg.includes("unauthorized") || lowerErrorMsg.includes("403")) {
            setErrorMessage("Acceso no autorizado - verifica las claves")
          } else if (lowerErrorMsg.includes("not found") || lowerErrorMsg.includes("404")) {
            setErrorMessage("Proyecto no encontrado - verifica la URL")
          } else {
            setErrorMessage(`Error de conexión: ${errorMessage}`)
          }
        }
      }

      // Primero cargar desde localStorage (más confiable)
      let localConfig: SupabaseConfig | null = null
      
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          localConfig = JSON.parse(saved)
          if (localConfig) {
            setConfig(localConfig)
            
            // Auto-test connection if config exists
            if (localConfig.url && localConfig.anonKey) {
              autoTestConnection(localConfig)
            }
          }
        }
      } catch (error) {
        console.error("Error loading Supabase config from localStorage:", error)
      }

      // Si tenemos configuración local válida, intentar sincronizar con la base de datos
      if (localConfig && localConfig.url && localConfig.serviceKey) {
        try {
          setIsLoadingFromDB(true)
          const dbConfig = await loadConfigFromDB(localConfig)
          
          if (dbConfig && typeof dbConfig === 'object' && dbConfig.url && dbConfig.anonKey) {
            // Asegurar que dbConfig tiene la estructura completa
            const completeDbConfig = {
              url: dbConfig.url || "",
              anonKey: dbConfig.anonKey || "", 
              serviceKey: dbConfig.serviceKey || localConfig.serviceKey || ""
            }
            
            // Comparar configuraciones de manera más confiable
            const configsAreEqual = (
              completeDbConfig.url === localConfig.url &&
              completeDbConfig.anonKey === localConfig.anonKey &&
              completeDbConfig.serviceKey === localConfig.serviceKey
            )
            
            if (!configsAreEqual) {
              console.log("Configuración de la BD es diferente, actualizando...")
              setConfig(completeDbConfig)
              localStorage.setItem(STORAGE_KEY, JSON.stringify(completeDbConfig))
              
              if (completeDbConfig.url && completeDbConfig.anonKey) {
                autoTestConnection(completeDbConfig)
              }
            }
          } else {
            // No hay configuración en la BD, guardar la local
            console.log("No hay configuración en BD, guardando la local...")
            await saveConfigToDB(localConfig)
          }
        } catch (error) {
          console.log("Error sincronizando con la base de datos:", error)
          // Continuar con la configuración local
        } finally {
          setIsLoadingFromDB(false)
        }
      }
    }

    loadConfig()
  }, [])

  const updateConfig = (field: keyof SupabaseConfig, value: string) => {
    // Basic validation for the field
    const trimmedValue = value.trim()
    
    // Validate URL field
    if (field === 'url' && trimmedValue) {
      try {
        const url = new URL(trimmedValue)
        if (!url.protocol.startsWith('https')) {
          setErrorMessage("La URL debe usar HTTPS")
        } else if (!url.hostname.includes('supabase')) {
          setErrorMessage("La URL debe ser de Supabase")
        } else {
          setErrorMessage("")
        }
      } catch {
        if (trimmedValue.length > 0) {
          setErrorMessage("Formato de URL inválido")
        } else {
          setErrorMessage("")
        }
      }
    }
    
    // Validate key fields
    if ((field === 'anonKey' || field === 'serviceKey') && trimmedValue) {
      if (!trimmedValue.startsWith('eyJ')) {
        setErrorMessage("Las claves deben ser JWT válidos (empiezan con 'eyJ')")
      } else {
        setErrorMessage("")
      }
    }
    
    setConfig(prev => ({
      ...prev,
      [field]: trimmedValue
    }))
    setHasChanges(true)
    setConnectionStatus("idle")
  }

  const saveConfig = async () => {
    try {
      // Validar configuración antes de guardar
      if (!config.url || config.url.trim() === '' || !config.anonKey || config.anonKey.trim() === '') {
        setErrorMessage("URL y clave anónima son requeridos")
        return false
      }

      // Validar formato de URL
      let url: URL
      try {
        url = new URL(config.url.trim())
      } catch (urlError) {
        setErrorMessage("Formato de URL inválido")
        return false
      }

      if (!url.protocol.startsWith('https') || !url.hostname.includes('supabase')) {
        setErrorMessage("URL inválida - debe ser HTTPS de Supabase")
        return false
      }

      // Validar formato de claves
      if (!config.anonKey.trim().startsWith('eyJ')) {
        setErrorMessage("La clave anónima debe ser un JWT válido")
        return false
      }

      if (config.serviceKey && config.serviceKey.trim() !== '' && !config.serviceKey.trim().startsWith('eyJ')) {
        setErrorMessage("La clave de servicio debe ser un JWT válido")
        return false
      }

      // Guardar en localStorage como respaldo
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
      
      // Intentar guardar en la base de datos si tenemos service key
      if (config.url && config.serviceKey) {
        try {
          await saveConfigToDB(config)
          console.log("Configuración guardada en la base de datos")
        } catch (dbError) {
          console.warn("Error guardando en DB:", dbError)
          // Continuar, al menos tenemos localStorage
        }
      }
      
      setHasChanges(false)
      setErrorMessage("")
      return true
    } catch (error) {
      console.error("Error saving Supabase config:", error)
      setErrorMessage("Error guardando la configuración")
      return false
    }
  }

  const testConnection = async (configToTest?: SupabaseConfig) => {
    const testConfig = configToTest || config
    
    // Check if URL is provided and not empty
    if (!testConfig.url || testConfig.url.trim() === '') {
      setConnectionStatus("error")
      setErrorMessage("URL es requerida")
      return
    }

    // Check if anonKey is provided and not empty
    if (!testConfig.anonKey || testConfig.anonKey.trim() === '') {
      setConnectionStatus("error")
      setErrorMessage("Clave anónima es requerida")
      return
    }

    setConnectionStatus("testing")
    setErrorMessage("")

    try {
      // Validate URL format more strictly
      let url: URL
      try {
        url = new URL(testConfig.url.trim())
      } catch (urlError) {
        throw new Error("Formato de URL inválido")
      }

      if (!url.hostname.includes('supabase') || !url.protocol.startsWith('https')) {
        throw new Error("La URL debe ser HTTPS de Supabase (ej: https://proyecto.supabase.co)")
      }

      // Validate key format - should be JWT-like
      if (!testConfig.anonKey.trim().startsWith('eyJ')) {
        throw new Error("La clave anónima debe ser un JWT válido")
      }

      const supabase = createClient(testConfig.url, testConfig.anonKey)
      
      // Test connection using auth.getSession() - more reliable
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      // Check if we can make basic requests - session missing is normal for new projects
      if (sessionError && !sessionError.message.includes('Auth session missing')) {
        throw sessionError
      }
      
      // Try a simple auth operation to verify the connection
      const { error: userError } = await supabase.auth.getUser()
      
      // These errors are acceptable and indicate the connection works
      if (userError) {
        const acceptableErrors = [
          'auth session missing',
          'jwt expired',
          'invalid jwt',
          'no jwt provided',
          'session not found'
        ]
        
        const errorMsg = userError.message?.toLowerCase() || ''
        const isAcceptableError = acceptableErrors.some(acceptableError => 
          errorMsg.includes(acceptableError)
        )
        
        if (!isAcceptableError) {
          throw userError
        }
      }

      setConnectionStatus("success")
    } catch (error: unknown) {
      console.error("Supabase connection test failed:", error)
      setConnectionStatus("error")
      
      // Better error message extraction
      let errorMessage = "Error desconocido al conectar"
      
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null) {
        // Handle Supabase error objects
        const supaError = error as any
        if (supaError.message) {
          errorMessage = supaError.message
        } else if (supaError.error_description) {
          errorMessage = supaError.error_description
        } else if (supaError.details) {
          errorMessage = supaError.details
        } else {
          errorMessage = JSON.stringify(error)
        }
      } else if (error) {
        errorMessage = String(error)
      }
      
      // Categorize error messages
      const lowerErrorMsg = errorMessage.toLowerCase()
      
      if (lowerErrorMsg.includes("invalid api key") || lowerErrorMsg.includes("invalid jwt") || lowerErrorMsg.includes("jwt")) {
        setErrorMessage("Clave API inválida o formato incorrecto")
      } else if (lowerErrorMsg.includes("invalid url") || lowerErrorMsg.includes("fetch")) {
        setErrorMessage("URL inválida o no accesible")
      } else if (lowerErrorMsg.includes("network") || lowerErrorMsg.includes("failed to fetch")) {
        setErrorMessage("Error de conexión de red")
      } else if (lowerErrorMsg.includes("cors")) {
        setErrorMessage("Error de CORS - verifica la configuración del proyecto")
      } else if (lowerErrorMsg.includes("unauthorized") || lowerErrorMsg.includes("403")) {
        setErrorMessage("Acceso no autorizado - verifica las claves")
      } else if (lowerErrorMsg.includes("not found") || lowerErrorMsg.includes("404")) {
        setErrorMessage("Proyecto no encontrado - verifica la URL")
      } else {
        setErrorMessage(`Error de conexión: ${errorMessage}`)
      }
    }
  }

  const resetConfig = async () => {
    const emptyConfig = { url: "", anonKey: "", serviceKey: "" }
    
    // Intentar limpiar la base de datos primero con la configuración actual
    if (config.url && config.serviceKey) {
      try {
        const supabase = createClient(config.url, config.serviceKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        })

        const { error } = await supabase
          .from('app_settings')
          .delete()
          .eq('key', DB_KEY)

        if (error) {
          console.warn("Error eliminando configuración de la base de datos:", error)
        } else {
          console.log("Configuración eliminada de la base de datos")
        }
      } catch (error) {
        console.warn("No se pudo limpiar la configuración de la base de datos:", error)
      }
    }
    
    setConfig(emptyConfig)
    setHasChanges(false)
    setConnectionStatus("idle")
    setErrorMessage("")
    
    // Limpiar localStorage
    localStorage.removeItem(STORAGE_KEY)
  }

  const createSupabaseClient = (useServiceKey = false) => {
    if (!config.url || !config.anonKey) {
      throw new Error("Configuración de Supabase incompleta")
    }
    
    // Si se solicita service key y está disponible, usarlo
    if (useServiceKey && config.serviceKey) {
      return createClient(config.url, config.serviceKey)
    }
    
    return createClient(config.url, config.anonKey)
  }

  return {
    config,
    hasChanges,
    connectionStatus,
    errorMessage,
    isLoadingFromDB,
    updateConfig,
    saveConfig,
    testConnection: () => testConnection(),
    resetConfig,
    createSupabaseClient,
    isConfigValid: Boolean(config.url && config.anonKey)
  }
}