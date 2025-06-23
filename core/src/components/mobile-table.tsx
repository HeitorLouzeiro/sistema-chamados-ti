"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { type Chamado } from "@/components/columns"

interface MobileTableProps {
  data: Chamado[]
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

export function MobileTable({ data }: MobileTableProps) {
  return (
    <div className="space-y-3">
      {data.map((chamado) => (
        <div key={chamado.id} className="bg-white border rounded-lg p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-xs text-muted-foreground mb-1">
                {chamado.atualizadoEm}
              </div>
              <h3 className="font-medium text-sm leading-tight">
                {chamado.titulo}
              </h3>
            </div>
            <div className="flex items-center gap-2 ml-3">
              <Badge variant={getStatusVariant(chamado.status)} className="text-xs">
                {getStatusLabel(chamado.status)}
              </Badge>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
