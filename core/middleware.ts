import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Verificar se o usuário está autenticado
  const isAuthenticated = request.cookies.get('sessionid') || 
                          request.cookies.get('csrftoken')

  // Rotas que requerem autenticação
  const protectedRoutes = ['/dashboard', '/chamado', '/cadastrar-chamado', '/editar-chamado']
  
  // Verificar se a rota atual é protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Se é uma rota protegida e o usuário não está autenticado
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Se está na página de login e já está autenticado
  if (request.nextUrl.pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirecionar página inicial para dashboard se autenticado, senão para login
  if (request.nextUrl.pathname === '/') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

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
