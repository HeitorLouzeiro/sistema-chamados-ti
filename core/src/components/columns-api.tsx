"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Eye, Edit, MoreHorizontal, CheckCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { type Chamado, chamadoService } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import toast from "react-hot-toast"

// Função para formatação consistente de data
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  }) + ' ' + date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case "aberto":
      return "destructive"
    case "em_atendimento":
      return "default"
    case "encerrado":
      return "secondary"
    case "cancelado":
      return "outline"
    default:
      return "outline"
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case "aberto":
      return "Aberto"
    case "em_atendimento":
      return "Em Atendimento" 
    case "encerrado":
      return "Encerrado"
    case "cancelado":
      return "Cancelado"
    default:
      return status
  }
}

function ActionsCell({ chamado }: { chamado: Chamado }) {
  const router = useRouter()
  const { usuario } = useAuth()

  // Função auxiliar para comparar IDs de forma segura
  const compararIds = (id1: any, id2: any): boolean => {
    if (!id1 || !id2) return false
    return id1 == id2 || String(id1) === String(id2)
  }

  const handleEncerrarChamado = async () => {
    if (!usuario || !chamado) return

    const toastId = toast.loading("Encerrando chamado...")

    try {
      await chamadoService.atualizarStatus(chamado.id, "encerrado")
      toast.success("Chamado encerrado com sucesso!", { id: toastId })
      
      // Recarregar a página para atualizar a lista
      window.location.reload()
    } catch (error) {
      console.error('Erro ao encerrar chamado:', error)
      toast.error("Erro ao encerrar o chamado", { id: toastId })
    }
  }

  // Verificar se o usuário pode encerrar o chamado
  const podeEncerrar = usuario && chamado.status !== "encerrado" && (
    usuario.tipo_usuario === 'tecnico' || 
    usuario.tipo_usuario === 'admin' || 
    compararIds(usuario.id, chamado.solicitante?.id)
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push(`/chamado/${chamado.id}`)}>
          <Eye className="mr-2 h-4 w-4" />
          Visualizar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/editar-chamado/${chamado.id}`)}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        {podeEncerrar && (
          <DropdownMenuItem onClick={handleEncerrarChamado} className="text-green-600">
            <CheckCircle className="mr-2 h-4 w-4" />
            Encerrar Chamado
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const columns: ColumnDef<Chamado>[] = [
  {
    accessorKey: "numero",
    header: "Número",
    cell: ({ row }) => {
      return <span className="font-mono">#{row.getValue("numero")}</span>
    },
  },
  {
    accessorKey: "titulo",
    header: "Título",
    cell: ({ row }) => {
      return <span className="font-medium">{row.getValue("titulo")}</span>
    },
  },
  {
    accessorKey: "tipo_servico_nome",
    header: "Serviço",
    cell: ({ row }) => {
      return <span>{row.getValue("tipo_servico_nome")}</span>
    },
  },
  {
    accessorKey: "tecnico_responsavel",
    header: "Técnico",
    cell: ({ row }) => {
      const tecnico = row.original.tecnico_responsavel
      
      if (!tecnico) {
        return <span className="text-muted-foreground">Não atribuído</span>
      }

      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src="" />
            <AvatarFallback className="text-xs">
              {tecnico.iniciais}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{tecnico.nome_completo}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={getStatusVariant(status)}>
          {getStatusLabel(status)}
        </Badge>
      )
    },
  },
  {
    accessorKey: "atualizado_em",
    header: "Atualizado em",
    cell: ({ row }) => {
      const data = row.getValue("atualizado_em") as string
      const dataFormatada = formatDate(data)
      return <span className="text-sm text-muted-foreground">{dataFormatada}</span>
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const chamado = row.original
      return <ActionsCell chamado={chamado} />
    },
  },
]
