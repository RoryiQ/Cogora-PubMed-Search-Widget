import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if service is active (paid)
  const serviceActive = process.env.SERVICE_ACTIVE !== 'false';

  if (!serviceActive) {
    return new NextResponse(
      `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Service Unavailable</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #fff;
          }
          .container {
            text-align: center;
            padding: 3rem 2rem;
            max-width: 720px;
          }
          h1 {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: #f8d7da;
          }
          p {
            font-size: 0.9rem;
            line-height: 1.6;
            color: rgba(255,255,255,0.8);
            margin-bottom: 0.75rem;
          }
          .contact {
            margin-top: 2rem;
            padding: 1rem 1.5rem;
            background: rgba(255,255,255,0.08);
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.12);
          }
          .contact p {
            font-size: 1.2rem;
            font-weight: 600;
            color: rgba(255,255,255,0.9);
            margin: 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div style="font-size: 4rem; margin-bottom: 1.5rem; opacity: 0.9;">&#9888;&#65039;</div>
          <h1><span style="color: #e74c3c; font-size: 2rem;">&#10060;</span> &nbsp;WARNING&nbsp; <span style="color: #e74c3c; font-size: 2rem;">&#10060;</span></h1>
          <h2 style="font-size: 1.4rem; font-weight: 700; color: #f8d7da; margin-bottom: 1rem;">Service is Indefinitely Suspended</h2>
          <div class="contact" style="margin-bottom: 1.5rem;">
            <p><strong>Flagged Accounts:</strong> Richard Springham, Claire Springham</p>
          </div>
          <p>This service has been deactivated due to suspicious and unresolved payment obligations. The associated accounts have demonstrated a consistent pattern of bad-faith conduct, including evasion of financial commitments and failure to honour agreed terms.</p>
          <p>Following a thorough review, the account holders have been deemed untrustworthy and unfit for business engagement. This service will remain permanently suspended pending resolution of all outstanding matters.</p>
          <p style="margin-top: 1.5rem;">If you believe this suspension is unwarranted, please first check your bank account or payment records to confirm whether any transfers have been successfully issued. If payment has been made, contact the development team with proof of transfer so this can be investigated and resolved promptly.</p>
        </div>
      </body>
      </html>`,
      {
        status: 503,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }

  // Skip API routes - they have their own protection
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Get the widget key from URL params or cookie
  const urlKey = request.nextUrl.searchParams.get('key');
  const cookieKey = request.cookies.get('widget_key')?.value;
  const key = urlKey || cookieKey;

  // Skip auth in development
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  // Get allowed keys from environment (comma-separated)
  const allowedKeys = process.env.WIDGET_ACCESS_KEYS?.split(',').map(k => k.trim()) || [];

  // If no keys configured, allow all access
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
