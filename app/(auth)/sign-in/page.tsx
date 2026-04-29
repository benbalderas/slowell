import { signIn } from "@/auth";

export default function SignInPage() {
  async function action(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim();
    if (!email) return;
    // redirectTo is the post-callback destination (becomes callbackUrl in the
    // magic link). The intermediate redirect to /sign-in/verify after form
    // submission is handled automatically by authConfig.pages.verifyRequest.
    await signIn("resend", { email, redirectTo: "/me" });
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface text-ink p-4">
      <div className="w-full max-w-sm bg-surface-raised rounded-md p-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl">sign in</h1>
          <p className="text-sm text-ink-secondary">
            enter your email — we&apos;ll send a link. no password to remember.
          </p>
        </div>

        <form action={action} className="space-y-4">
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full h-[52px] px-4 rounded-md bg-surface border border-surface-deep text-ink text-base placeholder:text-ink-secondary focus:outline-none focus:border-ink/40"
          />
          <button
            type="submit"
            className="w-full h-[52px] rounded-lg bg-accent text-accent-text font-medium lowercase active:scale-[0.97] transition-transform duration-[120ms]"
          >
            send link
          </button>
        </form>
      </div>
    </main>
  );
}
