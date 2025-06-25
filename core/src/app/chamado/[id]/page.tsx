"use client"

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
import { ChamadoDetails } from "@/components/chamado-details"
import { useAuthRedirect } from "@/hooks/use-auth-redirect"
import { use } from "react"

interface ChamadoDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ChamadoDetailPage({ params }: ChamadoDetailPageProps) {
  // Verificar autenticação
  const { shouldRedirect } = useAuthRedirect({ requireAuth: true })
  
  // Resolver params usando React.use()
  const resolvedParams = use(params)
  
  // Se deve redirecionar, não renderizar nada
  if (shouldRedirect) {
    return null
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
                  <BreadcrumbPage>Chamado #{resolvedParams.id}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <ChamadoDetails chamadoId={resolvedParams.id} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
