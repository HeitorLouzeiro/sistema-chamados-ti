"use client"

import { useState, useEffect } from "react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { useAuthRedirect } from "@/hooks/use-auth-redirect"
import { userService } from "@/lib/api"
import { User, Mail, Phone, MapPin, Edit, Save, X, Loader2, Lock } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import { formatPhone, displayPhone, preparePhoneForBackend, isValidPhone } from "@/lib/phone-utils"

interface PerfilUsuario {
  id: number
  username: string
  email: string
  nome_completo: string
  tipo_usuario: 'admin' | 'tecnico' | 'usuario'
  telefone?: string
  endereco?: string
  is_active: boolean
  date_joined: string
  last_login?: string
}

export default function PerfilPage() {
  // Verificar autenticação
  const { shouldRedirect } = useAuthRedirect({ requireAuth: true })
  const { usuario, atualizarUsuario } = useAuth()
  const router = useRouter()

  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null)
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    nome_completo: "",
    email: "",
    telefone: "",
    endereco: ""
  })

  useEffect(() => {
    setMounted(true)
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (mounted && !shouldRedirect && usuario) {
      carregarPerfil()
    }
  }, [mounted, shouldRedirect, usuario])

  // Se deve redirecionar ou não montado ainda, não renderizar nada
  if (!mounted || shouldRedirect) {
    return null
  }

  const carregarPerfil = async () => {
    try {
      setLoading(true)
      const dadosPerfil = await userService.obterPerfil()
      setPerfil(dadosPerfil)
      setFormData({
        nome_completo: dadosPerfil.nome_completo || "",
        email: dadosPerfil.email || "",
        telefone: displayPhone(dadosPerfil.telefone || ""),
        endereco: dadosPerfil.endereco || ""
      })
    } catch (error) {
      console.error("Erro ao carregar perfil:", error)
      toast.error("Erro ao carregar dados do perfil")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    if (field === 'telefone') {
      // Aplicar formatação apenas no campo telefone
      const formattedPhone = formatPhone(value)
      setFormData(prev => ({
        ...prev,
        [field]: formattedPhone
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSalvar = async () => {
    try {
      setSalvando(true)
      
      // Validar telefone se foi preenchido
      if (formData.telefone && !isValidPhone(formData.telefone)) {
        toast.error("Telefone deve ter 11 dígitos (DDD + número)")
        return
      }
      
      // Preparar dados para envio - telefone apenas com números
      const dadosParaEnvio = {
        ...formData,
        telefone: preparePhoneForBackend(formData.telefone)
      }
      
      const perfilAtualizado = await userService.atualizarPerfil(dadosParaEnvio)
      setPerfil(perfilAtualizado)
      setEditando(false)
      
      // Atualizar dados do usuário no contexto de autenticação
      atualizarUsuario(perfilAtualizado)
      
      toast.success("Perfil atualizado com sucesso!")
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error)
      
      // Tratar erro específico de telefone
      if (error?.response?.data?.telefone) {
        toast.error(error.response.data.telefone[0] || "Telefone inválido")
      } else if (error?.response?.data?.detail) {
        toast.error(error.response.data.detail)
      } else {
        toast.error("Erro ao atualizar perfil")
      }
    } finally {
      setSalvando(false)
    }
  }

  const handleCancelar = () => {
    if (perfil) {
      setFormData({
        nome_completo: perfil.nome_completo || "",
        email: perfil.email || "",
        telefone: displayPhone(perfil.telefone || ""),
        endereco: perfil.endereco || ""
      })
    }
    setEditando(false)
  }

  const getTipoUsuarioLabel = (tipo: string) => {
    switch (tipo) {
      case 'admin': return 'Administrador'
      case 'tecnico': return 'Técnico'
      case 'usuario': return 'Usuário'
      default: return tipo
    }
  }

  const getTipoUsuarioVariant = (tipo: string) => {
    switch (tipo) {
      case 'admin': return 'destructive'
      case 'tecnico': return 'default'
      case 'usuario': return 'secondary'
      default: return 'outline'
    }
  }

  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2 text-muted-foreground">Carregando perfil...</span>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!perfil) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Erro ao carregar perfil</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

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
                <BreadcrumbItem>
                  <BreadcrumbPage>Perfil</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
              <p className="text-muted-foreground">
                Gerencie suas informações pessoais
              </p>
            </div>
          </div>

          <div className="grid gap-6 max-w-4xl">
            {/* Card de Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações Pessoais
                </CardTitle>
                <CardDescription>
                  Suas informações básicas do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar e Nome */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-lg">
                      {getInitials(perfil.nome_completo || perfil.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">
                      {perfil.nome_completo || perfil.username}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={getTipoUsuarioVariant(perfil.tipo_usuario)}>
                        {getTipoUsuarioLabel(perfil.tipo_usuario)}
                      </Badge>
                      {perfil.is_active && (
                        <Badge variant="outline" className="text-green-600">
                          Ativo
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Formulário de dados */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nome_completo">Nome Completo</Label>
                    {editando ? (
                      <Input
                        id="nome_completo"
                        value={formData.nome_completo}
                        onChange={(e) => handleInputChange("nome_completo", e.target.value)}
                        placeholder="Digite seu nome completo"
                      />
                    ) : (
                      <p className="text-sm py-2 px-3 bg-muted rounded-md">
                        {perfil.nome_completo || "Não informado"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Nome de Usuário</Label>
                    <p className="text-sm py-2 px-3 bg-muted rounded-md text-muted-foreground">
                      {perfil.username}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    {editando ? (
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="Digite seu e-mail"
                      />
                    ) : (
                      <p className="text-sm py-2 px-3 bg-muted rounded-md">
                        {perfil.email || "Não informado"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    {editando ? (
                      <div className="space-y-1">
                        <Input
                          id="telefone"
                          value={formData.telefone}
                          onChange={(e) => handleInputChange("telefone", e.target.value)}
                          placeholder="(00) 9 0000-0000"
                          className={
                            formData.telefone && !isValidPhone(formData.telefone)
                              ? "border-red-500 focus:border-red-500"
                              : ""
                          }
                        />
                        {formData.telefone && !isValidPhone(formData.telefone) ? (
                          <p className="text-sm text-red-500 font-medium">
                            Número inválido, digite os 11 dígitos corretamente.
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Digite o telefone com DDD. Exemplo: (89) 9 9905-4536
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm py-2 px-3 bg-muted rounded-md">
                        {isClient 
                          ? (displayPhone(perfil.telefone || "") || "Não informado")
                          : (perfil.telefone || "Não informado")
                        }
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    {editando ? (
                      <Input
                        id="endereco"
                        value={formData.endereco}
                        onChange={(e) => handleInputChange("endereco", e.target.value)}
                        placeholder="Digite seu endereço"
                      />
                    ) : (
                      <p className="text-sm py-2 px-3 bg-muted rounded-md">
                        {perfil.endereco || "Não informado"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex gap-3 pt-4">
                  {editando ? (
                    <>
                      <Button 
                        onClick={handleSalvar}
                        disabled={
                          salvando || 
                          Boolean(formData.telefone && !isValidPhone(formData.telefone))
                        }
                        className="gap-2"
                      >
                        {salvando ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Salvar Alterações
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleCancelar}
                        disabled={salvando}
                        className="gap-2"
                      >
                        <X className="h-4 w-4" />
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        onClick={() => setEditando(true)}
                        className="gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Editar Perfil
                      </Button>
                      <Button 
                        variant="outline" 
                        asChild
                        className="gap-2"
                      >
                        <Link href="/alterar-senha">
                          <Lock className="h-4 w-4" />
                          Alterar Senha
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
