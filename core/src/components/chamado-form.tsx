"use client"

import { useState, useEffect } from "react"
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
import { useRouter } from "next/navigation"
import { X, Upload, Image as ImageIcon, AlertCircle } from "lucide-react"
import { chamadoService, tipoServicoService, TipoServico } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/AuthContext"
import toast from "react-hot-toast"

interface ChamadoFormData {
  titulo: string
  descricao: string
  tipo_servico: number | null
  prioridade: string
  equipamento: string
  localizacao: string
  anexos: File[]
}

export function ChamadoForm() {
  const router = useRouter()
  const { usuario } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [tiposServico, setTiposServico] = useState<TipoServico[]>([])
  const [formData, setFormData] = useState<ChamadoFormData>({
    titulo: "",
    descricao: "",
    tipo_servico: null,
    prioridade: "media",
    equipamento: "",
    localizacao: "",
    anexos: []
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingServicos, setIsLoadingServicos] = useState(true)

  useEffect(() => {
    setMounted(true)
    loadTiposServico()
  }, [])

  const loadTiposServico = async () => {
    try {
      setIsLoadingServicos(true)
      const response = await tipoServicoService.listar()
      
      // Se a resposta for um objeto com results, pegar o array
      const tipos = Array.isArray(response) ? response : (response as any)?.results || []
      setTiposServico(tipos)
    } catch (error) {
      console.error("Erro ao carregar tipos de serviço:", error)
      setError("Erro ao carregar tipos de serviço")
      setTiposServico([]) // Garantir que sempre seja um array
    } finally {
      setIsLoadingServicos(false)
    }
  }

  if (!mounted) {
    return <div>Carregando...</div>
  }

  if (!usuario) {
    router.push('/')
    return null
  }

  const handleInputChange = (field: keyof ChamadoFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles = Array.from(files)
      setFormData(prev => ({
        ...prev,
        anexos: [...prev.anexos, ...newFiles]
      }))
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      anexos: prev.anexos.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Validar campos obrigatórios
      if (!formData.titulo || !formData.descricao || !formData.tipo_servico) {
        throw new Error("Por favor, preencha todos os campos obrigatórios")
      }

      console.log('Dados do formulário:', {
        titulo: formData.titulo,
        descricao: formData.descricao,
        tipo_servico: formData.tipo_servico,
        prioridade: formData.prioridade,
        equipamento: formData.equipamento,
        localizacao: formData.localizacao,
      })

      // Criar o chamado
      const novoChamado = await chamadoService.criar({
        titulo: formData.titulo,
        descricao: formData.descricao,
        tipo_servico: formData.tipo_servico,
        prioridade: formData.prioridade,
        equipamento: formData.equipamento || undefined,
        localizacao: formData.localizacao || undefined,
      })

      console.log('Resposta completa do chamado criado:', JSON.stringify(novoChamado, null, 2)) // Debug melhorado

      // Verificar se o chamado foi criado com sucesso
      if (!novoChamado) {
        console.error('Nenhum chamado retornado')
        throw new Error("Erro ao criar chamado: Nenhuma resposta do servidor")
      }

      if (!novoChamado.id) {
        console.error('ID do chamado não encontrado. Objeto retornado:', novoChamado)
        throw new Error("Erro ao criar chamado: ID não retornado pelo servidor")
      }

      const chamadoId = Number(novoChamado.id)
      if (isNaN(chamadoId) || chamadoId <= 0) {
        console.error('ID do chamado inválido:', novoChamado.id)
        throw new Error("Erro ao criar chamado: ID inválido retornado pelo servidor")
      }

      console.log('ID do chamado validado:', chamadoId)

      // Fazer upload dos anexos se houver
      if (formData.anexos.length > 0) {
        console.log(`Fazendo upload de ${formData.anexos.length} anexos para o chamado ${chamadoId}`)
        
        for (const anexo of formData.anexos) {
          try {
            console.log(`Fazendo upload do arquivo: ${anexo.name} para chamado ID: ${chamadoId}`)
            await chamadoService.uploadAnexo(chamadoId, anexo)
            console.log(`Upload concluído: ${anexo.name}`)
          } catch (error) {
            console.error("Erro ao fazer upload do anexo:", error)
            toast.error(`Erro ao fazer upload do arquivo ${anexo.name}`)
            // Não falha a criação do chamado por causa de erro no anexo
          }
        }
      }
      
      // Toast de sucesso e redirecionamento para o dashboard
      toast.success("Chamado criado com sucesso!", {
        duration: 3000,
        icon: "✅"
      })
      
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Erro ao criar chamado:", error)
      setError(error.response?.data?.detail || error.message || "Erro ao criar chamado")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = formData.titulo && formData.descricao && formData.tipo_servico

  return (
    <div>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título do Chamado *</Label>
                <Input
                  id="titulo"
                  placeholder="Descreva brevemente o problema"
                  value={formData.titulo}
                  onChange={(e) => handleInputChange("titulo", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_servico">Tipo de Serviço *</Label>
                <Select
                  value={formData.tipo_servico?.toString() || ""}
                  onValueChange={(value) => handleInputChange("tipo_servico", parseInt(value))}
                  required
                  disabled={isLoadingServicos}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingServicos ? "Carregando..." : "Selecione o tipo de serviço"} />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(tiposServico) && tiposServico.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id.toString()}>
                        {tipo.nome}
                      </SelectItem>
                    ))}
                    {(!Array.isArray(tiposServico) || tiposServico.length === 0) && !isLoadingServicos && (
                      <SelectItem value="" disabled>
                        Nenhum tipo de serviço disponível
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prioridade">Prioridade</Label>
                <Select
                  value={formData.prioridade}
                  onValueChange={(value) => handleInputChange("prioridade", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Detalhes Técnicos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalhes Técnicos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="equipamento">Equipamento</Label>
                <Input
                  id="equipamento"
                  placeholder="Ex: Computador, Impressora, Roteador"
                  value={formData.equipamento}
                  onChange={(e) => handleInputChange("equipamento", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="localizacao">Localização</Label>
                <Input
                  id="localizacao"
                  placeholder="Ex: Sala 101, Departamento X"
                  value={formData.localizacao}
                  onChange={(e) => handleInputChange("localizacao", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="anexos">Anexos do Problema</Label>
                <Input
                  id="anexos"
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  multiple
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Você pode selecionar múltiplos arquivos (imagens, PDFs, documentos)
                </p>
                
                {/* Lista de anexos selecionados */}
                {formData.anexos.length > 0 && (
                  <div className="space-y-2 mt-3">
                    <Label>Anexos Selecionados ({formData.anexos.length})</Label>
                    <div className="space-y-2">
                      {formData.anexos.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-md">
                              <ImageIcon className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeImage(index)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Descrição */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Descrição do Problema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição Detalhada *</Label>
              <Textarea
                id="descricao"
                placeholder="Descreva o problema com o máximo de detalhes possível..."
                value={formData.descricao}
                onChange={(e) => handleInputChange("descricao", e.target.value)}
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex gap-3 justify-end">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => router.push("/dashboard")}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? "Criando..." : "Criar Chamado"}
          </Button>
        </div>
      </form>
    </div>
  )
}
