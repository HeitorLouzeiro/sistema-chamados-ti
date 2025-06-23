"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

export type Chamado = {
  id: string
  titulo: string
  servico: string
  valorTotal: string
  tecnico: {
    nome: string
    avatar?: string
    iniciais: string
  }
  status: "aberto" | "em-atendimento" | "encerrado"
  atualizadoEm: string
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

export const columns: ColumnDef<Chamado>[] = [
  {
    accessorKey: "atualizadoEm",
    header: "Atualizado em",
    cell: ({ row }) => {
      return <div className="text-sm text-muted-foreground">{row.getValue("atualizadoEm")}</div>
    },
  },
  {
    accessorKey: "id",
    header: "Id",
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("id")}</div>
    },
  },
  {
    accessorKey: "titulo",
    header: "Título",
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("titulo")}</div>
    },
  },
  {
    accessorKey: "servico",
    header: "Serviço",
    cell: ({ row }) => {
      return <div>{row.getValue("servico")}</div>
    },
  },
  {
    accessorKey: "tecnico",
    header: "Técnico",
    cell: ({ row }) => {
      const tecnico = row.getValue("tecnico") as Chamado["tecnico"]
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={tecnico.avatar} />
            <AvatarFallback className="text-xs">{tecnico.iniciais}</AvatarFallback>
          </Avatar>
          <span className="text-sm">{tecnico.nome}</span>
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
    id: "actions",
    cell: ({ row }) => {
      return (
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      )
    },
  },
]
