import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DashboardNavbar from '@/components/DashboardNavbar';
import ProjectDetailContent from '@/components/ProjectDetailContent';
import { Project, Task, ProjectMember } from '@/lib/models/geters/projects';

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const { id } = await params;

  // Fetch project directly from database for reliability
  const project = await prisma.project.findFirst({
    where: {
      id,
      OR: [
        { ownerId: user.userId },
        { members: { some: { userId: user.userId } } },
      ],
    },
    include: {
      owner: {
        select: { id: true, email: true, name: true },
      },
      tasks: {
        include: {
          assignee: {
            select: { id: true, email: true, name: true },
          },
          project: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
      members: {
        include: {
          user: {
            select: { id: true, email: true, name: true },
          },
        },
      },
    },
  });

  if (!project) {
    redirect('/dashboard');
  }

  // Get user data for navbar
  const userData = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { id: true, email: true, name: true },
  });

  const displayName = userData?.name || userData?.email || 'User';

  // Transform the project data to match the Project type (convert Date to string)
  const transformedProject: Project = {
    ...project,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    tasks: project.tasks.map((task: Omit<Task, 'createdAt' | 'updatedAt' | 'dueDate'> & {
      createdAt: Date;
      updatedAt: Date;
      dueDate: Date | null;
    }) => ({
      ...task,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    })),
    members: project.members.map((member: Omit<ProjectMember, 'createdAt'> & {
      createdAt: Date;
    }) => ({
      ...member,
      createdAt: member.createdAt.toISOString(),
    })),
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DashboardNavbar userName={displayName} />
      <ProjectDetailContent project={transformedProject} userId={user.userId} />
    </div>
  );
}
