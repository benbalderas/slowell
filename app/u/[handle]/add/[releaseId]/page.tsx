import { notFound } from "next/navigation";

import { addFromDiscogs } from "@/lib/collection";
import {
  getRelease,
  joinArtists,
  parseTitle,
  pickFormatFromRelease,
  pickPrimaryImage,
  pickVariant,
} from "@/lib/discogs";
import { BottomBar } from "@/components/bottom-bar";

interface Props {
  params: Promise<{ handle: string; releaseId: string }>;
}

export default async function ReleaseDetailPage({ params }: Props) {
  const { handle, releaseId } = await params;

  let release;
  try {
    release = await getRelease(releaseId);
  } catch {
    notFound();
  }

  const format = pickFormatFromRelease(release);
  const cover = pickPrimaryImage(release);
  const { artist, title } = release.artists?.length
    ? {
        artist: joinArtists(release.artists),
        title: release.title.replace(/^.*\s-\s/, ""),
      }
    : parseTitle(release.title);
  const label = release.labels?.[0];
  const variant = pickVariant(release);

  return (
    <>
      <div className="pt-8 pb-4">
        <div className="aspect-square w-full max-w-md mx-auto rounded-sm bg-surface-deep overflow-hidden">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" className="w-full h-full object-cover" />
          ) : null}
        </div>
      </div>

      <div className="space-y-4 max-w-md mx-auto">
        <div>
          <h1 className="text-xl">{title}</h1>
          <p className="text-base text-ink-secondary">{artist}</p>
        </div>

        <dl className="text-sm space-y-2">
          {release.year ? (
            <Row
              label="year"
              value={
                <span className="font-bit text-base">{release.year}</span>
              }
            />
          ) : null}
          {format ? (
            <Row label="format" value={format.toLowerCase()} />
          ) : (
            <Row label="format" value="not supported (cd / vinyl only in v1)" />
          )}
          {label?.name ? <Row label="label" value={label.name} /> : null}
          {label?.catno ? <Row label="catalog #" value={label.catno} /> : null}
          {release.country ? <Row label="country" value={release.country} /> : null}
          {variant ? <Row label="variant" value={variant} /> : null}
        </dl>

        {format ? (
          <form action={addFromDiscogs} id="add-form">
            <input type="hidden" name="releaseId" value={release.id} />
          </form>
        ) : (
          <p className="text-sm text-ink-secondary pt-4">
            cassette and other formats aren&apos;t supported in v1. cd and vinyl only.
          </p>
        )}
      </div>

      <BottomBar
        back={{ href: `/u/${handle}/add` }}
        middle={null}
        primary={
          format
            ? { label: "add to collection", type: "submit", form: "add-form" }
            : null
        }
      />
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-surface-deep">
      <dt className="text-ink-secondary lowercase">{label}</dt>
      <dd className="text-ink text-right">{value}</dd>
    </div>
  );
}
