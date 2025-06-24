"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, User, MapPin, Monitor, FileText, Image as ImageIcon, Download } from "lucide-react"
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
    imagem: {
      nome: "computador-nao-liga.jpg",
      url: "/uploads/chamados/00001/computador-nao-liga.jpg",
      tamanho: "2.3 MB"
    }
  },
  "00002": {
    id: "00002",
    titulo: "Instalação de software de gestão",
    servico: "Suporte de Software",
    tecnico: {
      nome: "Ana Oliveira",
      iniciais: "AO"
    },
    status: "encerrado",
    atualizadoEm: "10/04/25 10:15",
    criadoEm: "08/04/25 09:20",
    atualizadoPor: "Ana Oliveira",
    descricao: "Solicitação de instalação do software de gestão empresarial na máquina do departamento administrativo. O software precisa ser configurado com as permissões adequadas e integrado com o banco de dados existente.",
    equipamento: "Notebook Dell",
    localizacao: "Sala 205 - Departamento Administrativo"
  },
  "00003": {
    id: "00003",
    titulo: "Rede lenta",
    servico: "Instalação de Rede",
    tecnico: {
      nome: "Carlos Silva",
      iniciais: "CS"
    },
    status: "aberto",
    atualizadoEm: "13/04/25 20:56",
    criadoEm: "13/04/25 08:45",
    atualizadoPor: "Sistema",
    descricao: "A conexão de internet está muito lenta em todo o departamento. Os colaboradores estão com dificuldade para acessar os sistemas e realizar suas atividades. A velocidade de download está bem abaixo do contratado.",
    equipamento: "Roteador Wi-Fi",
    localizacao: "Sala 301 - TI",
    imagem: {
      nome: "teste-velocidade.png",
      url: "/uploads/chamados/00003/teste-velocidade.png",
      tamanho: "1.1 MB"
    }
  },
  "00004": {
    id: "00004",
    titulo: "Backup não está funcionando",
    servico: "Recuperação de Dados",
    tecnico: {
      nome: "Carlos Silva",
      iniciais: "CS"
    },
    status: "aberto",
    atualizadoEm: "12/04/25 15:20",
    criadoEm: "12/04/25 10:15",
    atualizadoPor: "Sistema",
    descricao: "O sistema de backup automático não está funcionando há 3 dias. Os dados não estão sendo salvos na rede e há risco de perda de informações importantes. Necessário verificar as configurações e restaurar o funcionamento.",
    equipamento: "Servidor de Backup",
    localizacao: "Sala de Servidores"
  },
  "00005": {
    id: "00005",
    titulo: "Meu fone não conecta no computador",
    servico: "Suporte de Software",
    tecnico: {
      nome: "Ana Oliveira",
      iniciais: "AO"
    },
    status: "encerrado",
    atualizadoEm: "11/04/25 15:16",
    criadoEm: "11/04/25 09:30",
    atualizadoPor: "Ana Oliveira",
    descricao: "O headset USB não está sendo reconhecido pelo computador. Já tentamos em outras portas USB e o problema persiste. É essencial para as videochamadas da equipe.",
    equipamento: "Headset USB",
    localizacao: "Sala 102 - Atendimento"
  }
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case "aberto":
      return "destructive"
    case "em-atendimento":
      return "warning"
    case "encerrado":
      return "success"
    default:
      return "default"
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case "aberto":
      return "Aberto"
    case "em-atendimento":
      return "Em atendimento"
    case "encerrado":
      return "Encerrado"
    default:
      return status
  }
}

export function ChamadoDetails({ chamadoId }: ChamadoDetailsProps) {
  const router = useRouter()
  const [chamado, setChamado] = useState<typeof mockChamados[string] | null>(null)
  const [loading, setLoading] = useState(true)
  const [imageModalOpen, setImageModalOpen] = useState(false)

  useEffect(() => {
    // Simular carregamento dos dados
    const timer = setTimeout(() => {
      setChamado(mockChamados[chamadoId] || null)
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [chamadoId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  if (!chamado) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
        <div className="text-lg font-medium">Chamado não encontrado</div>
        <Button onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold">Chamado #{chamado.id}</h1>
            <Badge variant={getStatusVariant(chamado.status)}>
              {getStatusLabel(chamado.status)}
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground">{chamado.titulo}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Criado em</p>
                <p className="text-sm text-muted-foreground">{chamado.criadoEm}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Última atualização</p>
                <p className="text-sm text-muted-foreground">{chamado.atualizadoEm}</p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <p className="text-sm font-medium mb-2">Tipo de Serviço</p>
              <p className="text-sm text-muted-foreground">{chamado.servico}</p>
            </div>
            
            {(chamado.equipamento || chamado.localizacao) && (
              <>
                <Separator />
                
                {chamado.equipamento && (
                  <div className="flex items-center gap-3">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Equipamento</p>
                      <p className="text-sm text-muted-foreground">{chamado.equipamento}</p>
                    </div>
                  </div>
                )}
                
                {chamado.localizacao && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Localização</p>
                      <p className="text-sm text-muted-foreground">{chamado.localizacao}</p>
                    </div>
                  </div>
                )}
              </>
            )}
            
          </CardContent>
        </Card>

        {/* Técnico Responsável */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Técnico Responsável
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={chamado.tecnico.avatar} />
                <AvatarFallback>{chamado.tecnico.iniciais}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{chamado.tecnico.nome}</p>
                <p className="text-sm text-muted-foreground">Técnico de TI</p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <p className="text-sm font-medium mb-2">Atualizado por</p>
              <p className="text-sm text-muted-foreground">{chamado.atualizadoPor}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Descrição do Problema */}
      <Card>
        <CardHeader>
          <CardTitle>Descrição do Problema</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {chamado.descricao}
          </p>
        </CardContent>
      </Card>

      {/* Imagem do Problema */}
      {chamado.imagem && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Imagem do Problema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-md">
                  <ImageIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">{chamado.imagem.nome}</p>
                  <p className="text-xs text-muted-foreground">{chamado.imagem.tamanho}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Baixar
              </Button>
            </div>
            
            {/* Preview da imagem (simulado) */}
            <div 
              className="border rounded-lg overflow-hidden bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
              onClick={() => setImageModalOpen(true)}
            >
              <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="text-center space-y-2">
                  <ImageIcon className="h-12 w-12 text-blue-400 mx-auto" />
                  <p className="text-sm text-muted-foreground">Clique para ampliar</p>
                  <p className="text-xs text-muted-foreground">{chamado.imagem.nome}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline">
          Editar Chamado
        </Button>
        {chamado.status !== "encerrado" && (
          <Button>
            Encerrar Chamado
          </Button>
        )}
      </div>

      {/* Modal de Imagem */}
      {chamado.imagem && (
        <ImageModal
          isOpen={imageModalOpen}
          onClose={() => setImageModalOpen(false)}
          imageName={chamado.imagem.nome}
          imageUrl={chamado.imagem.url}
          imageSize={chamado.imagem.tamanho}
        />
      )}
    </div>
  )
}
