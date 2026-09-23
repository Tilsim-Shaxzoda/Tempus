import type { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';

export const authOptions: AuthOptions = {
  // No open registration: users only ever come from the admin-created User table.
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 7 }, // 7 days
  pages: {
    signIn: '/login',
    error: '/login'
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username.trim().toLowerCase() }
        });

        if (!user) return null;
        if (user.isBlocked) throw new Error('BLOCKED');

        const validPassword = await verifyPassword(credentials.password, user.passwordHash);
        if (!validPassword) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { isOnline: true, lastSeenAt: new Date() }
        });

        return {
          id: user.id,
          name: user.fullName,
          username: user.username,
          role: user.role,
          avatarUrl: user.avatarUrl ?? undefined
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.role = (user as any).role;
        token.avatarUrl = (user as any).avatarUrl;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as 'ADMIN' | 'MEMBER';
        session.user.avatarUrl = token.avatarUrl as string | undefined;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};
