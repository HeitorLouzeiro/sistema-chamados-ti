"use client"

import { useEffect, useState } from "react"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
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
import { DataTable } from "@/components/data-table"
import { columns } from "@/components/columns-api"
import { StatsCard } from "@/components/stats-card"
import { Ticket, Clock, CheckCircle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useAuthRedirect } from "@/hooks/use-auth-redirect"
import { chamadoService, type Chamado, type EstatisticasDashboard } from "@/lib/api"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"

export default function DashboardPage() {
  // Verificar autenticação
  const { shouldRedirect } = useAuthRedirect({ requireAuth: true })
  const { usuario } = useAuth()
  
  const [estatisticas, setEstatisticas] = useState<EstatisticasDashboard | null>(null)
  const [chamados, setChamados] = useState<Chamado[]>([])
  const [carregandoEstatisticas, setCarregandoEstatisticas] = useState(true)
  const [carregandoChamados, setCarregandoChamados] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [pickerValue, setPickerValue] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !shouldRedirect) {
      carregarEstatisticas()
    }
  }, [mounted, shouldRedirect])

  useEffect(() => {
    if (mounted && !shouldRedirect && usuario) {
      carregarChamados()
    }
  }, [mounted, shouldRedirect, usuario])

  // Se deve redirecionar ou não montado ainda, não renderizar nada
  if (!mounted || shouldRedirect) {
    return null
  }

  const carregarEstatisticas = async () => {
    try {
      const dados = await chamadoService.obterEstatisticas()
      setEstatisticas(dados)
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error)
    } finally {
      setCarregandoEstatisticas(false)
    }
  }

  const aplicarFiltroData = () => {
    carregarChamados()
  }

  const carregarChamados = async () => {
    try {
      setCarregandoChamados(true)
      
      // Construir filtros baseados no tipo de usuário
      const filtros: Record<string, any> = {
        ordering: '-criado_em',
        page_size: 10
      }

      // Aplicar filtro específico baseado no tipo de usuário
      if (usuario?.tipo_usuario === 'usuario') {
        filtros.solicitante = usuario.id
      } else if (usuario?.tipo_usuario === 'tecnico') {
        filtros.tecnico_ou_aberto = usuario.id
      }
      // Admin não precisa de filtros (vê todos os chamados)

      // Aplicar filtro de data se selecionado
      if (dateRange?.from) {
        filtros.criado_em__gte = format(dateRange.from, 'yyyy-MM-dd')
        console.log('Filtro data início:', format(dateRange.from, 'yyyy-MM-dd'))
      }
      if (dateRange?.to) {
        filtros.criado_em__lte = format(dateRange.to, 'yyyy-MM-dd')
        console.log('Filtro data fim:', format(dateRange.to, 'yyyy-MM-dd'))
      }

      console.log('Filtros aplicados:', filtros)
      const response = await chamadoService.listar(filtros)
      setChamados(response.results)
    } catch (error) {
      console.error("Erro ao carregar chamados:", error)
    } finally {
      setCarregandoChamados(false)
    }
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
                  <BreadcrumbLink href="#">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Meus Chamados</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Bem-vindo, {usuario?.nome_completo}!
              </p>
            </div>
          </div>

          {/* Estatísticas - apenas para técnicos e administradores */}
          {(usuario?.tipo_usuario === 'admin') && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {carregandoEstatisticas ? (
                [...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))
              ) : (
                <>
                  <StatsCard
                    title="Total de Chamados"
                    value={estatisticas?.total_chamados || 0}
                    description="Todos os chamados cadastrados"
                    icon={<Ticket className="h-4 w-4 text-muted-foreground" />}
                  />
                  <StatsCard
                    title="Chamados Abertos"
                    value={estatisticas?.chamados_abertos || 0}
                    description="Aguardando atendimento"
                    icon={<Clock className="h-4 w-4 text-muted-foreground" />}
                  />
                  <StatsCard
                    title="Em Atendimento"
                    value={estatisticas?.chamados_em_atendimento || 0}
                    description="Sendo resolvidos pelos técnicos"
                    icon={<Clock className="h-4 w-4 text-muted-foreground" />}
                  />
                  <StatsCard
                    title="Encerrados"
                    value={estatisticas?.chamados_encerrados || 0}
                    description="Concluídos com sucesso"
                    icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
                  />
                </>
              )}
            </div>
          )}

          {/* Estatísticas do usuário */}
          {(usuario?.tipo_usuario === 'tecnico' || usuario?.tipo_usuario === 'usuario') && (
            <div className="grid gap-4 md:grid-cols-2">
              {carregandoEstatisticas ? (
                [...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))
              ) : (
                <>
                  <StatsCard
                    title="Meus Chamados"
                    value={estatisticas?.meus_chamados || 0}
                    description={
                      usuario?.tipo_usuario === 'tecnico' 
                        ? "Chamados disponíveis e atribuídos a você"
                        : "Chamados criados por você"
                    }
                    icon={<Ticket className="h-4 w-4 text-muted-foreground" />}
                  />
                  <StatsCard
                    title="Pendentes"
                    value={estatisticas?.meus_chamados_pendentes || 0}
                    description={
                      usuario?.tipo_usuario === 'tecnico'
                        ? "Chamados abertos e seus em andamento"
                        : "Seus chamados pendentes"
                    }
                    icon={<Clock className="h-4 w-4 text-muted-foreground" />}
                  />
                </>
              )}
            </div>
          )}

          {/* Tabela de chamados recentes */}
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-semibold leading-none tracking-tight">
                    {usuario?.tipo_usuario === 'usuario' 
                      ? 'Meus Chamados Recentes' 
                      : usuario?.tipo_usuario === 'tecnico'
                      ? 'Chamados Disponíveis e Meus'
                      : 'Chamados Recentes'
                    }
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {usuario?.tipo_usuario === 'usuario' 
                      ? 'Chamados que você criou'
                      : usuario?.tipo_usuario === 'tecnico'
                      ? 'Chamados abertos para assumir e seus chamados em andamento'
                      : 'Últimos chamados cadastrados no sistema'
                    }
                  </p>
                </div>
                <div className="flex items-end gap-2">
                  <DatePickerWithRange
                    label="Filtrar por período"
                    value={pickerValue}
                    onChange={(value) => {
                      console.log('DateRange valor:', value)
                      setPickerValue(value)
                      
                      if (value && value.start && value.end) {
                        // Converter CalendarDate para Date
                        const startDate = new Date(value.start.year, value.start.month - 1, value.start.day)
                        const endDate = new Date(value.end.year, value.end.month - 1, value.end.day)
                        
                        setDateRange({
                          from: startDate,
                          to: endDate
                        })
                        
                        console.log('DateRange definido:', { from: startDate, to: endDate })
                      } else if (value && value.start) {
                        // Apenas data de início selecionada
                        const startDate = new Date(value.start.year, value.start.month - 1, value.start.day)
                        setDateRange({
                          from: startDate,
                          to: undefined
                        })
                      } else {
                        setDateRange(undefined)
                      }
                    }}
                  />
                  {dateRange && (dateRange.from || dateRange.to) && (
                    <Button
                      variant="default"
                      onClick={aplicarFiltroData}
                      className="flex items-center gap-1 h-10"
                    >
                      Aplicar filtro
                    </Button>
                  )}
                  {dateRange && (dateRange.from || dateRange.to) && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDateRange(undefined)
                        setPickerValue(null)
                        console.log('Filtro de data removido')
                        // Recarregar chamados sem filtro
                        setTimeout(() => carregarChamados(), 100)
                      }}
                      className="flex items-center gap-1 h-10"
                    >
                      Limpar filtro
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 pt-0">
              {carregandoChamados ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : (
                <DataTable columns={columns} data={chamados} />
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
