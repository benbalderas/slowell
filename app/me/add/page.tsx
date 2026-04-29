import Link from "next/link";

import { searchMasters } from "@/lib/discogs";
import { BottomBar } from "@/components/bottom-bar";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function AddSearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  let results: Awaited<ReturnType<typeof searchMasters>> = [];
  let searchError: string | null = null;
  if (query) {
    try {
      results = await searchMasters(query, { perPage: 24 });
    } catch (e) {
      searchError = (e as Error).message;
    }
  }

  return (
    <>
      <header className="px-4 pt-8 pb-4 space-y-2">
        <h1 className="text-xl">add an album</h1>
        <p className="text-sm text-ink-secondary">
          search discogs by title, artist, or both. typos are fine.
        </p>
      </header>

      <form action="/me/add" method="GET" className="px-4 pb-4 flex gap-2">
        <input
          name="q"
          type="search"
          defaultValue={query}
          placeholder="e.g. radiohead in rainbows"
          autoFocus={!query}
          className="flex-1 h-[52px] px-4 rounded-md bg-surface-raised border border-surface-deep text-ink text-base placeholder:text-ink-secondary focus:outline-none focus:border-ink/40"
        />
        <button
          type="submit"
          className="h-[52px] px-6 rounded-lg bg-accent text-accent-text font-medium lowercase active:scale-[0.97] transition-transform duration-[120ms]"
        >
          search
        </button>
      </form>

      <div className="px-4 pb-4">
        <Link
          href="/me/add/manual"
          className="text-sm text-ink-secondary underline underline-offset-4"
        >
          can&apos;t find it? add manually
        </Link>
      </div>

      {searchError ? (
        <div className="px-4 py-6 text-sm text-ink-secondary">
          discogs is unreachable right now. try{" "}
          <Link href="/me/add/manual" className="underline underline-offset-4">
            adding manually
          </Link>
          .
        </div>
      ) : query && results.length === 0 ? (
        <div className="px-4 py-6 text-sm text-ink-secondary">
          no matches for &ldquo;{query}&rdquo;.{" "}
          <Link href="/me/add/manual" className="underline underline-offset-4">
            add manually
          </Link>
          .
        </div>
      ) : (
        <ul className="px-4 space-y-2">
          {results.map((r) => (
            <li key={r.id}>
              <Link
                href={`/me/add/master/${r.id}`}
                className="flex gap-3 p-2 rounded-md bg-surface-raised active:scale-[0.99] transition-transform duration-[120ms]"
              >
                <div className="w-16 h-16 rounded-sm bg-surface-deep overflow-hidden flex-shrink-0">
                  {r.thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.thumb}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base text-ink truncate">{r.title}</p>
                  <p className="text-sm text-ink-secondary tabular-nums truncate">
                    {r.year ? r.year : "year unknown"}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <BottomBar back={{ href: "/me" }} middle={null} primary={null} />
    </>
  );
}
