import { cookies } from 'next/headers';
import { prisma } from './prisma';
import crypto from 'crypto';

// Generate a secure random token
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Create a session in the database
export async function createSession(userId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return token;
}

// Verify token from database
export async function verifyToken(token: string): Promise<{ userId: string; email: string } | null> {
  if (!token) {
    return null;
  }

  // Find session in database
  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  // Check if session exists and is not expired
  if (!session || new Date() > session.expiresAt) {
    // Delete expired session
    if (session) {
      await prisma.session.delete({
        where: { id: session.id },
      }).catch(() => {}); // Ignore errors if already deleted
    }
    return null;
  }

  return {
    userId: session.user.id,
    email: session.user.email,
  };
}

// Get current user from cookie token
export async function getCurrentUser(): Promise<{ userId: string; email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
}

// Delete session from database
export async function deleteSession(token: string): Promise<void> {
  if (!token) {
    return;
  }

  await prisma.session.deleteMany({
    where: { token },
  }).catch(() => {}); // Ignore errors if already deleted
}

// Clean up expired sessions (can be called periodically)
export async function cleanupExpiredSessions(): Promise<void> {
  await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
}
