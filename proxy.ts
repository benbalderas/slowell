import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export default middleware((req) => {
  // authConfig.callbacks.authorized handles the redirect logic.
  // This wrapper exists so Next.js picks it up as middleware.
  void req;
});

export const config = {
  matcher: ["/me/:path*", "/sign-in/:path*"],
};
