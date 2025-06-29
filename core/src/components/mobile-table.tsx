"use client"

import { Badge } from "@/components/ui/badge"
import { type Chamado } from "@/lib/api"

interface MobileTableProps {
  data: Chamado[]
  onRowClick?: (chamado: Chamado) => void
}

const formatDate = (dateString: string) => {
  // Use consistent formatting to avoid hydration mismatch
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
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

export function MobileTable({ data, onRowClick }: MobileTableProps) {
  return (
    <div className="space-y-3">
      {data.map((chamado) => (
        <div 
          key={chamado.id} 
          className="bg-white border rounded-lg p-4 space-y-3 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => onRowClick?.(chamado)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-xs text-muted-foreground mb-1">
                {formatDate(chamado.atualizado_em)}
              </div>
              <h3 className="font-medium text-sm leading-tight">
                {chamado.titulo}
              </h3>
            </div>
            <div className="flex items-center gap-2 ml-3">
              <Badge variant={getStatusVariant(chamado.status)} className="text-xs">
                {getStatusLabel(chamado.status)}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
