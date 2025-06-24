"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Usuario, authService } from '@/lib/api'

interface AuthContextType {
  usuario: Usuario | null
  loading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  atualizarUsuario: (dadosUsuario: Usuario) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  const isAuthenticated = !!usuario

  useEffect(() => {
    carregarUsuario()
  }, [])

  const carregarUsuario = async () => {
    try {
      // Verificar se existe dados do usuário no localStorage
      const usuarioSalvo = localStorage.getItem('user')
      if (usuarioSalvo) {
        setUsuario(JSON.parse(usuarioSalvo))
      }

      // Tentar buscar perfil atualizado da API
      const perfilAtualizado = await authService.getPerfil()
      setUsuario(perfilAtualizado)
      localStorage.setItem('user', JSON.stringify(perfilAtualizado))
    } catch (error) {
      // Se falhar, limpar dados locais
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      setUsuario(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (username: string, password: string) => {
    try {
      await authService.login(username, password)
      
      // Após login bem-sucedido, buscar dados do usuário
      const perfil = await authService.getPerfil()
      setUsuario(perfil)
      localStorage.setItem('user', JSON.stringify(perfil))
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      // Mesmo se der erro na API, limpar dados locais
      console.error('Erro ao fazer logout:', error)
    } finally {
      setUsuario(null)
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    }
  }

  const atualizarUsuario = (dadosUsuario: Usuario) => {
    setUsuario(dadosUsuario)
    localStorage.setItem('user', JSON.stringify(dadosUsuario))
  }

  const value: AuthContextType = {
    usuario,
    loading,
    isAuthenticated,
    login,
    logout,
    atualizarUsuario,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
