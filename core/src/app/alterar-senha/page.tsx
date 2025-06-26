"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { useAuthRedirect } from "@/hooks/use-auth-redirect"
import { userService } from "@/lib/api"
import { Lock, Eye, EyeOff, Save, ArrowLeft, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

export default function AlterarSenhaPage() {
  // Verificar autenticação
  const { shouldRedirect } = useAuthRedirect({ requireAuth: true })
  const router = useRouter()

  // Se deve redirecionar, não renderizar nada
  if (shouldRedirect) {
    return null
  }

  const [formData, setFormData] = useState({
    senha_atual: "",
    nova_senha: "",
    confirmar_senha: ""
  })
  const [mostrarSenhas, setMostrarSenhas] = useState({
    atual: false,
    nova: false,
    confirmar: false
  })
  const [salvando, setSalvando] = useState(false)

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const toggleMostrarSenha = (campo: keyof typeof mostrarSenhas) => {
    setMostrarSenhas(prev => ({
      ...prev,
      [campo]: !prev[campo]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validações
    if (!formData.senha_atual || !formData.nova_senha || !formData.confirmar_senha) {
      toast.error("Todos os campos são obrigatórios")
      return
    }

    if (formData.nova_senha !== formData.confirmar_senha) {
      toast.error("Nova senha e confirmação não coincidem")
      return
    }

    if (formData.nova_senha.length < 6) {
      toast.error("Nova senha deve ter pelo menos 6 caracteres")
      return
    }

    if (formData.senha_atual === formData.nova_senha) {
      toast.error("A nova senha deve ser diferente da senha atual")
      return
    }

    try {
      setSalvando(true)
      await userService.alterarSenha(formData)
      
      toast.success("Senha alterada com sucesso!")
      
      // Limpar formulário
      setFormData({
        senha_atual: "",
        nova_senha: "",
        confirmar_senha: ""
      })
      
      // Redirecionar para o perfil
      setTimeout(() => {
        router.push("/perfil")
      }, 1500)
      
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error)
      const mensagem = error.response?.data?.detail || 
                     error.response?.data?.senha_atual?.[0] ||
                     "Erro ao alterar senha"
      toast.error(mensagem)
    } finally {
      setSalvando(false)
    }
  }

  const isFormValid = formData.senha_atual && 
                     formData.nova_senha && 
                     formData.confirmar_senha &&
                     formData.nova_senha === formData.confirmar_senha

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/perfil">
                    Perfil
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Alterar Senha</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Alterar Senha</h1>
              <p className="text-muted-foreground">
                Altere sua senha de acesso ao sistema
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </div>

          <div className="max-w-md">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Alterar Senha
                </CardTitle>
                <CardDescription>
                  Digite sua senha atual e escolha uma nova senha
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Senha Atual */}
                  <div className="space-y-2">
                    <Label htmlFor="senha_atual">Senha Atual</Label>
                    <div className="relative">
                      <Input
                        id="senha_atual"
                        type={mostrarSenhas.atual ? "text" : "password"}
                        value={formData.senha_atual}
                        onChange={(e) => handleInputChange("senha_atual", e.target.value)}
                        placeholder="Digite sua senha atual"
                        disabled={salvando}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => toggleMostrarSenha('atual')}
                        disabled={salvando}
                      >
                        {mostrarSenhas.atual ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Nova Senha */}
                  <div className="space-y-2">
                    <Label htmlFor="nova_senha">Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="nova_senha"
                        type={mostrarSenhas.nova ? "text" : "password"}
                        value={formData.nova_senha}
                        onChange={(e) => handleInputChange("nova_senha", e.target.value)}
                        placeholder="Digite a nova senha"
                        disabled={salvando}
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => toggleMostrarSenha('nova')}
                        disabled={salvando}
                      >
                        {mostrarSenhas.nova ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      A senha deve ter pelo menos 6 caracteres
                    </p>
                  </div>

                  {/* Confirmar Nova Senha */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmar_senha">Confirmar Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="confirmar_senha"
                        type={mostrarSenhas.confirmar ? "text" : "password"}
                        value={formData.confirmar_senha}
                        onChange={(e) => handleInputChange("confirmar_senha", e.target.value)}
                        placeholder="Confirme a nova senha"
                        disabled={salvando}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => toggleMostrarSenha('confirmar')}
                        disabled={salvando}
                      >
                        {mostrarSenhas.confirmar ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {formData.nova_senha && formData.confirmar_senha && formData.nova_senha !== formData.confirmar_senha && (
                      <p className="text-xs text-red-500">
                        As senhas não coincidem
                      </p>
                    )}
                  </div>

                  {/* Botão de Salvar */}
                  <div className="pt-4">
                    <Button 
                      type="submit"
                      disabled={!isFormValid || salvando}
                      className="w-full gap-2"
                    >
                      {salvando ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {salvando ? "Alterando..." : "Alterar Senha"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
