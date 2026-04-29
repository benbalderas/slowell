// Two-step magic-link confirmation. The email links here (a harmless render);
// only the explicit button click below hits the real Auth.js callback that
// consumes the single-use token. This protects against link prefetchers.

interface Props {
  searchParams: Promise<{ token?: string; email?: string; callbackUrl?: string }>;
}

export default async function ContinuePage({ searchParams }: Props) {
  const { token, email, callbackUrl } = await searchParams;

  if (!token || !email) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-surface text-ink p-4">
        <div className="w-full max-w-sm bg-surface-raised rounded-md p-8 space-y-4">
          <h1 className="text-xl">link incomplete</h1>
          <p className="text-sm text-ink-secondary">
            the sign-in link looks malformed. try requesting a new one.
          </p>
        </div>
      </main>
    );
  }

  const callback = new URL("/api/auth/callback/resend", process.env.AUTH_URL);
  callback.searchParams.set("token", token);
  callback.searchParams.set("email", email);
  callback.searchParams.set("callbackUrl", callbackUrl ?? "/me");

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface text-ink p-4">
      <div className="w-full max-w-sm bg-surface-raised rounded-md p-8 space-y-4">
        <h1 className="text-xl">one more tap</h1>
        <p className="text-sm text-ink-secondary">
          tap below to finish signing in as{" "}
          <span className="text-ink">{email}</span>.
        </p>
        <a
          href={callback.toString()}
          className="inline-flex items-center justify-center w-full h-[52px] rounded-lg bg-accent text-accent-text font-medium lowercase active:scale-[0.97] transition-transform duration-[120ms]"
        >
          continue
        </a>
      </div>
    </main>
  );
}
