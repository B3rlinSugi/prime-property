import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const email = credentials.email as string;
        const password = credentials.password as string;
        
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.isActive) return null;
        
        // Check lockout
        if (user.lockedUntil && new Date() < user.lockedUntil) {
          throw new Error('ACCOUNT_LOCKED');
        }
        
        const isValid = await bcrypt.compare(password, user.password);
        
        if (!isValid) {
          // Increment failed login
          const newFailedCount = user.failedLogin + 1;
          const updateData: any = { failedLogin: newFailedCount };
          
          if (newFailedCount >= 5) {
            updateData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
            updateData.failedLogin = 0;
          }
          
          await prisma.user.update({ where: { id: user.id }, data: updateData });
          
          if (newFailedCount >= 5) {
            // Write a security alert in AuditLog for the Superadmin
            await prisma.auditLog.create({
              data: {
                action: 'SECURITY_ALERT',
                entity: 'USER_LOCKOUT',
                entityId: user.id,
                changes: JSON.stringify({
                  message: `Akun agent "${user.name}" (${user.email}) diblokir sementara selama 15 menit akibat 5 kali gagal login.`,
                  failedAttempts: 5,
                }),
                userId: user.id,
              },
            });
            throw new Error('ACCOUNT_LOCKED');
          }
          return null;
        }
        
        // Reset failed login on success
        await prisma.user.update({
          where: { id: user.id },
          data: { failedLogin: 0, lockedUntil: null },
        });
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as 'ADMIN' | 'SUPERADMIN',
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/agent/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});
