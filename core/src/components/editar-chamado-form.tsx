"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, User, MapPin, Monitor, FileText, Image as ImageIcon } from "lucide-react"
import { type Chamado } from "@/components/columns"

interface EditarChamadoFormProps {
  chamadoId: string
}

interface ChamadoCompleto extends Chamado {
  criadoEm: string
  atualizadoPor: string
  descricao: string
  equipamento?: string
  localizacao?: string
  observacoesTecnico?: string
}

interface FormData {
  status: "aberto" | "em-atendimento" | "encerrado"
  tecnicoNome: string
  tecnicoIniciais: string
  observacoesTecnico: string
}

// Dados mockados - em uma aplicação real, isso viria de uma API
const mockChamados: Record<string, ChamadoCompleto> = {
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
    observacoesTecnico: "Verificado problema na fonte de alimentação. Substituição necessária."
  },
  "00002": {
    id: "00002",
    titulo: "Impressora não imprime",
    servico: "Manutenção de Hardware",
    tecnico: {
      nome: "Ana Costa",
      iniciais: "AC"
    },
    status: "aberto",
    atualizadoEm: "11/04/25 16:45",
    criadoEm: "11/04/25 16:45",
    atualizadoPor: "Sistema",
    descricao: "A impressora parou de funcionar de repente. Não responde aos comandos de impressão e o display está em branco.",
    equipamento: "Impressora HP LaserJet",
    localizacao: "Recepção"
  }
}

const statusOptions = [
  { value: "aberto", label: "Aberto", variant: "destructive" as const },
  { value: "em-atendimento", label: "Em atendimento", variant: "warning" as const },
  { value: "encerrado", label: "Encerrado", variant: "success" as const }
]

const tecnicos = [
  { nome: "Carlos Silva", iniciais: "CS" },
  { nome: "Ana Costa", iniciais: "AC" },
  { nome: "João Santos", iniciais: "JS" },
  { nome: "Maria Oliveira", iniciais: "MO" },
  { nome: "Pedro Lima", iniciais: "PL" }
]

export function EditarChamadoForm({ chamadoId }: EditarChamadoFormProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [chamado, setChamado] = useState<ChamadoCompleto | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    status: "aberto",
    tecnicoNome: "",
    tecnicoIniciais: "",
    observacoesTecnico: ""
  })

  useEffect(() => {
    setMounted(true)
    // Simular carregamento dos dados do chamado
    const chamadoData = mockChamados[chamadoId]
    if (chamadoData) {
      setChamado(chamadoData)
      setFormData({
        status: chamadoData.status,
        tecnicoNome: chamadoData.tecnico.nome,
        tecnicoIniciais: chamadoData.tecnico.iniciais,
        observacoesTecnico: chamadoData.observacoesTecnico || ""
      })
    }
  }, [chamadoId])

  if (!mounted) {
    return <div>Carregando...</div>
  }

  if (!chamado) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-xl font-semibold">Chamado não encontrado</h2>
        <p className="text-muted-foreground">O chamado com ID {chamadoId} não foi encontrado.</p>
        <Button onClick={() => router.push("/dashboard")}>
          Voltar ao Dashboard
        </Button>
      </div>
    )
  }

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      status: value as FormData["status"]
    }))
  }

  const handleTecnicoChange = (value: string) => {
    const tecnico = tecnicos.find(t => t.nome === value)
    if (tecnico) {
      setFormData(prev => ({
        ...prev,
        tecnicoNome: tecnico.nome,
        tecnicoIniciais: tecnico.iniciais
      }))
    }
  }

  const handleObservacoesChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      observacoesTecnico: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simular envio dos dados
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log("Dados atualizados:", {
        chamadoId,
        ...formData
      })
      
      // Redirecionar após sucesso
      router.push(`/chamado/${chamadoId}`)
    } catch (error) {
      console.error("Erro ao atualizar chamado:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status)
    return option?.variant || "default"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/chamado/${chamadoId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Editar Chamado #{chamado.id}</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground">
              Criado em {chamado.criadoEm}
            </p>
            <Badge variant={getStatusBadgeVariant(chamado.status)}>
              {statusOptions.find(opt => opt.value === chamado.status)?.label}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Informações do Chamado (Somente Leitura) */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informações do Chamado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Título</Label>
                <p className="font-medium">{chamado.titulo}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Tipo de Serviço</Label>
                <p>{chamado.servico}</p>
              </div>
              
              {chamado.equipamento && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Equipamento</Label>
                  <p className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    {chamado.equipamento}
                  </p>
                </div>
              )}
              
              {chamado.localizacao && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Localização</Label>
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {chamado.localizacao}
                  </p>
                </div>
              )}
              
              <Separator />
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Descrição</Label>
                <p className="text-sm leading-relaxed mt-1">{chamado.descricao}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulário de Edição */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações Editáveis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status do Chamado</Label>
                  <Select
                    value={formData.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Badge variant={option.variant}>{option.label}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Técnico */}
                <div className="space-y-2">
                  <Label htmlFor="tecnico">Técnico Responsável</Label>
                  <Select
                    value={formData.tecnicoNome}
                    onValueChange={handleTecnicoChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um técnico" />
                    </SelectTrigger>
                    <SelectContent>
                      {tecnicos.map((tecnico) => (
                        <SelectItem key={tecnico.nome} value={tecnico.nome}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">{tecnico.iniciais}</AvatarFallback>
                            </Avatar>
                            {tecnico.nome}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Observações do Técnico */}
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações do Técnico</Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Adicione observações sobre o atendimento, diagnóstico ou soluções aplicadas..."
                    value={formData.observacoesTecnico}
                    onChange={(e) => handleObservacoesChange(e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Botões de Ação */}
            <div className="flex gap-3 justify-end">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.push(`/chamado/${chamadoId}`)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
