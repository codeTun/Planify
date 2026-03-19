import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import {
  cacheGet,
  cacheSet,
  CACHE_KEYS,
  CACHE_TTL,
} from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use a dedicated cache key for "my tasks" (assigned to me)
    const cacheKey = `${CACHE_KEYS.userTasks(user.userId)}:assigned`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const tasks = await prisma.task.findMany({
      where: {
        assigneeId: user.userId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Cache the result
    await cacheSet(cacheKey, tasks, CACHE_TTL.TASK_LIST);

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Get my tasks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
