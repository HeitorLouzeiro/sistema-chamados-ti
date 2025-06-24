import { EditarChamadoForm } from "@/components/editar-chamado-form"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditarChamadoPage({ params }: PageProps) {
  const { id } = await params
  
  return (
    <div className="container mx-auto p-6">
      <EditarChamadoForm chamadoId={id} />
    </div>
  )
}
