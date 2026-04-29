import type { NextAuthConfig } from "next-auth";

// Edge-safe slice — used by middleware. Must not import Prisma or Node-only deps.
// Providers are wired in auth.ts (Node runtime).
export const authConfig = {
  pages: {
    signIn: "/sign-in",
    verifyRequest: "/sign-in/verify",
    error: "/sign-in/error",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isAuthed = !!auth?.user;
      const isOnAuthPage = nextUrl.pathname.startsWith("/sign-in");
      const isProtected = nextUrl.pathname.startsWith("/me");

      if (isProtected && !isAuthed) {
        return false; // middleware will redirect to signIn
      }
      if (isOnAuthPage && isAuthed) {
        return Response.redirect(new URL("/me", nextUrl));
      }
      return true;
    },
  },
  providers: [], // populated in auth.ts
} satisfies NextAuthConfig;
