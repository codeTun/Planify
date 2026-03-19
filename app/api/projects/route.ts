import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import {
  cacheGet,
  cacheSet,
  CACHE_KEYS,
  CACHE_TTL,
  invalidateProjectCache,
  invalidateUserCache,
} from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try Redis cache first
    const cacheKey = CACHE_KEYS.userProjects(user.userId);
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: user.userId },
          { members: { some: { userId: user.userId } } },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Store in cache
    await cacheSet(cacheKey, projects, CACHE_TTL.PROJECT_LIST);

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
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
    const { name, description, memberIds } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    // Create project with members in a transaction
    const project = await prisma.$transaction(async (tx) => {
      // Create the project
      const newProject = await tx.project.create({
        data: {
          name,
          description: description || null,
          ownerId: user.userId,
        },
      });

      // Add members if provided
      if (memberIds && Array.isArray(memberIds) && memberIds.length > 0) {
        const uniqueMemberIds = [...new Set(memberIds)].filter(
          (id) => id !== user.userId
        ) as string[];

        if (uniqueMemberIds.length > 0) {
          await tx.projectMember.createMany({
            data: uniqueMemberIds.map((userId) => ({
              userId,
              projectId: newProject.id,
              role: 'MEMBER' as const,
            })),
            skipDuplicates: true,
          });
        }
      }

      return await tx.project.findUnique({
        where: { id: newProject.id },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          tasks: {
            include: {
              assignee: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          },
        },
      });
    });

    // Invalidate caches for the owner and all added members
    const affectedUserIds = [user.userId];
    if (memberIds && Array.isArray(memberIds)) {
      affectedUserIds.push(...memberIds);
    }
    await invalidateProjectCache(project!.id, affectedUserIds);

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
