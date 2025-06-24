import { EditarChamadoForm } from "@/components/editar-chamado-form"

interface PageProps {
  params: {
    id: string
  }
}

export default function EditarChamadoPage({ params }: PageProps) {
  return (
    <div className="container mx-auto p-6">
      <EditarChamadoForm chamadoId={params.id} />
    </div>
  )
}
