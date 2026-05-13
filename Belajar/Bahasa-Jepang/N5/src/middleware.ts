import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter (per IP, per window)
// In production, use Redis-backed rate limiter for distributed deployments
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000; // 1 minute window
const MAX_REQUESTS = 30; // 30 requests per minute per IP (generous for learning app)
const AI_MAX_REQUESTS = 15; // Stricter limit for AI endpoints

function isRateLimited(ip: string, maxRequests: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > maxRequests;
}

// Cleanup stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60_000;
let lastCleanup = Date.now();

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

  // Periodic cleanup
  if (Date.now() - lastCleanup > CLEANUP_INTERVAL) {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(key);
    }
    lastCleanup = Date.now();
  }

  // Only rate limit API routes (skip download — it's a one-off large response)
  if (pathname.startsWith('/api/') && !pathname.includes('/download')) {
    // Stricter limits for AI-intensive endpoints
    const isAIEndpoint =
      pathname.includes('/ai-chat') ||
      pathname.includes('/kaiwa/') ||
      pathname.includes('/choukai/') ||
      pathname.includes('/tts') ||
      pathname.includes('/quiz/generate');

    const maxRequests = isAIEndpoint ? AI_MAX_REQUESTS : MAX_REQUESTS;

    if (isRateLimited(ip, maxRequests)) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan. Coba lagi dalam beberapa detik.' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
          },
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
