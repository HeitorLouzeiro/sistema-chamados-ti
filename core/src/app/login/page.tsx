import Image from "next/image"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex justify-center">
          <Image
            src="/corrente-logo.png"
            alt="Logo da Prefeitura de Corrente"
            width={350}
            height={350}
            className="object-contain"
          />
        </div>
        <LoginForm />
      </div>
    </div>
  )
}