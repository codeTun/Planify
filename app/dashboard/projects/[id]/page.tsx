import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DashboardNavbar from '@/components/DashboardNavbar';
import ProjectDetailContent from '@/components/ProjectDetailContent';

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DashboardNavbar userName={displayName} />
      <ProjectDetailContent project={project} userId={user.userId} />
    </div>
  );
}
