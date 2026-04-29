import { redirect } from "next/navigation";
import Link from "next/link";

import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/db";
import { getCollection, getCollectionStats } from "@/lib/collection";
import { AlbumGrid } from "@/components/album-grid";
import { BottomBar } from "@/components/bottom-bar";

export default async function MePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { handle: true, displayName: true, image: true },
  });
  if (!user) redirect("/sign-in");

  const [items, stats] = await Promise.all([
    getCollection(session.user.id),
    getCollectionStats(session.user.id),
  ]);

  const gridItems = items.map((it) => ({
    id: it.id,
    cover: it.customCoverUrl ?? it.pressing.coverUrl ?? null,
    title: it.pressing.album.title,
    artist: it.pressing.album.artist,
  }));

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/sign-in" });
  }

  return (
    <>
      <header className="px-4 pt-8 pb-6 flex items-start gap-4">
        <div className="font-bit text-lg text-ink-secondary leading-none mt-1">♪</div>
        <div className="flex-1 space-y-1">
          <h1 className="text-xl">{user.displayName ?? "my collection"}</h1>
          <p className="text-sm text-ink-secondary tabular-nums">
            <span className="font-bit">{stats.total}</span>{" "}
            {stats.total === 1 ? "album" : "albums"}
            {stats.total > 0 && (
              <>
                {" · "}
                {stats.vinyl > 0 && (
                  <>
                    <span className="font-bit tabular-nums">{stats.vinyl}</span> vinyl
                  </>
                )}
                {stats.vinyl > 0 && stats.cd > 0 && " · "}
                {stats.cd > 0 && (
                  <>
                    <span className="font-bit tabular-nums">{stats.cd}</span> cd
                  </>
                )}
              </>
            )}
          </p>
        </div>
        <Link href={`/u/${user.handle}`} aria-label="public profile">
          <div
            className="w-12 h-12 rounded-full bg-surface-deep overflow-hidden"
            style={{ outline: "3px solid #D3FB67", outlineOffset: "2px" }}
          >
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-ink-secondary lowercase">
                {user.handle.slice(0, 2)}
              </div>
            )}
          </div>
        </Link>
      </header>

      <AlbumGrid items={gridItems} />

      <div className="px-4 pt-12 flex justify-center">
        <form action={signOutAction}>
          <button
            type="submit"
            className="text-xs text-ink-secondary underline underline-offset-4"
          >
            sign out
          </button>
        </form>
      </div>

      <BottomBar
        back={null}
        middle={{ label: "all" }}
        primary={{ label: "add", href: "/me/add" }}
      />
    </>
  );
}
