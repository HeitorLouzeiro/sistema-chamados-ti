"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Eye, Edit, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { type Chamado } from "@/lib/api"

const getStatusVariant = (status: string) => {
  switch (status) {
    case "aberto":
      return "destructive"
    case "em_atendimento":
      return "default"
    case "encerrado":
      return "secondary"
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
    default:
      return status
  }
}

function ActionCell({ chamado }: { chamado: Chamado }) {
  const router = useRouter()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
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
    accessorKey: "tipo_servico",
    header: "Serviço",
    cell: ({ row }) => {
      const tipoServico = row.original.tipo_servico
      return <span>{tipoServico.nome}</span>
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
      const data = new Date(row.getValue("atualizado_em"))
      return (
        <span className="text-sm text-muted-foreground">
          {data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      )
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <ActionCell chamado={row.original} />,
  },
]
