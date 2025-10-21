import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcrypt";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

import type { NextAuthOptions, Session, User as NextAuthUser } from "next-auth";
import type { JWT } from "next-auth/jwt";

type JWTToken = {
  name?: string | null;
  email?: string | null;
  picture?: string | null;
  sub?: string;
  userId?: string;
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" as const },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.hashedPassword) return null;
        const ok = await bcrypt.compare(password, user.hashedPassword);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email ?? undefined,
          name: user.name ?? undefined,
        };
      },
    }),
  ],
  pages: {},
  callbacks: {
    async jwt({ token, user }) {
      const t = token as JWT & { userId?: string };
      if (user) t.userId = (user as NextAuthUser).id as string;
      return t;
    },
    async session({ session, token }) {
      const t = token as JWT & { userId?: string };
      const s = session as Session & { userId?: string };
      if (t.userId) s.userId = t.userId;
      return s;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

