import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword } from '@/lib/utils';
import { createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create session in database and get token
    const token = await createSession(user.id);

    const response = NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      redirect: '/dashboard',
    });

    // Set the auth cookie with explicit settings
    // For localhost development, secure must be false
    const isProduction = process.env.NODE_ENV === 'production';
    const forwardedProto = request.headers.get('x-forwarded-proto');
    const isHttps = forwardedProto
      ? forwardedProto.split(',')[0].trim() === 'https'
      : request.nextUrl.protocol === 'https:';
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: isProduction && isHttps,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      // Don't set domain in development to allow localhost
      ...(isProduction ? {} : {}),
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
