import Link from "next/link";

interface AlbumGridItem {
  id: string;
  href: string | null; // null = no link (read-only display)
  cover: string | null;
  title: string;
  artist: string;
}

export function AlbumGrid({ items }: { items: AlbumGridItem[] }) {
  if (items.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-ink-secondary">
        no albums yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-5 gap-2 md:grid-cols-6">
      {items.map((item) => {
        const tile = (
          <div className="aspect-square rounded-sm overflow-hidden bg-surface-deep">
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
          </div>
        );
        return item.href ? (
          <Link
            key={item.id}
            href={item.href}
            aria-label={`${item.artist} — ${item.title}`}
            className="block active:scale-[0.97] transition-transform duration-[120ms]"
          >
            {tile}
          </Link>
        ) : (
          <div key={item.id} aria-label={`${item.artist} — ${item.title}`}>
            {tile}
          </div>
        );
      })}
    </div>
  );
}
