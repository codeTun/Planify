import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
        // Filter out duplicate user IDs and the owner
        const uniqueMemberIds = [...new Set(memberIds)].filter(
          (id) => id !== user.userId
        );

        if (uniqueMemberIds.length > 0) {
          await tx.projectMember.createMany({
            data: uniqueMemberIds.map((userId) => ({
              userId,
              projectId: newProject.id,
              role: 'MEMBER',
            })),
            skipDuplicates: true,
          });
        }
      }

      // Return project with relations
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
          tasks: [],
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

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
