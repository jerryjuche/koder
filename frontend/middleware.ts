import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com https://vercel.live`,
      "worker-src 'self' blob:",
      "style-src 'self' 'unsafe-inline' https://accounts.google.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https: wss://koder-update.onrender.com wss://koder.onrender.com wss://koder-py.onrender.com ws://localhost:8080",
      "frame-src https://accounts.google.com https://vercel.live",
      "object-src 'none'",
      "base-uri 'self'",
    ].join('; '),
  );
  response.headers.set('X-CSP-Nonce', nonce);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|vs/|icons/).*)',
  ],
};
