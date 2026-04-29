import Link from "next/link";
import { notFound } from "next/navigation";

import { getMaster, getMasterVersions, joinArtists } from "@/lib/discogs";
import { BottomBar } from "@/components/bottom-bar";

interface Props {
  params: Promise<{ masterId: string }>;
}

export default async function MasterDetailPage({ params }: Props) {
  const { masterId } = await params;

  let master, versions;
  try {
    [master, versions] = await Promise.all([
      getMaster(masterId),
      getMasterVersions(masterId),
    ]);
  } catch {
    notFound();
  }

  const artist = master.artists?.length ? joinArtists(master.artists) : "";
  const cover = master.images?.find((i) => i.type === "primary")?.uri ?? master.images?.[0]?.uri ?? null;

  return (
    <>
      <header className="px-4 pt-8 pb-6 max-w-md mx-auto space-y-4">
        <div className="flex gap-4 items-center">
          <div className="w-20 h-20 rounded-sm bg-surface-deep overflow-hidden flex-shrink-0">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt="" className="w-full h-full object-cover" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl truncate">{master.title}</h1>
            {artist ? <p className="text-base text-ink-secondary truncate">{artist}</p> : null}
            {master.year ? (
              <p className="text-xs text-ink-secondary tabular-nums">first released {master.year}</p>
            ) : null}
          </div>
        </div>
        <p className="text-sm text-ink-secondary">
          pick the pressing you have:
        </p>
      </header>

      <ul className="px-4 pb-4 max-w-md mx-auto space-y-2">
        {versions.length === 0 ? (
          <li className="text-sm text-ink-secondary py-6">
            no vinyl or CD pressings on discogs.{" "}
            <Link href="/me/add/manual" className="underline underline-offset-4">
              add manually
            </Link>
            .
          </li>
        ) : (
          versions.map((v) => (
            <li key={v.id}>
              <Link
                href={`/me/add/${v.id}`}
                className="flex gap-3 p-3 rounded-md bg-surface-raised active:scale-[0.99] transition-transform duration-[120ms]"
              >
                <div className="w-12 h-12 rounded-sm bg-surface-deep overflow-hidden flex-shrink-0">
                  {v.thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.thumb} alt="" loading="lazy" className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base text-ink tabular-nums">
                    {[v.released, v.country, v.format].filter(Boolean).join(" · ")}
                  </p>
                  <p className="text-sm text-ink-secondary truncate">
                    {[v.label, v.catno].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
              </Link>
            </li>
          ))
        )}
      </ul>

      <BottomBar back={{ href: "/me/add" }} middle={null} primary={null} />
    </>
  );
}
