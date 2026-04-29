import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-surface text-ink p-4">
      <div className="w-full max-w-sm bg-surface-raised rounded-md p-8 space-y-4">
        <h1 className="text-xl">that link didn&apos;t work</h1>
        <p className="text-sm text-ink-secondary">
          it may have expired or already been used. magic links are single-use.
        </p>
        <Link
          href="/sign-in"
          className="inline-flex items-center justify-center w-full h-[52px] rounded-lg bg-accent text-accent-text font-medium lowercase active:scale-[0.97] transition-transform duration-[120ms]"
        >
          try again
        </Link>
      </div>
    </main>
  );
}
