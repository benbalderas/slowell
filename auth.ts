import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Resend as ResendClient } from "resend";
import { render } from "@react-email/components";

import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/db";
import { generateHandle } from "@/lib/auth-helpers";
import { MagicLinkEmail } from "@/lib/email/magic-link";

const resendClient = new ResendClient(process.env.RESEND_API_KEY);

const baseAdapter = PrismaAdapter(prisma);

// Wrap the adapter so first-time users get an auto-generated handle on insert.
// The schema requires handle (NOT NULL), so this has to happen at create time.
const adapter = {
  ...baseAdapter,
  async createUser(data: Parameters<NonNullable<typeof baseAdapter.createUser>>[0]) {
    const handle = await generateHandle(data.email, prisma);
    return prisma.user.create({
      data: {
        email: data.email,
        emailVerified: data.emailVerified,
        name: data.name,
        image: data.image,
        handle,
      },
    });
  },
};

export const {
  handlers: { GET, POST },
  signIn,
  signOut,
  auth,
} = NextAuth({
  ...authConfig,
  adapter,
  session: { strategy: "database" },
  providers: [
    Resend({
      from: process.env.AUTH_EMAIL_FROM,
      apiKey: process.env.RESEND_API_KEY,
      async sendVerificationRequest({ identifier: email, url }) {
        // Wrap the real callback URL in an interstitial page so email clients
        // that prefetch links (Apple Mail Privacy Protection, Outlook Safe
        // Links, Gmail's spam scanner) don't consume the single-use token
        // before the user actually clicks.
        const callback = new URL(url);
        const token = callback.searchParams.get("token") ?? "";
        const cb = callback.searchParams.get("callbackUrl") ?? "/me";
        const interstitial = new URL("/sign-in/continue", process.env.AUTH_URL);
        interstitial.searchParams.set("token", token);
        interstitial.searchParams.set("email", email);
        interstitial.searchParams.set("callbackUrl", cb);
        const buttonUrl = interstitial.toString();

        const html = await render(MagicLinkEmail({ url: buttonUrl, email }));
        const text = `sign in to slowell: ${buttonUrl}\n\nthis link expires in 24 hours.`;

        const { error } = await resendClient.emails.send({
          from: `slowell <${process.env.AUTH_EMAIL_FROM}>`,
          to: email,
          subject: "your sign-in link",
          html,
          text,
        });

        if (error) {
          throw new Error(`resend failed: ${error.message}`);
        }
      },
    }),
  ],
});
