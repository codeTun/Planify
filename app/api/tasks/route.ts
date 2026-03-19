import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import {
  cacheGet,
  cacheSet,
  CACHE_KEYS,
  CACHE_TTL,
  invalidateTaskCache,
} from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');

    // Determine cache key based on whether we're filtering by project
    const cacheKey = projectId
      ? CACHE_KEYS.projectTasks(projectId)
      : CACHE_KEYS.userTasks(user.userId);

    // Try Redis cache first
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const tasks = await prisma.task.findMany({
      where: {
        ...(projectId && { projectId }),
        project: {
          OR: [
            { ownerId: user.userId },
            { members: { some: { userId: user.userId } } },
          ],
        },
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
    console.error('Get tasks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, projectId, priority, dueDate, assigneeId } = body;

    if (!title || !projectId) {
      return NextResponse.json(
        { error: 'Title and project ID are required' },
        { status: 400 }
      );
    }

    // Check if user has access to project & get member IDs for invalidation
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: user.userId },
          { members: { some: { userId: user.userId } } },
        ],
      },
      include: {
        members: { select: { userId: true } },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or unauthorized' },
        { status: 404 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        projectId,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId: assigneeId || null,
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
    });

    // Invalidate caches for owner, members, and assignee
    const affectedUserIds = new Set([
      user.userId,
      project.ownerId,
      ...project.members.map((m) => m.userId),
    ]);
    if (assigneeId) affectedUserIds.add(assigneeId);
    await invalidateTaskCache(task.id, projectId, [...affectedUserIds]);

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    console.error('Create task error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });

    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid project or assignee reference' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
