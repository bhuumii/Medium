// app/api/auth/[...nextauth]/authOptions.ts
import type { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

import { prisma } from "../../../../lib/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
  },

  providers: [
    // ---- Google OAuth ----
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // ---- Email + password ----
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        // no user, or this user only has Google login (no password stored)
        if (!user || !user.password) {
          return null
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isValid) {
          return null
        }

        // NextAuth only needs these basic fields
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image ?? undefined,
        }
      },
    }),
  ],

  callbacks: {
    // put user.id into the JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
      }
      return token
    },

    // expose id on session.user.id so we can use it in the app
    async session({ session, token }) {
      if (session.user && token.id) {
        ;(session.user as any).id = token.id as string
      }
      return session
    },
  },

  // (optional but recommended if NEXTAUTH_SECRET is set)
  secret: process.env.NEXTAUTH_SECRET,
}
