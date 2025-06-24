import axios from 'axios'

// Configuração base da API
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001',
  withCredentials: true, // Para enviar cookies de sessão
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token se disponível
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
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

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
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
    const response = await api.post('/api/usuarios/login/', { username, password })
    return response.data
  },

  async logout() {
    await api.post('/api/usuarios/logout/')
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },

  async getPerfil(): Promise<Usuario> {
    const response = await api.get('/api/usuarios/perfil/')
    return response.data
  },

  async atualizarPerfil(dados: Partial<Usuario>): Promise<Usuario> {
    const response = await api.put('/api/usuarios/perfil/atualizar/', dados)
    return response.data
  },
}

// Usuários
export const usuarioService = {
  async listar(params?: any): Promise<{ results: Usuario[], count: number }> {
    const response = await api.get('/api/usuarios/', { params })
    return response.data
  },

  async obter(id: number): Promise<Usuario> {
    const response = await api.get(`/api/usuarios/${id}/`)
    return response.data
  },

  async criar(dados: any): Promise<Usuario> {
    const response = await api.post('/api/usuarios/', dados)
    return response.data
  },

  async atualizar(id: number, dados: Partial<Usuario>): Promise<Usuario> {
    const response = await api.put(`/api/usuarios/${id}/`, dados)
    return response.data
  },

  async deletar(id: number): Promise<void> {
    await api.delete(`/api/usuarios/${id}/`)
  },

  async listarTecnicos(): Promise<Usuario[]> {
    const response = await api.get('/api/usuarios/tecnicos/')
    return response.data
  },
}

// Chamados
export const chamadoService = {
  async listar(params?: any): Promise<{ results: Chamado[], count: number }> {
    const response = await api.get('/api/chamados/', { params })
    return response.data
  },

  async obter(id: number): Promise<Chamado> {
    const response = await api.get(`/api/chamados/${id}/`)
    return response.data
  },

  async criar(dados: ChamadoCreate): Promise<Chamado> {
    const response = await api.post('/api/chamados/', dados)
    return response.data
  },

  async atualizar(id: number, dados: ChamadoUpdate): Promise<Chamado> {
    const response = await api.put(`/api/chamados/${id}/`, dados)
    return response.data
  },

  async atualizarStatus(id: number, status: string): Promise<Chamado> {
    const response = await api.patch(`/api/chamados/${id}/status/`, { status })
    return response.data
  },

  async deletar(id: number): Promise<void> {
    await api.delete(`/api/chamados/${id}/`)
  },

  async meusChamados(params?: any): Promise<Chamado[]> {
    const response = await api.get('/api/chamados/meus-chamados/', { params })
    return response.data
  },

  async chamadosTecnico(params?: any): Promise<Chamado[]> {
    const response = await api.get('/api/chamados/chamados-tecnico/', { params })
    return response.data
  },

  async uploadAnexo(chamadoId: number, arquivo: File): Promise<AnexoChamado> {
    const formData = new FormData()
    formData.append('arquivo', arquivo)
    
    const response = await api.post(`/api/chamados/${chamadoId}/anexos/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async deletarAnexo(anexoId: number): Promise<void> {
    await api.delete(`/api/chamados/anexos/${anexoId}/`)
  },

  async obterEstatisticas(): Promise<EstatisticasDashboard> {
    const response = await api.get('/api/chamados/estatisticas/')
    return response.data
  },
}

// Tipos de Serviço
export const tipoServicoService = {
  async listar(): Promise<TipoServico[]> {
    const response = await api.get('/api/chamados/tipos-servico/')
    return response.data
  },
}

export default api
