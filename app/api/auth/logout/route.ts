import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    // Delete session from database
    if (token) {
      await deleteSession(token);
    }

    const response = NextResponse.json({ message: 'Logged out successfully' });
    response.cookies.delete('auth-token');
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    const response = NextResponse.json({ message: 'Logged out successfully' });
    response.cookies.delete('auth-token');
    return response;
  }
}
