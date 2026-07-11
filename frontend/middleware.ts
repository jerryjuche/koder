import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Set strict CSP
  const csp = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com https://vercel.live 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self' data:;
    connect-src 'self' https: wss:;
    frame-src https://vercel.live;
    object-src 'none';
    base-uri 'self';
    frame-ancestors 'none';
    form-action 'self';
  `.replace(/\s+/g, ' ').trim();

  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
