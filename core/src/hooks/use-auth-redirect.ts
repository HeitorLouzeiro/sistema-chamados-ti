"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

interface UseAuthRedirectOptions {
  redirectTo?: string
  requireAuth?: boolean
  showToast?: boolean
}

/**
 * Hook para verificar autenticação e redirecionar quando necessário
 */
export function useAuthRedirect(options: UseAuthRedirectOptions = {}) {
  const {
    redirectTo = '/login',
    requireAuth = true,
    showToast = true
  } = options

  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Aguardar o carregamento inicial
    if (loading) return

    // Se requer autenticação e não está autenticado
    if (requireAuth && !isAuthenticated) {
      // Aguardar um momento antes de redirecionar
      setTimeout(() => {
        router.replace(redirectTo)
      }, 100)
    }
  }, [isAuthenticated, loading, requireAuth, redirectTo, showToast, router])

  return {
    isAuthenticated,
    loading,
    shouldRedirect: requireAuth && !isAuthenticated && !loading
  }
}

/**
 * Hook para verificar se o usuário já está logado e redirecionar para o dashboard
 * Útil para páginas como login que não devem ser acessadas quando já logado
 */
export function useRedirectIfAuthenticated(redirectTo: string = '/dashboard') {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Aguardar carregamento inicial terminar
    if (loading) return

    // Se estiver autenticado, aguardar um pouco antes de redirecionar
    // para dar tempo de processar qualquer erro de login
    if (isAuthenticated) {
      const timeoutId = setTimeout(() => {
        router.replace(redirectTo)
      }, 500) // Delay de 500ms

      return () => clearTimeout(timeoutId)
    }
  }, [isAuthenticated, loading, redirectTo, router])

  return {
    isAuthenticated,
    loading,
    shouldRedirect: !loading && isAuthenticated
  }
}
