import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Para JWT, não verificamos cookies de sessão - deixamos o frontend lidar com isso
  // O middleware apenas garante que certas rotas sejam protegidas pela aplicação cliente
  
  // Redirecionar página inicial para login (sem verificar autenticação aqui)
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Permitir que todas as outras rotas passem - a verificação de autenticação
  // será feita pelo useAuthRedirect nos componentes
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
