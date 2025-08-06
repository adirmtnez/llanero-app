"use client"

import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugAuthPage() {
  const { user, loading, isConfigured } = useAuth()
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [localStorage, setLocalStorage] = useState<string>('')

  useEffect(() => {
    const checkSession = async () => {
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession()
        setSessionInfo(session)
      }
    }
    
    checkSession()
    
    // Check localStorage
    if (typeof window !== 'undefined') {
      const keys = Object.keys(window.localStorage).filter(key => 
        key.includes('supabase') || key.includes('auth')
      )
      const storageData = keys.map(key => ({
        key,
        value: window.localStorage.getItem(key)
      }))
      setLocalStorage(JSON.stringify(storageData, null, 2))
    }
  }, [])

  const clearStorage = () => {
    if (typeof window !== 'undefined') {
      const keys = Object.keys(window.localStorage).filter(key => 
        key.includes('supabase')
      )
      keys.forEach(key => window.localStorage.removeItem(key))
      window.location.reload()
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Debug Auth Information</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Auth Context State</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify({ 
                user: user ? {
                  id: user.id,
                  email: user.email,
                  full_name: user.full_name
                } : null,
                loading,
                isConfigured 
              }, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supabase Session</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {sessionInfo ? JSON.stringify({
                user: sessionInfo.user ? {
                  id: sessionInfo.user.id,
                  email: sessionInfo.user.email,
                  email_confirmed_at: sessionInfo.user.email_confirmed_at
                } : null,
                expires_at: sessionInfo.expires_at,
                access_token: sessionInfo.access_token ? 'present' : 'missing'
              }, null, 2) : 'No session'}
            </pre>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Local Storage</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {localStorage || 'No auth-related localStorage found'}
            </pre>
            <Button onClick={clearStorage} variant="destructive" className="mt-4">
              Clear Auth Storage
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Environment</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify({
              url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
              anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing',
              environment: process.env.NODE_ENV,
              userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
            }, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}