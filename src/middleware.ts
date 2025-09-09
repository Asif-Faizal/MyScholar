import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Skip middleware for API routes, static files, and login page
  if (
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/static/')
  ) {
    return NextResponse.next()
  }

  // Check if user is authenticated for dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // In a real app, you'd check the JWT token here
    // For now, we'll let the client-side handle authentication
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
