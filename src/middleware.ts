import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Skip API routes - they have their own protection
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Get the widget key from URL params or cookie
  const urlKey = request.nextUrl.searchParams.get('key');
  const cookieKey = request.cookies.get('widget_key')?.value;
  const key = urlKey || cookieKey;

  // Get allowed keys from environment (comma-separated)
  const allowedKeys = process.env.WIDGET_ACCESS_KEYS?.split(',').map(k => k.trim()) || [];

  // If no keys configured, allow all access (dev mode)
  if (allowedKeys.length === 0 || allowedKeys[0] === '') {
    return NextResponse.next();
  }

  // Validate the key
  if (!key || !allowedKeys.includes(key)) {
    return new NextResponse(
      JSON.stringify({
        error: 'Unauthorized',
        message: 'Valid access key required. Add ?key=YOUR_KEY to the URL.'
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // If key was in URL, set it as a cookie so it persists
  const response = NextResponse.next();
  if (urlKey && !cookieKey) {
    response.cookies.set('widget_key', urlKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none', // Required for iframe embedding
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
