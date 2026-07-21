import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const isDev = process.env.NODE_ENV === 'development';

  // Allow http: in dev for localhost backend; https: only in production
  const connectSrc = isDev ? "'self' http: https: ws: wss:" : "'self' https: wss:";

  const csp = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com https://vercel.live https://cdn.jsdelivr.net https://va.vercel-scripts.com;
    worker-src 'self' blob: https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline' https://accounts.google.com;
    style-src-elem 'self' 'unsafe-inline' https://accounts.google.com;
    img-src 'self' data: blob: https:;
    font-src 'self' data:;
    connect-src ${connectSrc};
    frame-src https://accounts.google.com https://vercel.live;
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
