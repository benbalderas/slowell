import Link from "next/link";

export default function VerifyPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-surface text-ink p-4">
      <div className="w-full max-w-sm bg-surface-raised rounded-md p-8 space-y-4">
        <h1 className="text-xl">check your email</h1>
        <p className="text-sm text-ink-secondary">
          we sent you a sign-in link. it expires in 24 hours.
        </p>
        <p className="text-sm text-ink-secondary">
          if you don&apos;t see it, check spam.
        </p>
        <Link
          href="/sign-in"
          className="inline-block text-sm text-ink-secondary underline underline-offset-4"
        >
          use a different email
        </Link>
      </div>
    </main>
  );
}
