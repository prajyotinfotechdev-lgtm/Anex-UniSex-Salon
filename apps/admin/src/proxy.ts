import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/forgot-password', '/reset-password'];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token');

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  const isNextInternal = pathname.startsWith('/_next') || pathname.includes('.');

  // Redirect unauthenticated users to login
  if (!isPublicRoute && !isNextInternal && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect authenticated users away from public routes (except reset-password which can be used with token)
  if (isPublicRoute && token && !pathname.startsWith('/reset-password')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
