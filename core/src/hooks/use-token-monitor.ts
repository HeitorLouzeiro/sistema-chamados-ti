"use client"

import { useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/lib/api'
import toast from 'react-hot-toast'

/**
 * Hook para monitorar a expiração do token e avisar o usuário
 */
export function useTokenMonitor() {
  const { isAuthenticated, logout } = useAuth()
  const warningShownRef = useRef(false)

  useEffect(() => {
    if (!isAuthenticated) return

    const checkTokenExpiration = () => {
      if (typeof window === 'undefined') return

      const accessToken = localStorage.getItem('access_token')
      if (!accessToken) return

      try {
        // Decodificar o JWT para verificar expiração
        const payload = JSON.parse(atob(accessToken.split('.')[1]))
        const currentTime = Math.floor(Date.now() / 1000)
        const expirationTime = payload.exp
        const timeToExpiry = expirationTime - currentTime

        // Auto logout quando expirar (sem toast)
        if (timeToExpiry <= 0) {
          // Limpar warning para não mostrar novamente
          warningShownRef.current = false
          
          // Logout silencioso após expiração
          setTimeout(() => {
            logout()
          }, 100)
        }
      } catch (error) {
        console.error('Erro ao verificar expiração do token:', error)
        // Se não conseguir decodificar o token, fazer logout
        logout()
      }
    }

    // Verificar imediatamente e depois a cada 10 segundos (mais frequente para tokens curtos)
    checkTokenExpiration()
    const interval = setInterval(checkTokenExpiration, 10000)

    return () => {
      clearInterval(interval)
      warningShownRef.current = false
    }
  }, [isAuthenticated, logout])
}

/**
 * Componente para monitorar automaticamente tokens
 * Adicione este componente no layout principal
 */
export function TokenMonitor() {
  useTokenMonitor()
  return null
}
