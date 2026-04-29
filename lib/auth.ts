import { cookies } from 'next/headers';
import { prisma } from './prisma';
import crypto from 'crypto';
import {
  cacheGet,
  cacheSet,
  cacheDel,
  CACHE_KEYS,
  CACHE_TTL,
} from './redis';

// ─── Token generation ──────────────────────────────────────────────────
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// ─── Session data shape stored in Redis ────────────────────────────────
interface CachedSession {
  userId: string;
  email: string;
  expiresAt: string; // ISO date string
}

// ─── Create a session in DB + Redis ────────────────────────────────────
export async function createSession(userId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  // Persist to database
  const session = await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
    include: {
      user: {
        select: { id: true, email: true },
      },
    },
  });

  // Warm the Redis cache so the first request is instant
  const cached: CachedSession = {
    userId: session.user.id,
    email: session.user.email,
    expiresAt: expiresAt.toISOString(),
  };
  await cacheSet(CACHE_KEYS.session(token), cached, CACHE_TTL.SESSION);

  return token;
}

// ─── Verify token (Redis-first, DB-fallback) ───────────────────────────
export async function verifyToken(
  token: string,
): Promise<{ userId: string; email: string } | null> {
  if (!token) return null;

  // 1. Try Redis cache first
  const cached = await cacheGet<CachedSession>(CACHE_KEYS.session(token));

  if (cached) {
    // Check expiry from cached data
    if (new Date() > new Date(cached.expiresAt)) {
      // Expired – clean up both cache and DB
      await Promise.all([
        cacheDel(CACHE_KEYS.session(token)),
        prisma.session
          .deleteMany({ where: { token } })
          .catch(() => {}),
      ]);
      return null;
    }
    return { userId: cached.userId, email: cached.email };
  }

  // 2. Cache miss → query database
  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        select: { id: true, email: true },
      },
    },
  });

  if (!session || new Date() > session.expiresAt) {
    // Delete expired session from DB
    if (session) {
      await prisma.session
        .delete({ where: { id: session.id } })
        .catch(() => {});
    }
    return null;
  }

  // 3. Re-populate cache for subsequent requests
  const remainingTtl = Math.max(
    1,
    Math.floor((session.expiresAt.getTime() - Date.now()) / 1000),
  );
  const toCache: CachedSession = {
    userId: session.user.id,
    email: session.user.email,
    expiresAt: session.expiresAt.toISOString(),
  };
  await cacheSet(CACHE_KEYS.session(token), toCache, remainingTtl);

  return {
    userId: session.user.id,
    email: session.user.email,
  };
}

// ─── Get current user from cookie ──────────────────────────────────────
export async function getCurrentUser(): Promise<{
  userId: string;
  email: string;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) return null;

  return verifyToken(token);
}

// ─── Delete session from DB + Redis ────────────────────────────────────
export async function deleteSession(token: string): Promise<void> {
  if (!token) return;

  await Promise.all([
    cacheDel(CACHE_KEYS.session(token)),
    prisma.session.deleteMany({ where: { token } }).catch(() => {}),
  ]);
}

// ─── Clean up expired sessions ─────────────────────────────────────────
export async function cleanupExpiredSessions(): Promise<void> {
  await prisma.session.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });
  // Note: Redis entries with TTL will auto-expire, no manual cleanup needed
}
