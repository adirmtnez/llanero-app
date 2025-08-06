import { useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAdminStore, BreadcrumbItem } from '@/store/admin/admin-store'

export interface NavigationConfig {
  view: string
  path: string
  breadcrumb: BreadcrumbItem[]
}

export const useAdminNavigation = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { setCurrentView, setBreadcrumb, currentView, currentPath } = useAdminStore()

  const navigateToView = useCallback((config: NavigationConfig) => {
    // Update store
    setCurrentView(config.view, config.path)
    setBreadcrumb(config.breadcrumb)
    
    // Navigate with React Router
    navigate(config.path)
  }, [navigate, setCurrentView, setBreadcrumb])

  const navigateToDashboard = useCallback(() => {
    navigateToView({
      view: 'dashboard',
      path: '/',
      breadcrumb: [
        { label: 'Admin', path: '/', isActive: true }
      ]
    })
  }, [navigateToView])

  const navigateToBodegones = useCallback((subPath: string = '') => {
    const fullPath = `/bodegones${subPath}`
    navigateToView({
      view: 'bodegones',
      path: fullPath,
      breadcrumb: [
        { label: 'Admin', path: '/' },
        { label: 'Bodegones', path: '/bodegones', isActive: !subPath },
        ...(subPath ? [{ label: getSubPathLabel(subPath), path: fullPath, isActive: true }] : [])
      ]
    })
  }, [navigateToView])

  const navigateToRestaurantes = useCallback((subPath: string = '') => {
    const fullPath = `/restaurantes${subPath}`
    navigateToView({
      view: 'restaurantes', 
      path: fullPath,
      breadcrumb: [
        { label: 'Admin', path: '/' },
        { label: 'Restaurantes', path: '/restaurantes', isActive: !subPath },
        ...(subPath ? [{ label: getSubPathLabel(subPath), path: fullPath, isActive: true }] : [])
      ]
    })
  }, [navigateToView])

  const navigateToConfiguraciones = useCallback((subPath: string = '') => {
    const fullPath = `/configuraciones${subPath}`
    navigateToView({
      view: 'configuraciones',
      path: fullPath,
      breadcrumb: [
        { label: 'Admin', path: '/' },
        { label: 'Configuraciones', path: '/configuraciones', isActive: !subPath },
        ...(subPath ? [{ label: getSubPathLabel(subPath), path: fullPath, isActive: true }] : [])
      ]
    })
  }, [navigateToView])

  return {
    // Navigation methods
    navigateToView,
    navigateToDashboard,
    navigateToBodegones,
    navigateToRestaurantes,
    navigateToConfiguraciones,
    
    // Current state
    currentView,
    currentPath,
    location
  }
}

// Helper function to get user-friendly labels for sub-paths
function getSubPathLabel(subPath: string): string {
  const pathMap: Record<string, string> = {
    '/productos': 'Productos',
    '/productos/agregar': 'Agregar Producto',
    '/productos/categorias': 'Categorías',
    '/productos/sub-categorias': 'Subcategorías',
    '/configuraciones': 'Configuraciones',
    '/equipo': 'Equipo',
    '/pedidos': 'Pedidos',
    '/metodos-pago': 'Métodos de Pago',
    '/repartidores': 'Repartidores'
  }
  
  return pathMap[subPath] || subPath.replace('/', '').replace('-', ' ')
}