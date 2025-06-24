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
import { columns, type Chamado } from "@/components/columns"
import { StatsCard } from "@/components/stats-card"
import { Ticket, Clock, CheckCircle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Page() {
  const data: Chamado[] = [
    {
      id: "00003",
      titulo: "Rede lenta",
      servico: "Instalação de Rede",
      tecnico: {
        nome: "Carlos Silva",
        iniciais: "CS"
      },
      status: "aberto",
      atualizadoEm: "13/04/25 20:56",
      imagem: {
        nome: "teste-velocidade.png",
        url: "/uploads/chamados/00003/teste-velocidade.png",
        tamanho: "1.1 MB"
      }
    },
    {
      id: "00004",
      titulo: "Backup não está funcionando",
      servico: "Recuperação de Dados",
      tecnico: {
        nome: "Carlos Silva",
        iniciais: "CS"
      },
      status: "aberto",
      atualizadoEm: "12/04/25 15:20"
    },
    {
      id: "00001",
      titulo: "Computador não liga",
      servico: "Manutenção de Hardware",
      tecnico: {
        nome: "Carlos Silva",
        iniciais: "CS"
      },
      status: "em-atendimento",
      atualizadoEm: "12/04/25 09:01"
    },
    {
      id: "00002",
      titulo: "Instalação de software de gestão",
      servico: "Suporte de Software",
      tecnico: {
        nome: "Ana Oliveira",
        iniciais: "AO"
      },
      status: "encerrado",
      atualizadoEm: "10/04/25 10:15"
    },
    {
      id: "00005",
      titulo: "Meu fone não conecta no computador",
      servico: "Suporte de Software",
      tecnico: {
        nome: "Ana Oliveira",
        iniciais: "AO"
      },
      status: "encerrado",
      atualizadoEm: "11/04/25 15:16"
    }
  ]

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
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <StatsCard
              title="Total de Chamados"
              value={data.length}
              description="Todos os chamados registrados"
              icon={<Ticket className="h-4 w-4 text-muted-foreground" />}
            />
            <StatsCard
              title="Em Atendimento"
              value={data.filter(c => c.status === "em-atendimento").length}
              description="Chamados sendo processados"
              icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            />
            <StatsCard
              title="Encerrados"
              value={data.filter(c => c.status === "encerrado").length}
              description="Chamados finalizados"
              icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
          <div className="bg-white rounded-xl border p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Meus Chamados</h2>
              <Button asChild>
                <Link href="/cadastrar-chamado">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Chamado
                </Link>
              </Button>
            </div>
            <DataTable columns={columns} data={data} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
