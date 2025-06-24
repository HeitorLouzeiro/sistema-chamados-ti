"use client"

import { useState } from "react"
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

interface ChamadoFormData {
  titulo: string
  descricao: string
  servico: string
  equipamento: string
  localizacao: string
  imagem: File | null
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
  const [formData, setFormData] = useState<ChamadoFormData>({
    titulo: "",
    descricao: "",
    servico: "",
    equipamento: "",
    localizacao: "",
    imagem: null
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: keyof ChamadoFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({
      ...prev,
      imagem: file
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
              <Label htmlFor="imagem">Imagem do Problema</Label>
              <Input
                id="imagem"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer"
              />
              {formData.imagem && (
                <p className="text-sm text-muted-foreground">
                  Arquivo selecionado: {formData.imagem.name}
                </p>
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
