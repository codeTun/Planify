import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DashboardNavbar from '@/components/DashboardNavbar';
import DashboardContent from '@/components/DashboardContent';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  // Fetch user data directly from database
  const userData = await prisma.user.findUnique({
    where: { id: user.userId },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  // Fetch projects and tasks directly from database
  let projects: any[] = [];
  let tasks: any[] = [];
  
  try {
    [projects, tasks] = await Promise.all([
      // Get projects where user is owner or member
      prisma.project.findMany({
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
      }),
      // Get tasks from projects user has access to
      prisma.task.findMany({
        where: {
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
      }),
    ]);
  } catch (error) {
    console.error('Error fetching projects/tasks:', error);
    // Return empty arrays on error
    projects = [];
    tasks = [];
  }

  // Determine display name: use name if available, otherwise use email, otherwise fallback
  const displayName = userData?.name || userData?.email || 'User';
  // For welcome message, extract first name or first part of email
  const welcomeName = userData?.name 
    ? userData.name.split(' ')[0] 
    : userData?.email 
      ? userData.email.split('@')[0] 
      : 'User';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DashboardNavbar userName={displayName} />
      <DashboardContent 
        initialProjects={projects} 
        initialTasks={tasks}
        userId={user.userId}
        userName={welcomeName}
      />
    </div>
  );
}
