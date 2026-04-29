import Link from "next/link";

interface AlbumGridItem {
  id: string;
  cover: string | null;
  title: string;
  artist: string;
}

export function AlbumGrid({ items }: { items: AlbumGridItem[] }) {
  if (items.length === 0) {
    return (
      <div className="px-4 py-12 text-center text-sm text-ink-secondary">
        no albums yet. tap{" "}
        <span className="text-ink">add</span> to start your collection.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-5 gap-2 px-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/me/${item.id}`}
          aria-label={`${item.artist} — ${item.title}`}
          className="aspect-square rounded-sm overflow-hidden bg-surface-deep block active:scale-[0.97] transition-transform duration-[120ms]"
        >
          {item.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.cover}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink-secondary text-xs px-2 text-center">
              {item.artist}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
