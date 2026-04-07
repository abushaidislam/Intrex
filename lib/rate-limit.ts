import { cookies } from 'next/headers';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5; // Max 5 attempts per window

/**
 * Check rate limit for an identifier (IP address or email)
 * Returns true if allowed, false if rate limited
 */
export async function checkRateLimit(identifier: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    // New window or expired
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetTime: now + RATE_LIMIT_WINDOW_MS };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count++;
  return { allowed: true, remaining: MAX_REQUESTS - entry.count, resetTime: entry.resetTime };
}

/**
 * Get client IP from request headers with proxy awareness
 */
export function getClientIp(request: Request): string {
  // In production behind Vercel/ALB, use the last hop (trusted proxy)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // Take the last IP (closest to the server, most trustworthy)
    const ips = forwarded.split(',').map(ip => ip.trim());
    return ips[ips.length - 1] || 'unknown';
  }
  
  return request.headers.get('x-real-ip') || 'unknown';
}

/**
 * Clean up expired rate limit entries (call periodically)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}
