"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, User, MapPin, Monitor, FileText, Image as ImageIcon, Download, Edit } from "lucide-react"
import { type Chamado } from "@/components/columns"
import { ImageModal } from "@/components/image-modal"

interface ChamadoDetailsProps {
  chamadoId: string
}

// Dados mockados para demonstração
const mockChamados: Record<string, Chamado & { 
  criadoEm: string; 
  atualizadoPor: string; 
  descricao: string;
  equipamento?: string;
  localizacao?: string;
  imagem?: {
    nome: string;
    url: string;
    tamanho: string;
  };
  imagens?: Array<{
    nome: string;
    url: string;
    tamanho: string;
  }>;
}> = {
  "00001": {
    id: "00001",
    titulo: "Computador não liga",
    servico: "Manutenção de Hardware",
    tecnico: {
      nome: "Carlos Silva",
      iniciais: "CS"
    },
    status: "em-atendimento",
    atualizadoEm: "12/04/25 09:01",
    criadoEm: "10/04/25 14:30",
    atualizadoPor: "Sistema",
    descricao: "O computador da estação de trabalho não está ligando. Já verificamos o cabo de energia e está conectado corretamente. A luz do monitor está acesa, mas a CPU não responde. Precisa de verificação urgente pois está impactando o trabalho da equipe.",
    equipamento: "Computador Desktop",
    localizacao: "Sala 101 - Departamento Administrativo",
    imagens: [
      {
        nome: "computador-frontal.jpg",
        url: "/uploads/chamados/00001/computador-frontal.jpg",
        tamanho: "2.3 MB"
      },
      {
        nome: "computador-traseira.jpg",
        url: "/uploads/chamados/00001/computador-traseira.jpg",
        tamanho: "1.8 MB"
      }
    ]
  },
  "00002": {
    id: "00002",
    titulo: "Impressora com papel atolado",
    servico: "Suporte Técnico",
    tecnico: {
      nome: "Ana Santos",
      iniciais: "AS"
    },
    status: "aberto",
    atualizadoEm: "12/04/25 08:30",
    criadoEm: "12/04/25 08:00",
    atualizadoPor: "Sistema",
    descricao: "A impressora HP LaserJet Pro está com papel atolado constantemente. Já tentamos remover o papel conforme as instruções, mas o problema persiste. A impressora é usada por toda a equipe e está causando atrasos no trabalho.",
    equipamento: "Impressora HP LaserJet Pro",
    localizacao: "Sala 205 - Departamento de RH",
    imagem: {
      nome: "impressora-atolada.jpg",
      url: "/uploads/chamados/00002/impressora-atolada.jpg",
      tamanho: "1.5 MB"
    }
  },
  "00003": {
    id: "00003",
    titulo: "Email não está funcionando",
    servico: "Configuração de Sistema",
    tecnico: {
      nome: "João Oliveira",
      iniciais: "JO"
    },
    status: "encerrado",
    atualizadoEm: "11/04/25 16:45",
    criadoEm: "11/04/25 10:15",
    atualizadoPor: "João Oliveira",
    descricao: "Não estou conseguindo enviar nem receber emails. A mensagem de erro indica problema de autenticação. Já tentei reconfigurar a senha mas não funcionou.",
    equipamento: "Outlook 2021",
    localizacao: "Sala 150 - Diretoria"
  }
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
    case "em-atendimento":
      return "Em Atendimento"
    case "encerrado":
      return "Encerrado"
    default:
      return status
  }
}

export function ChamadoDetails({ chamadoId }: ChamadoDetailsProps) {
  const router = useRouter()
  const [chamado, setChamado] = useState<typeof mockChamados[string] | null>(null)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    const chamadoData = mockChamados[chamadoId]
    setChamado(chamadoData || null)
  }, [chamadoId])

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
          <h1 className="text-2xl font-bold">Chamado #{chamado.id}</h1>
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
                <p className="text-sm">{chamado.servico}</p>
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
                <p className="text-sm">{chamado.criadoEm}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Atualizado em</label>
                <p className="text-sm">{chamado.atualizadoEm}</p>
              </div>
            </div>
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
              <label className="text-sm font-medium text-muted-foreground">Última atualização por</label>
              <p className="text-sm">{chamado.atualizadoPor}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Anexos */}
      {((chamado.imagem) || (chamado.imagens && chamado.imagens.length > 0)) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Anexos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {chamado.imagem && (
                <div 
                  className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleImageClick()}
                >
                  <div className="flex-shrink-0">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{chamado.imagem.nome}</p>
                    <p className="text-xs text-muted-foreground">{chamado.imagem.tamanho}</p>
                  </div>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              
              {chamado.imagens?.map((imagem, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleImageClick(index)}
                >
                  <div className="flex-shrink-0">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{imagem.nome}</p>
                    <p className="text-xs text-muted-foreground">{imagem.tamanho}</p>
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
          
          {chamado.tecnico && (
            <>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Técnico Responsável</label>
                <div className="flex items-center gap-3 mt-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-xs">
                      {chamado.tecnico.iniciais}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{chamado.tecnico.nome}</span>
                </div>
              </div>
              
              <Separator />
            </>
          )}
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Observações do Técnico</label>
            <div className="mt-2 p-3 border rounded-md bg-muted/30">
              <p className="text-sm text-muted-foreground">
                Verificado problema na fonte de alimentação. Substituição necessária.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex flex-wrap gap-3">
        {chamado.status !== "encerrado" && (
          <Button variant="outline">
            Encerrar Chamado
          </Button>
        )}
      </div>

      {/* Modal de Imagem */}
      {((chamado.imagem) || (chamado.imagens && chamado.imagens.length > 0)) && (
        <ImageModal
          isOpen={imageModalOpen}
          onClose={() => setImageModalOpen(false)}
          imageName={
            chamado.imagens && chamado.imagens.length > 0 
              ? chamado.imagens[selectedImageIndex]?.nome || ""
              : chamado.imagem?.nome || ""
          }
          imageUrl={
            chamado.imagens && chamado.imagens.length > 0
              ? chamado.imagens[selectedImageIndex]?.url || ""
              : chamado.imagem?.url || ""
          }
          imageSize={
            chamado.imagens && chamado.imagens.length > 0
              ? chamado.imagens[selectedImageIndex]?.tamanho || ""
              : chamado.imagem?.tamanho || ""
          }
        />
      )}
    </div>
  )
}
