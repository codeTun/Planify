import Redis from 'ioredis';

// ─── Redis Client Singleton ────────────────────────────────────────────
const globalForRedis = globalThis as unknown as {
  redis?: Redis;
};

function createRedisClient(): Redis {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  const client = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    reconnectOnError(err) {
      const targetError = 'READONLY';
      if (err.message.includes(targetError)) {
        return true;
      }
      return false;
    },
    lazyConnect: true,
  });

  client.on('error', (err) => {
    console.error('[Redis] Connection error:', err.message);
  });

  client.on('connect', () => {
    console.log('[Redis] Connected successfully');
  });

  client.on('reconnecting', () => {
    console.log('[Redis] Reconnecting...');
  });

  return client;
}

export const redis: Redis =
  globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

// ─── Connection helper ─────────────────────────────────────────────────
let isConnected = false;

async function ensureConnection(): Promise<boolean> {
  if (isConnected && redis.status === 'ready') return true;

  try {
    if (redis.status === 'wait') {
      await redis.connect();
    }
    isConnected = true;
    return true;
  } catch {
    isConnected = false;
    console.warn('[Redis] Could not connect – falling back to no-cache mode');
    return false;
  }
}

// ─── Cache Key Prefixes ────────────────────────────────────────────────
export const CACHE_KEYS = {
  // Session keys
  session: (token: string) => `session:${token}`,

  // User keys
  user: (userId: string) => `user:${userId}`,
  userByEmail: (email: string) => `user:email:${email}`,
  usersList: () => `users:list`,

  // Project keys
  project: (projectId: string) => `project:${projectId}`,
  userProjects: (userId: string) => `user:${userId}:projects`,

  // Task keys
  task: (taskId: string) => `task:${taskId}`,
  userTasks: (userId: string) => `user:${userId}:tasks`,
  projectTasks: (projectId: string) => `project:${projectId}:tasks`,
} as const;

// ─── TTL Constants (seconds) ───────────────────────────────────────────
export const CACHE_TTL = {
  SESSION: 60 * 60 * 24 * 7,  // 7 days  — matches session expiry
  USER: 60 * 60,               // 1 hour
  USER_LIST: 60 * 5,           // 5 minutes
  PROJECT: 60 * 10,            // 10 minutes
  PROJECT_LIST: 60 * 5,        // 5 minutes
  TASK: 60 * 10,               // 10 minutes
  TASK_LIST: 60 * 5,           // 5 minutes
} as const;

// ─── Generic Cache Helpers ─────────────────────────────────────────────

/**
 * Retrieve a cached value. Returns null on miss or if Redis is unavailable.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const connected = await ensureConnection();
  if (!connected) return null;

  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (err) {
    console.warn(`[Redis] cacheGet error for key "${key}":`, err);
    return null;
  }
}

/**
 * Store a value in cache with a TTL (in seconds).
 */
export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number,
): Promise<void> {
  const connected = await ensureConnection();
  if (!connected) return;

  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (err) {
    console.warn(`[Redis] cacheSet error for key "${key}":`, err);
  }
}

/**
 * Delete one or more cache keys.
 */
export async function cacheDel(...keys: string[]): Promise<void> {
  const connected = await ensureConnection();
  if (!connected) return;

  try {
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    console.warn('[Redis] cacheDel error:', err);
  }
}

/**
 * Delete all keys matching a glob pattern (e.g. `user:abc:*`).
 * Uses SCAN to avoid blocking.
 */
export async function cacheDelPattern(pattern: string): Promise<void> {
  const connected = await ensureConnection();
  if (!connected) return;

  try {
    let cursor = '0';
    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );
      cursor = nextCursor;
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== '0');
  } catch (err) {
    console.warn(`[Redis] cacheDelPattern error for "${pattern}":`, err);
  }
}

// ─── Invalidation Helpers ──────────────────────────────────────────────

/**
 * Invalidate all caches related to a specific user.
 */
export async function invalidateUserCache(userId: string): Promise<void> {
  await cacheDel(
    CACHE_KEYS.user(userId),
    CACHE_KEYS.userProjects(userId),
    CACHE_KEYS.userTasks(userId),
    CACHE_KEYS.usersList(),
  );
}

/**
 * Invalidate all caches related to a specific project + the owning user's project list.
 */
export async function invalidateProjectCache(
  projectId: string,
  affectedUserIds: string[] = [],
): Promise<void> {
  const keys = [
    CACHE_KEYS.project(projectId),
    CACHE_KEYS.projectTasks(projectId),
  ];

  // Also bust each affected user's project & task lists
  for (const uid of affectedUserIds) {
    keys.push(CACHE_KEYS.userProjects(uid));
    keys.push(CACHE_KEYS.userTasks(uid));
  }

  await cacheDel(...keys);
}

/**
 * Invalidate all caches related to a specific task + its project.
 */
export async function invalidateTaskCache(
  taskId: string,
  projectId: string,
  affectedUserIds: string[] = [],
): Promise<void> {
  const keys = [
    CACHE_KEYS.task(taskId),
    CACHE_KEYS.projectTasks(projectId),
  ];

  for (const uid of affectedUserIds) {
    keys.push(CACHE_KEYS.userTasks(uid));
    keys.push(CACHE_KEYS.userProjects(uid));
  }

  await cacheDel(...keys);
}

/**
 * Invalidate session cache.
 */
export async function invalidateSessionCache(token: string): Promise<void> {
  await cacheDel(CACHE_KEYS.session(token));
}
