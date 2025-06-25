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

        // Avisar quando restam 5 minutos (300 segundos)
        if (timeToExpiry <= 300 && timeToExpiry > 0 && !warningShownRef.current) {
          warningShownRef.current = true
          
          const minutes = Math.floor(timeToExpiry / 60)
          const seconds = timeToExpiry % 60
          
          toast(
            `Sua sessão expirará em ${minutes}:${seconds.toString().padStart(2, '0')}. Salve seu trabalho!`,
            {
              duration: 8000,
              icon: '⏰',
              style: {
                background: '#f59e0b',
                color: '#000',
              },
            }
          )
        }

        // Auto logout quando expirar
        if (timeToExpiry <= 0) {
          toast.error('Sua sessão expirou. Você será redirecionado para o login.', {
            duration: 3000,
            icon: '🔒'
          })
          
          setTimeout(() => {
            logout()
          }, 1500)
        }
      } catch (error) {
        console.error('Erro ao verificar expiração do token:', error)
      }
    }

    // Verificar imediatamente e depois a cada 30 segundos
    checkTokenExpiration()
    const interval = setInterval(checkTokenExpiration, 30000)

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
