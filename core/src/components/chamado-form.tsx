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
import { X, Upload, Image as ImageIcon } from "lucide-react"

interface ChamadoFormData {
  titulo: string
  descricao: string
  servico: string
  equipamento: string
  localizacao: string
  imagens: File[]
}

const servicos = [
  "Instalação de Rede",
  "Manutenção de Hardware", 
  "Suporte de Software",
  "Recuperação de Dados",
  "Configuração de Sistema",
  "Backup e Restore",
  "Instalação de Impressora",
  "Suporte Remoto"
]

export function ChamadoForm() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState<ChamadoFormData>({
    titulo: "",
    descricao: "",
    servico: "",
    equipamento: "",
    localizacao: "",
    imagens: []
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div>Carregando...</div>
  }

  const handleInputChange = (field: keyof ChamadoFormData, value: string) => {
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
        imagens: [...prev.imagens, ...newFiles]
      }))
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imagens: prev.imagens.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simular envio do formulário
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Aqui você faria a chamada para a API
      console.log("Dados do chamado:", formData)
      
      // Redirecionar para o dashboard após sucesso
      router.push("/dashboard")
    } catch (error) {
      console.error("Erro ao criar chamado:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = formData.titulo && formData.descricao && formData.servico

  return (
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
              <Label htmlFor="servico">Tipo de Serviço *</Label>
              <Select
                value={formData.servico}
                onValueChange={(value) => handleInputChange("servico", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de serviço" />
                </SelectTrigger>
                <SelectContent>
                  {servicos.map((servico) => (
                    <SelectItem key={servico} value={servico}>
                      {servico}
                    </SelectItem>
                  ))}
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
              <Label htmlFor="imagens">Imagens do Problema</Label>
              <Input
                id="imagens"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Você pode selecionar múltiplas imagens
              </p>
              
              {/* Lista de imagens selecionadas */}
              {formData.imagens.length > 0 && (
                <div className="space-y-2 mt-3">
                  <Label>Imagens Selecionadas ({formData.imagens.length})</Label>
                  <div className="space-y-2">
                    {formData.imagens.map((file, index) => (
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
  )
}
