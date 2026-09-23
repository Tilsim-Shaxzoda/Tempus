import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;

    // Admin-only section: enforced here AND re-checked in every /api/admin route handler,
    // since middleware alone is not sufficient backend authorization.
    if (pathname.startsWith('/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    if (pathname.startsWith('/api/admin') && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
    pages: { signIn: '/login' }
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/chat/:path*',
    '/contacts/:path*',
    '/birthdays/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/admin/:path*',
    '/api/messages/:path*',
    '/api/contacts/:path*',
    '/api/countdown/:path*',
    '/api/profile/:path*',
    '/api/admin/:path*'
  ]
};
