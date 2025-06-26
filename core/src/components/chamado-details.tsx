"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Calendar, User, MapPin, Monitor, FileText, Image as ImageIcon, Download, Edit, Loader2, Save } from "lucide-react"
import { ImageModal } from "@/components/image-modal"
import { chamadoService, type Chamado } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import toast from "react-hot-toast"

interface ChamadoDetailsProps {
  chamadoId: string
}

function getStatusVariant(status: string) {
  switch (status) {
    case "aberto":
      return "destructive"
    case "em-atendimento":
      return "default"
    case "encerrado":
      return "secondary"
    default:
      return "outline"
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "aberto":
      return "Aberto"
    case "em_atendimento":
      return "Em Atendimento"
    case "encerrado":
      return "Encerrado"
    default:
      return status
  }
}

function formatarData(data: string) {
  if (!data) return 'Data não disponível'
  
  try {
    const date = new Date(data)
    if (isNaN(date.getTime())) {
      return 'Data inválida'
    }
    
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('Erro ao formatar data:', error)
    return 'Erro na data'
  }
}

export function ChamadoDetails({ chamadoId }: ChamadoDetailsProps) {
  const router = useRouter()
  const { usuario } = useAuth()
  const [chamado, setChamado] = useState<Chamado | null>(null)
  const [loading, setLoading] = useState(true)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [observacoes, setObservacoes] = useState("")
  const [editandoObservacoes, setEditandoObservacoes] = useState(false)
  const [salvandoObservacoes, setSalvandoObservacoes] = useState(false)

  useEffect(() => {
    const carregarChamado = async () => {
      try {
        setLoading(true)
        const chamadoData = await chamadoService.obter(parseInt(chamadoId))
        console.log('Dados do chamado carregados:', chamadoData) // Debug
        console.log('Tipo serviço carregado:', chamadoData.tipo_servico) // Debug específico
        console.log('Solicitante carregado:', chamadoData.solicitante) // Debug específico
        console.log('Técnico responsável carregado:', chamadoData.tecnico_responsavel) // Debug específico
        setChamado(chamadoData)
        setObservacoes(chamadoData.observacoes_tecnico || "")
      } catch (error) {
        console.error('Erro ao carregar chamado:', error)
        toast.error("Erro ao carregar os detalhes do chamado")
      } finally {
        setLoading(false)
      }
    }

    if (chamadoId) {
      carregarChamado()
    }
  }, [chamadoId])

  const handleStatusUpdate = async (novoStatus: string) => {
    if (!chamado || !usuario) return

    const toastId = toast.loading("Atualizando status do chamado...")

    try {
      // Se está iniciando o atendimento e não há técnico responsável, atribuir o usuário atual
      if (novoStatus === "em_atendimento" && !chamado.tecnico_responsavel && (usuario.tipo_usuario === 'tecnico' || usuario.tipo_usuario === 'admin')) {
        // Atualizar o chamado com o técnico responsável e o status
        await chamadoService.atualizar(chamado.id, {
          status: novoStatus,
          tecnico_responsavel: usuario.id
        })
        toast.success("Chamado assumido e atendimento iniciado!", { id: toastId })
      } else {
        // Apenas atualizar o status
        await chamadoService.atualizarStatus(chamado.id, novoStatus)
        
        const statusMessage = {
          'em_atendimento': 'Atendimento iniciado com sucesso!',
          'encerrado': 'Chamado encerrado com sucesso!'
        }[novoStatus] || 'Status atualizado com sucesso!'
        
        toast.success(statusMessage, { id: toastId })
      }

      console.log('Status atualizado, recarregando dados completos...')
      
      // Recarregar os dados completos do chamado
      const chamadoCompleto = await chamadoService.obter(chamado.id)
      console.log('Dados completos recarregados após atualizar status:', chamadoCompleto)
      
      setChamado(chamadoCompleto)
      console.log("Status do chamado atualizado com sucesso")
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      toast.error("Erro ao atualizar o status do chamado", { id: toastId })
    }
  }

  const handleSalvarObservacoes = async () => {
    if (!chamado || !usuario) return

    const toastId = toast.loading("Salvando observações...")

    try {
      setSalvandoObservacoes(true)
      
      // Primeiro, salvar as observações
      await chamadoService.atualizar(chamado.id, {
        observacoes_tecnico: observacoes
      })
      
      console.log('Observações salvas, recarregando dados completos...')
      
      // Depois, recarregar os dados completos do chamado
      const chamadoCompleto = await chamadoService.obter(chamado.id)
      console.log('Dados completos recarregados:', chamadoCompleto)
      
      setChamado(chamadoCompleto)
      setEditandoObservacoes(false)
      
      toast.success("Observações salvas com sucesso!", { id: toastId })
      console.log("Observações salvas com sucesso")
    } catch (error) {
      console.error('Erro ao salvar observações:', error)
      toast.error("Erro ao salvar as observações", { id: toastId })
      // Reverter as observações em caso de erro
      setObservacoes(chamado.observacoes_tecnico || "")
    } finally {
      setSalvandoObservacoes(false)
    }
  }

  const handleCancelarEdicao = () => {
    setObservacoes(chamado?.observacoes_tecnico || "")
    setEditandoObservacoes(false)
    toast("Edição cancelada", { icon: "❌", duration: 1500 })
  }

  // Função auxiliar para comparar IDs de forma segura
  const compararIds = (id1: any, id2: any): boolean => {
    if (!id1 || !id2) return false
    return id1 == id2 || String(id1) === String(id2)
  }

  // Função para garantir integridade dos dados do chamado
  const preservarDadosCompletos = (dadosAtualizados: Chamado, dadosOriginais: Chamado) => {
    console.log('=== PRESERVANDO DADOS ===')
    console.log('Dados atualizados - tipo_servico:', dadosAtualizados.tipo_servico)
    console.log('Dados originais - tipo_servico:', dadosOriginais.tipo_servico)
    console.log('Dados atualizados - solicitante:', dadosAtualizados.solicitante)
    console.log('Dados originais - solicitante:', dadosOriginais.solicitante)
    console.log('Dados atualizados - tecnico_responsavel:', dadosAtualizados.tecnico_responsavel)
    console.log('Dados originais - tecnico_responsavel:', dadosOriginais.tecnico_responsavel)
    
    const resultado = {
      id: dadosAtualizados.id || dadosOriginais.id,
      numero: dadosAtualizados.numero || dadosOriginais.numero,
      titulo: dadosAtualizados.titulo || dadosOriginais.titulo,
      descricao: dadosAtualizados.descricao || dadosOriginais.descricao,
      status: dadosAtualizados.status || dadosOriginais.status,
      prioridade: dadosAtualizados.prioridade || dadosOriginais.prioridade,
      equipamento: dadosAtualizados.equipamento || dadosOriginais.equipamento,
      localizacao: dadosAtualizados.localizacao || dadosOriginais.localizacao,
      observacoes_tecnico: dadosAtualizados.observacoes_tecnico || dadosOriginais.observacoes_tecnico,
      // Datas - preservar se estão válidas
      criado_em: (dadosAtualizados.criado_em && dadosAtualizados.criado_em !== '') 
        ? dadosAtualizados.criado_em 
        : dadosOriginais.criado_em,
      atualizado_em: (dadosAtualizados.atualizado_em && dadosAtualizados.atualizado_em !== '') 
        ? dadosAtualizados.atualizado_em 
        : dadosOriginais.atualizado_em,
      atendido_em: dadosAtualizados.atendido_em || dadosOriginais.atendido_em,
      encerrado_em: dadosAtualizados.encerrado_em || dadosOriginais.encerrado_em,
      // Objetos aninhados - garantir que sempre preserve os originais se não houver dados atualizados
      tipo_servico: dadosAtualizados.tipo_servico || dadosOriginais.tipo_servico,
      solicitante: dadosAtualizados.solicitante || dadosOriginais.solicitante,
      tecnico_responsavel: dadosAtualizados.tecnico_responsavel || dadosOriginais.tecnico_responsavel,
      anexos: dadosAtualizados.anexos || dadosOriginais.anexos,
      historico: dadosAtualizados.historico || dadosOriginais.historico
    }
    
    console.log('Resultado final - tipo_servico:', resultado.tipo_servico)
    console.log('Resultado final - solicitante:', resultado.solicitante)
    console.log('Resultado final - tecnico_responsavel:', resultado.tecnico_responsavel)
    console.log('=== FIM PRESERVAÇÃO ===')
    
    return resultado
  }

  // Verificar se o usuário atual pode editar observações
  // Pode editar APENAS se o chamado estiver "em atendimento" E se for o técnico responsável
  const podeEditarObservacoes = usuario && chamado?.status === 'em_atendimento' && 
    chamado?.tecnico_responsavel && 
    compararIds(chamado.tecnico_responsavel.id, usuario.id)
  
  // Verificar se o usuário atual é o técnico responsável (para outras funcionalidades)
  const isUsuarioTecnicoResponsavel = usuario && chamado?.tecnico_responsavel && 
    compararIds(chamado.tecnico_responsavel.id, usuario.id)
  
  // Debug logs
  console.log('Debug - Usuario atual:', usuario)
  console.log('Debug - Tecnico responsavel:', chamado?.tecnico_responsavel)
  console.log('Debug - É técnico responsável?', isUsuarioTecnicoResponsavel)
  console.log('Debug - Pode editar observações?', podeEditarObservacoes)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-muted-foreground">Carregando...</span>
      </div>
    )
  }

  if (!chamado) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Chamado não encontrado</p>
      </div>
    )
  }

  const handleImageClick = (index?: number) => {
    if (index !== undefined) {
      setSelectedImageIndex(index)
    }
    setImageModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header com botão voltar */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Chamado #{chamado.numero}</h1>
          <p className="text-muted-foreground">{chamado.titulo}</p>
        </div>
        <Badge variant={getStatusVariant(chamado.status)}>
          {getStatusLabel(chamado.status)}
        </Badge>
      </div>

      {/* Cards principais */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Informações do Chamado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informações do Chamado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Título</label>
              <p className="text-sm">{chamado.titulo}</p>
            </div>
            
            <Separator />
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Descrição</label>
              <p className="text-sm">{chamado.descricao}</p>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Serviço</label>
                <p className="text-sm">{chamado.tipo_servico?.nome || 'Não informado'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <Badge variant={getStatusVariant(chamado.status)}>
                    {getStatusLabel(chamado.status)}
                  </Badge>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Criado em
                </label>
                <p className="text-sm">{formatarData(chamado.criado_em)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Atualizado em</label>
                <p className="text-sm">{formatarData(chamado.atualizado_em)}</p>
              </div>
            </div>

            {chamado.atendido_em && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Atendimento iniciado em</label>
                  <p className="text-sm">{formatarData(chamado.atendido_em)}</p>
                </div>
              </>
            )}

            {chamado.encerrado_em && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Encerrado em</label>
                  <p className="text-sm">{formatarData(chamado.encerrado_em)}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Informações Técnicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Informações Técnicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {chamado.equipamento && (
              <>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Equipamento</label>
                  <p className="text-sm">{chamado.equipamento}</p>
                </div>
                
                <Separator />
              </>
            )}
            
            {chamado.localizacao && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Localização
                </label>
                <p className="text-sm">{chamado.localizacao}</p>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Solicitante</label>
              <p className="text-sm">{chamado.solicitante?.nome_completo || 'Não informado'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Anexos */}
      {chamado.anexos && chamado.anexos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Anexos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {chamado.anexos.map((anexo, index) => (
                <div 
                  key={anexo.id}
                  className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleImageClick(index)}
                >
                  <div className="flex-shrink-0">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{anexo.nome_original}</p>
                    <p className="text-xs text-muted-foreground">{anexo.tamanho_formatado}</p>
                  </div>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações Editáveis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Informações Editáveis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Status do Chamado</label>
            <div className="mt-2">
              <Badge variant={getStatusVariant(chamado.status)} className="cursor-pointer">
                {getStatusLabel(chamado.status)}
              </Badge>
            </div>
          </div>
          
          <Separator />
          
          {chamado.tecnico_responsavel ? (
            <>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Técnico Responsável</label>
                <div className="flex items-center gap-3 mt-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-xs">
                      {chamado.tecnico_responsavel.iniciais || '??'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{chamado.tecnico_responsavel.nome_completo || 'Nome não disponível'}</span>
                </div>
              </div>
              
              <Separator />
            </>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Técnico Responsável</label>
                <p className="text-sm text-muted-foreground mt-2">Não atribuído</p>
              </div>
              
              <Separator />
            </>
          )}
          
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted-foreground">Observações do Técnico</label>
              {podeEditarObservacoes && !editandoObservacoes && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditandoObservacoes(true)}
                  className="h-8 px-2"
                >
                  <Edit className="h-3 w-3" />
                </Button>
              )}
              {!podeEditarObservacoes && (usuario?.tipo_usuario === 'tecnico' || usuario?.tipo_usuario === 'admin') && chamado.status !== 'encerrado' && chamado.status !== 'em_atendimento' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Sem toast aqui, apenas visual desabilitado
                  }}
                  className="h-8 px-2 opacity-50"
                  disabled
                >
                  <Edit className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            {editandoObservacoes && podeEditarObservacoes ? (
              <div className="mt-2 space-y-2">
                <Textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Digite suas observações sobre o chamado..."
                  className="min-h-[100px]"
                  disabled={false} // Garantir que não está desabilitado
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSalvarObservacoes}
                    disabled={salvandoObservacoes}
                  >
                    {salvandoObservacoes ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Save className="h-3 w-3 mr-1" />
                    )}
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelarEdicao}
                    disabled={salvandoObservacoes}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-2 p-3 border rounded-md bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  {chamado.observacoes_tecnico || "Nenhuma observação registrada"}
                </p>
                {chamado.status === 'encerrado' && (
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    O chamado está encerrado e não pode mais ser editado
                  </p>
                )}
                {chamado.status === 'aberto' && (usuario?.tipo_usuario === 'tecnico' || usuario?.tipo_usuario === 'admin') && (
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    Para editar observações, você deve assumir e iniciar o atendimento do chamado
                  </p>
                )}
                {chamado.status === 'em_atendimento' && chamado.tecnico_responsavel && (usuario?.tipo_usuario === 'tecnico' || usuario?.tipo_usuario === 'admin') && !isUsuarioTecnicoResponsavel && (
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    Apenas o técnico responsável pelo atendimento pode editar as observações
                  </p>
                )}
                {usuario?.tipo_usuario !== 'tecnico' && usuario?.tipo_usuario !== 'admin' && (
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    Apenas técnicos e administradores podem editar observações
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex flex-wrap gap-3">
        {chamado.status !== "encerrado" && (
          <>
            {/* Botão de encerrar - permitir para solicitante, técnico ou admin */}
            <Button 
              variant="outline" 
              onClick={() => handleStatusUpdate("encerrado")}
              disabled={!usuario || (
                usuario.tipo_usuario !== 'tecnico' && 
                usuario.tipo_usuario !== 'admin' && 
                !compararIds(usuario.id, chamado.solicitante?.id)
              )}
            >
              Encerrar Chamado
            </Button>
            
            {/* Botão de iniciar atendimento - apenas para técnicos e administradores */}
            {chamado.status === "aberto" && (usuario?.tipo_usuario === 'tecnico' || usuario?.tipo_usuario === 'admin') && (
              <Button 
                variant="default" 
                onClick={() => handleStatusUpdate("em_atendimento")}
              >
                {!chamado.tecnico_responsavel ? 'Assumir e Iniciar Atendimento' : 'Iniciar Atendimento'}
              </Button>
            )}
          </>
        )}
        
        {/* Indicações de permissões */}
        {usuario && (
          <div className="text-sm text-muted-foreground space-y-1">
            {usuario.tipo_usuario !== 'tecnico' && usuario.tipo_usuario !== 'admin' && !compararIds(usuario.id, chamado.solicitante?.id) && (
              <p>Apenas o solicitante, técnicos ou administradores podem encerrar chamados</p>
            )}
          </div>
        )}
      </div>

      {/* Modal de Imagem */}
      {chamado.anexos && chamado.anexos.length > 0 && (
        <ImageModal
          isOpen={imageModalOpen}
          onClose={() => setImageModalOpen(false)}
          imageName={chamado.anexos[selectedImageIndex]?.nome_original || ""}
          imageUrl={chamado.anexos[selectedImageIndex]?.arquivo || ""}
          imageSize={chamado.anexos[selectedImageIndex]?.tamanho_formatado || ""}
        />
      )}
    </div>
  )
}
