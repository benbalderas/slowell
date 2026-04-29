import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function MePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, handle: true, displayName: true },
  });

  if (!user) redirect("/sign-in");

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/sign-in" });
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface text-ink p-4">
      <div className="w-full max-w-sm bg-surface-raised rounded-md p-8 space-y-4">
        <h1 className="text-xl">you&apos;re in.</h1>
        <p className="text-sm text-ink-secondary">
          signed in as{" "}
          <span className="font-bit text-base text-ink">@{user.handle}</span>
        </p>
        <p className="text-xs text-ink-secondary break-all">{user.email}</p>

        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full h-[52px] rounded-lg bg-surface border border-surface-deep text-ink-secondary font-medium lowercase active:scale-[0.97] transition-transform duration-[120ms]"
          >
            sign out
          </button>
        </form>

        <p className="text-xs text-ink-secondary pt-4">
          this page is a placeholder. real profile + collection lands in phase 5.
        </p>
      </div>
    </main>
  );
}
