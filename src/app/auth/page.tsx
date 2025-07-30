"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { 
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Info,
  CheckCircle2
} from "lucide-react"

type AuthMode = 'login' | 'register'

export default function AuthPage() {
  const router = useRouter()
  const { signUp, signIn, signInWithGoogle, resetPassword } = useAuth()
  const [activeTab, setActiveTab] = useState<AuthMode>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [registrationComplete, setRegistrationComplete] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  })
  const [registerData, setRegisterData] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: ""
  })

  const handleLoginInputChange = (field: keyof typeof loginData, value: string) => {
    setLoginData(prev => ({
      ...prev,
      [field]: value
    }))
    setError("")
  }

  const handleRegisterInputChange = (field: keyof typeof registerData, value: string) => {
    setRegisterData(prev => ({
      ...prev,
      [field]: value
    }))
    setError("")
    // Limpiar estado de confirmación si el usuario empieza a escribir de nuevo
    if (registrationComplete) {
      setRegistrationComplete(false)
      setRegisteredEmail("")
    }
  }

  const handleGoogleAuth = async () => {
    setIsLoading(true)
    setError("")

    try {
      const { error } = await signInWithGoogle()
      
      if (error) {
        setError(error.message)
      } else {
        toast.success("¡Autenticación con Google exitosa!")
        router.push("/admin")
      }
    } catch (err) {
      setError("Error al autenticar con Google")
    } finally {
      setIsLoading(false)
    }
  }


  const handleLogin = async () => {
    if (!loginData.email.trim()) {
      setError("Por favor ingresa tu correo electrónico")
      return
    }
    if (!loginData.password.trim()) {
      setError("Por favor ingresa tu contraseña")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const { user, error } = await signIn(loginData.email, loginData.password)
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError("Credenciales incorrectas. Verifica tu email y contraseña.")
        } else if (error.message.includes('Email not confirmed')) {
          setError("Por favor verifica tu email antes de iniciar sesión.")
        } else {
          setError(error.message)
        }
        return
      }

      if (user) {
        toast.success("¡Bienvenido de vuelta!")
        router.push("/admin")
      }
    } catch (err) {
      setError("Error al iniciar sesión. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!registerData.email.trim()) {
      setError("Por favor ingresa tu correo electrónico")
      return
    }
    if (!registerData.name.trim()) {
      setError("Por favor ingresa tu nombre")
      return
    }
    if (!registerData.password.trim()) {
      setError("Por favor ingresa una contraseña")
      return
    }
    if (registerData.password !== registerData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }
    if (registerData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    // Validar que la contraseña tenga al menos algunos requisitos básicos
    const passwordStrength = getPasswordStrength(registerData.password)
    if (passwordStrength.strength < 50) {
      setError("Por favor crea una contraseña más segura")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const { user, error } = await signUp(
        registerData.email, 
        registerData.password, 
        registerData.name
      )
      
      if (error) {
        if (error.message.includes('User already registered')) {
          setError("Ya existe una cuenta con este email. Intenta iniciar sesión.")
        } else if (error.message.includes('Password should be at least')) {
          setError("La contraseña debe ser más segura")
        } else {
          setError(error.message)
        }
        return
      }

      if (user) {
        // Guardar email y mostrar estado de confirmación
        setRegisteredEmail(registerData.email)
        setRegistrationComplete(true)
        setError("") // Limpiar errores
        
        // Limpiar formulario
        setRegisterData({
          email: "",
          name: "",
          password: "",
          confirmPassword: ""
        })
        
        // Si el usuario ya está confirmado, redirigir después de un momento
        if (user.email_confirmed_at) {
          setTimeout(() => {
            router.push("/admin")
          }, 2000)
        }
      }
    } catch (err) {
      setError("Error al crear la cuenta. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }


  // Función para evaluar la fuerza de la contraseña
  const getPasswordStrength = (password: string) => {
    const requirements = {
      length: password.length >= 6,
      number: /\d/.test(password),
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }

    const metRequirements = Object.values(requirements).filter(Boolean).length
    
    let strength = 0
    let strengthText = ''
    let strengthColor = ''

    if (password.length === 0) {
      return { strength: 0, text: '', color: '', requirements }
    }

    if (metRequirements <= 2) {
      strength = 25
      strengthText = 'Débil'
      strengthColor = 'bg-red-500'
    } else if (metRequirements === 3) {
      strength = 50
      strengthText = 'Regular'
      strengthColor = 'bg-yellow-500'
    } else if (metRequirements === 4) {
      strength = 75
      strengthText = 'Buena'
      strengthColor = 'bg-blue-500'
    } else {
      strength = 100
      strengthText = 'Muy fuerte'
      strengthColor = 'bg-green-500'
    }

    return { strength, text: strengthText, color: strengthColor, requirements }
  }

  const passwordStrength = getPasswordStrength(registerData.password)

  return (
    <div className="min-h-screen flex">
      {/* Lado izquierdo - Imagen de fondo */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"
        }}
      >
        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Contenido sobre la imagen */}
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-8">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-black">LL</span>
              </div>
              <span className="text-3xl font-bold">Llanero</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Gestiona tu negocio</h2>
              <p className="text-lg opacity-90">
                Conecta restaurantes y bodegones con tus clientes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lado derecho - Formulario */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 py-12 bg-white">
        {/* Botón volver - solo móvil */}
        <div className="lg:hidden absolute top-6 left-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
        </div>

        {/* Logo para móvil */}
        <div className="lg:hidden flex items-center justify-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-xl font-bold text-white">LL</span>
          </div>
          <span className="text-2xl font-bold">Llanero</span>
        </div>

        <div className="w-full max-w-md mx-auto space-y-8">
          {/* Encabezado */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">¡Bienvenido!</h1>
            <p className="text-gray-600">Accede a tu cuenta o crea una nueva</p>
          </div>

          {/* Botón Google */}
          <div className="space-y-4">
            <Button
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="client-button secondary w-full flex items-center justify-center space-x-3"
            >
              <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
                <span className="font-bold text-xs" style={{ color: 'var(--client-accent)' }}>G</span>
              </div>
              <span>Continúa con Google</span>
            </Button>

            {/* Separador */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">O continúa con email</span>
              </div>
            </div>
          </div>

          {/* Pestañas de Login/Register */}
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => {
              setActiveTab(value as AuthMode)
              setError("")
              // Limpiar estado de confirmación al cambiar de pestaña
              if (registrationComplete) {
                setRegistrationComplete(false)
                setRegisteredEmail("")
              }
            }} 
            className="w-full"
          >
            <TabsList className="client-tabs-list grid w-full grid-cols-2">
              <TabsTrigger value="login" className="client-tabs-trigger">Ingresar</TabsTrigger>
              <TabsTrigger value="register" className="client-tabs-trigger">Registrarme</TabsTrigger>
            </TabsList>

            {/* Pestaña de Login */}
            <TabsContent value="login" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login_email">Correo electrónico</Label>
                <Input
                  id="login_email"
                  type="email"
                  placeholder="tu@ejemplo.com"
                  value={loginData.email}
                  onChange={(e) => handleLoginInputChange('email', e.target.value)}
                  className="client-input"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login_password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="login_password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => handleLoginInputChange('password', e.target.value)}
                    className="client-input pr-12"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleLogin}
                disabled={isLoading || !loginData.email.trim() || !loginData.password.trim()}
                className="client-button w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar sesión'
                )}
              </Button>

              <div className="text-center">
                <Button 
                  variant="link" 
                  className="text-sm"
                  style={{ color: 'var(--client-accent)' }}
                  onClick={async () => {
                    if (!loginData.email.trim()) {
                      setError("Por favor ingresa tu correo para recuperar la contraseña")
                      return
                    }
                    try {
                      const { error } = await resetPassword(loginData.email)
                      if (error) {
                        toast.error("Error al enviar email de recuperación")
                      } else {
                        toast.success("Te hemos enviado un email para resetear tu contraseña")
                      }
                    } catch (err) {
                      toast.error("Error al enviar email de recuperación")
                    }
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </Button>
              </div>
            </TabsContent>

            {/* Pestaña de Registro */}
            <TabsContent value="register" className="space-y-4">
              {registrationComplete ? (
                // Estado de confirmación exitosa
                <div className="text-center space-y-6 py-8">
                  <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--client-primary) 20%, transparent)' }}>
                      <CheckCircle2 className="w-12 h-12" style={{ color: 'var(--client-primary)' }} />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-gray-900">¡Cuenta creada!</h2>
                    <div className="space-y-2">
                      <p className="text-gray-600">
                        Te hemos enviado un email de confirmación a:
                      </p>
                      <p className="font-medium text-gray-900">{registeredEmail}</p>
                      <p className="text-sm text-gray-500">
                        Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={() => {
                        // Intentar abrir el cliente de email
                        window.location.href = `mailto:${registeredEmail}`
                      }}
                      className="client-button w-full"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Abrir Email
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => {
                        setRegistrationComplete(false)
                        setRegisteredEmail("")
                        setActiveTab('login')
                      }}
                      className="client-button variant-outline w-full"
                    >
                      Ir a Iniciar Sesión
                    </Button>
                    
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setRegistrationComplete(false)
                        setRegisteredEmail("")
                      }}
                      className="client-button variant-ghost w-full text-sm"
                    >
                      Registrar otra cuenta
                    </Button>
                  </div>
                </div>
              ) : (
                // Formulario de registro normal
                <>
                  <div className="space-y-2">
                    <Label htmlFor="register_email">Correo electrónico</Label>
                    <Input
                      id="register_email"
                      type="email"
                      placeholder="tu@ejemplo.com"
                      value={registerData.email}
                      onChange={(e) => handleRegisterInputChange('email', e.target.value)}
                      className="client-input"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register_name">Nombre completo</Label>
                    <Input
                      id="register_name"
                      type="text"
                      placeholder="Tu nombre completo"
                      value={registerData.name}
                      onChange={(e) => handleRegisterInputChange('name', e.target.value)}
                      className="client-input"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register_password">Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="register_password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={registerData.password}
                        onChange={(e) => handleRegisterInputChange('password', e.target.value)}
                        className="client-input pr-12"
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Barra de fuerza de contraseña */}
                    {registerData.password && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">Fuerza de la contraseña</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-3 w-3 text-gray-400 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <div className="space-y-2">
                                    <p className="font-medium">Tu contraseña debe tener:</p>
                                    <ul className="space-y-1 text-xs">
                                      <li>• Al menos 6 caracteres</li>
                                      <li>• Al menos un número</li>
                                      <li>• Una letra minúscula</li>
                                      <li>• Una letra mayúscula</li>
                                      <li>• Un carácter especial (!@#$%^&*)</li>
                                    </ul>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <span className={`font-medium ${
                            passwordStrength.strength <= 25 ? 'text-red-600' :
                            passwordStrength.strength <= 50 ? 'text-yellow-600' :
                            passwordStrength.strength <= 75 ? 'text-blue-600' : 'text-green-600'
                          }`}>
                            {passwordStrength.text}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                            style={{ width: `${passwordStrength.strength}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register_confirm_password">Confirmar contraseña</Label>
                    <Input
                      id="register_confirm_password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.confirmPassword}
                      onChange={(e) => handleRegisterInputChange('confirmPassword', e.target.value)}
                      className="client-input"
                      disabled={isLoading}
                    />
                  </div>

                  <Button
                    onClick={handleRegister}
                    disabled={isLoading || !registerData.email.trim() || !registerData.name.trim() || !registerData.password.trim() || !registerData.confirmPassword.trim()}
                    className="client-button w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 w-4 mr-2 animate-spin" />
                        Creando cuenta...
                      </>
                    ) : (
                      'Crear cuenta'
                    )}
                  </Button>
                </>
              )}
            </TabsContent>
          </Tabs>

          {/* Mensaje de error */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Términos y condiciones */}
          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>Al continuar, aceptas automáticamente nuestras</p>
            <div className="space-x-2">
              <Link href="/condiciones" className="underline hover:text-gray-700">
                Condiciones
              </Link>
              <span>,</span>
              <Link href="/privacidad" className="underline hover:text-gray-700">
                Política de privacidad
              </Link>
              <span>y</span>
              <Link href="/cookies" className="underline hover:text-gray-700">
                Políticas de cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}