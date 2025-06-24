"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState(false)
  
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro("")
    setCarregando(true)

    try {
      await login(username, password)
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Erro no login:", error)
      
      if (error.response?.status === 401) {
        setErro("Usuário ou senha incorretos")
      } else if (error.response?.status >= 500) {
        setErro("Erro no servidor. Tente novamente mais tarde.")
      } else {
        setErro("Erro ao fazer login. Verifique sua conexão.")
      }
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Sistema de Chamados TI</CardTitle>
          <CardDescription>
            Entre usando seu usuário e senha cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              {erro && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{erro}</AlertDescription>
                </Alert>
              )}
              
              <div className="grid gap-3">
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite seu usuário"
                  required
                  disabled={carregando}
                />
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={mostrarSenha ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    required
                    disabled={carregando}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    disabled={carregando}
                  >
                    {mostrarSenha ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={carregando || !username || !password}
              >
                {carregando ? "Entrando..." : "Entrar"}
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p className="mb-2">Usuários de teste:</p>
            <div className="space-y-1">
              <p><strong>admin</strong> / admin123 (Administrador)</p>
              <p><strong>carlos.silva</strong> / 123456 (Técnico)</p>
              <p><strong>maria.costa</strong> / 123456 (Usuário)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
