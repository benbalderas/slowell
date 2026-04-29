import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function MeLayout({ children }: { children: React.ReactNode }) {
  // Belt-and-suspenders auth gate — proxy.ts also catches this for /me, but
  // some sub-routes weren't reliably hitting the proxy under Next 16 + Turbopack.
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  return <div className="min-h-screen bg-surface text-ink pb-32">{children}</div>;
}
