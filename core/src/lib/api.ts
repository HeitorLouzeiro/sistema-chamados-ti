import axios from 'axios'
import toast from 'react-hot-toast'

// Configuração base da API
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  withCredentials: true, // Para enviar cookies de sessão
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token se disponível
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Função para forçar logout e redirecionamento
const forceLogout = (message: string = 'Sua sessão expirou.') => {
  if (typeof window !== 'undefined') {
    // Limpar dados locais
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    
    // Notificar o usuário se não estiver na página de login
    if (!window.location.pathname.includes('/login')) {
      toast.error(message, {
        duration: 4000,
        icon: '🔒'
      })
      
      // Aguardar um momento para o toast aparecer, depois redirecionar
      setTimeout(() => {
        window.location.href = '/login'
      }, 1500)
    } else {
      // Se já estiver na página de login, apenas redirecionar
      window.location.href = '/login'
    }
  }
}

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refresh_token')
        
        if (refreshToken) {
          try {
            // Tentar renovar o token
            const response = await api.post('/usuarios/token/refresh/', {
              refresh: refreshToken
            })
            
            const newAccessToken = response.data.access
            localStorage.setItem('access_token', newAccessToken)
            
            // Retry da requisição original
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            return api(originalRequest)
          } catch (refreshError) {
            // Se falhar no refresh, forçar logout
            console.error('Erro ao renovar token:', refreshError)
            forceLogout('Sua sessão expirou. Você será redirecionado para o login.')
          }
        } else {
          // Sem refresh token, forçar logout
          forceLogout('Você precisa fazer login novamente.')
        }
      }
    }
    
    // Para outros erros, apenas rejeitar
    return Promise.reject(error)
  }
)

// Tipos TypeScript
export interface Usuario {
  id: number
  username: string
  email: string
  nome_completo: string
  tipo_usuario: 'admin' | 'tecnico' | 'usuario'
  departamento?: string
  telefone?: string
  ativo: boolean
  iniciais: string
  criado_em: string
  atualizado_em: string
}

export interface TipoServico {
  id: number
  nome: string
  descricao?: string
  ativo: boolean
}

export interface Chamado {
  id: number
  numero: string
  titulo: string
  descricao: string
  tipo_servico: TipoServico
  status: 'aberto' | 'em_atendimento' | 'encerrado' | 'cancelado'
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente'
  equipamento?: string
  localizacao?: string
  solicitante: Usuario
  tecnico_responsavel?: Usuario
  observacoes_tecnico?: string
  criado_em: string
  atualizado_em: string
  atendido_em?: string
  encerrado_em?: string
  anexos?: AnexoChamado[]
  historico?: HistoricoChamado[]
}

export interface ChamadoCreate {
  titulo: string
  descricao: string
  tipo_servico: number
  prioridade?: string
  equipamento?: string
  localizacao?: string
}

export interface ChamadoUpdate {
  titulo?: string
  descricao?: string
  status?: string
  prioridade?: string
  equipamento?: string
  localizacao?: string
  tecnico_responsavel?: number
  observacoes_tecnico?: string
}

export interface AnexoChamado {
  id: number
  nome_original: string
  arquivo: string
  tamanho: number
  tamanho_formatado: string
  tipo_arquivo: string
  enviado_por: Usuario
  criado_em: string
}

export interface HistoricoChamado {
  id: number
  tipo_acao: string
  descricao: string
  usuario: Usuario
  criado_em: string
}

export interface EstatisticasDashboard {
  total_chamados: number
  chamados_abertos: number
  chamados_em_atendimento: number
  chamados_encerrados: number
  chamados_urgentes: number
  meus_chamados: number
  meus_chamados_pendentes: number
}

// Serviços da API

// Autenticação
export const authService = {
  async login(username: string, password: string) {
    const response = await api.post('/usuarios/login/', { username, password })
    
    // Armazenar tokens JWT
    if (response.data.access && response.data.refresh) {
      localStorage.setItem('access_token', response.data.access)
      localStorage.setItem('refresh_token', response.data.refresh)
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
    }
    
    return response.data
  },

  async logout() {
    try {
      // Com JWT stateless, chamada opcional para logs no servidor
      await api.post('/usuarios/logout/')
    } catch (error) {
      // Mesmo se falhar no servidor, não é problema crítico
      console.error('Erro no logout:', error)
    } finally {
      // Sempre limpar dados locais - isso é o que realmente "faz" o logout
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
    }
  },

  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) {
      throw new Error('Refresh token não encontrado')
    }
    
    const response = await api.post('/usuarios/token/refresh/', {
      refresh: refreshToken
    })
    
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access)
    }
    
    return response.data
  },

  async getPerfil(): Promise<Usuario> {
    const response = await api.get('/usuarios/perfil/')
    return response.data
  },

  async atualizarPerfil(dados: Partial<Usuario>): Promise<Usuario> {
    const response = await api.put('/usuarios/perfil/atualizar/', dados)
    return response.data
  },
}

// Usuários
export const usuarioService = {
  async listar(params?: any): Promise<{ results: Usuario[], count: number }> {
    const response = await api.get('/usuarios/', { params })
    return response.data
  },

  async obter(id: number): Promise<Usuario> {
    const response = await api.get(`/usuarios/${id}/`)
    return response.data
  },

  async criar(dados: any): Promise<Usuario> {
    const response = await api.post('/usuarios/', dados)
    return response.data
  },

  async atualizar(id: number, dados: Partial<Usuario>): Promise<Usuario> {
    const response = await api.put(`/usuarios/${id}/`, dados)
    return response.data
  },

  async deletar(id: number): Promise<void> {
    await api.delete(`/usuarios/${id}/`)
  },

  async listarTecnicos(): Promise<Usuario[]> {
    const response = await api.get('/usuarios/tecnicos/')
    return response.data
  },
}

// Chamados
export const chamadoService = {
  async listar(params?: any): Promise<{ results: Chamado[], count: number }> {
    const response = await api.get('/chamados/', { params })
    return response.data
  },

  async obter(id: number): Promise<Chamado> {
    const response = await api.get(`/chamados/${id}/`)
    return response.data
  },

  async criar(dados: ChamadoCreate): Promise<Chamado> {
    const response = await api.post('/chamados/', dados)
    return response.data
  },

  async atualizar(id: number, dados: ChamadoUpdate): Promise<Chamado> {
    const response = await api.patch(`/chamados/${id}/`, dados)
    return response.data
  },

  async atualizarStatus(id: number, status: string): Promise<Chamado> {
    const response = await api.patch(`/chamados/${id}/status/`, { status })
    return response.data
  },

  async deletar(id: number): Promise<void> {
    await api.delete(`/chamados/${id}/`)
  },

  async meusChamados(params?: any): Promise<Chamado[]> {
    const response = await api.get('/chamados/meus-chamados/', { params })
    return response.data
  },

  async chamadosTecnico(params?: any): Promise<Chamado[]> {
    const response = await api.get('/chamados/chamados-tecnico/', { params })
    return response.data
  },

  async uploadAnexo(chamadoId: number, arquivo: File): Promise<AnexoChamado> {
    const formData = new FormData()
    formData.append('arquivo', arquivo)
    
    const response = await api.post(`/chamados/${chamadoId}/anexos/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async deletarAnexo(anexoId: number): Promise<void> {
    await api.delete(`/chamados/anexos/${anexoId}/`)
  },

  async obterEstatisticas(): Promise<EstatisticasDashboard> {
    const response = await api.get('/chamados/estatisticas/')
    return response.data
  },
}

// Tipos de Serviço
export const tipoServicoService = {
  async listar(): Promise<TipoServico[]> {
    const response = await api.get('/chamados/tipos-servico/')
    return response.data
  },
}

export default api

// Exportar a função forceLogout para uso externo se necessário
export { forceLogout }
