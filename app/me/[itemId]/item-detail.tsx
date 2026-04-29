"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  deleteCollectionItem,
  updateCollectionItem,
  updateManualPressing,
} from "@/lib/collection";
import { BottomBar } from "@/components/bottom-bar";

interface ItemViewModel {
  id: string;
  notes: string | null;
  customCoverUrl: string | null;
  acquiredAt: string | null;
  pressing: {
    format: "CD" | "VINYL";
    label: string | null;
    country: string | null;
    year: number | null;
    catalogNumber: string | null;
    variant: string | null;
    coverUrl: string | null;
    metadataSource: "DISCOGS" | "MUSICBRAINZ" | "MANUAL";
    album: { title: string; artist: string; year: number | null };
  };
}

export function ItemDetail({ item }: { item: ItemViewModel }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editable fields
  const [notes, setNotes] = useState(item.notes ?? "");
  const [customCoverUrl, setCustomCoverUrl] = useState(item.customCoverUrl ?? "");
  const [acquiredAt, setAcquiredAt] = useState(
    item.acquiredAt ? item.acquiredAt.slice(0, 10) : "",
  );

  // Manual-pressing-only fields
  const isManual = item.pressing.metadataSource === "MANUAL";
  const [title, setTitle] = useState(item.pressing.album.title);
  const [artist, setArtist] = useState(item.pressing.album.artist);
  const [year, setYear] = useState(
    item.pressing.year ? String(item.pressing.year) : "",
  );
  const [format, setFormat] = useState(item.pressing.format);
  const [label, setLabel] = useState(item.pressing.label ?? "");
  const [country, setCountry] = useState(item.pressing.country ?? "");
  const [catalogNumber, setCatalogNumber] = useState(item.pressing.catalogNumber ?? "");
  const [variant, setVariant] = useState(item.pressing.variant ?? "");

  const cover = customCoverUrl || item.pressing.coverUrl || null;

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        await updateCollectionItem(item.id, {
          notes: notes || undefined,
          customCoverUrl: customCoverUrl || undefined,
          acquiredAt: acquiredAt ? new Date(acquiredAt) : undefined,
        });
        if (isManual) {
          await updateManualPressing(item.id, {
            title,
            artist,
            year: year ? Number(year) : undefined,
            format,
            label: label || undefined,
            country: country || undefined,
            catalogNumber: catalogNumber || undefined,
            variant: variant || undefined,
          });
        }
        setEditing(false);
        router.refresh();
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  function remove() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteCollectionItem(item.id);
      } catch (e) {
        setError((e as Error).message);
        setConfirmingDelete(false);
      }
    });
  }

  return (
    <>
      <div className="px-4 pt-8 pb-4">
        <div className="aspect-square w-full max-w-md mx-auto rounded-sm bg-surface-deep overflow-hidden">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" className="w-full h-full object-cover" />
          ) : null}
        </div>
      </div>

      <div className="px-4 space-y-4 max-w-md mx-auto">
        {!editing ? (
          <>
            <div>
              <h1 className="text-xl">{item.pressing.album.title}</h1>
              <p className="text-base text-ink-secondary">{item.pressing.album.artist}</p>
            </div>
            <dl className="text-sm space-y-2">
              <Row label="format" value={item.pressing.format.toLowerCase()} />
              {item.pressing.year ? <Row label="year" value={String(item.pressing.year)} /> : null}
              {item.pressing.label ? <Row label="label" value={item.pressing.label} /> : null}
              {item.pressing.catalogNumber ? <Row label="catalog #" value={item.pressing.catalogNumber} /> : null}
              {item.pressing.country ? <Row label="country" value={item.pressing.country} /> : null}
              {item.pressing.variant ? <Row label="variant" value={item.pressing.variant} /> : null}
              {item.acquiredAt ? (
                <Row
                  label="acquired"
                  value={new Date(item.acquiredAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                />
              ) : null}
            </dl>
            {item.notes ? (
              <div className="pt-2">
                <p className="text-xs text-ink-secondary mb-1">notes</p>
                <p className="text-sm whitespace-pre-wrap">{item.notes}</p>
              </div>
            ) : null}
            <p className="text-xs text-ink-secondary pt-4">
              source: {item.pressing.metadataSource.toLowerCase()}
            </p>
          </>
        ) : (
          <div className="space-y-4">
            {isManual ? (
              <>
                <Field label="title" required>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
                </Field>
                <Field label="artist" required>
                  <input value={artist} onChange={(e) => setArtist(e.target.value)} className={inputCls} />
                </Field>
                <Field label="format">
                  <div className="flex gap-2">
                    {(["VINYL", "CD"] as const).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFormat(f)}
                        className={`flex-1 h-[52px] rounded-md font-medium lowercase active:scale-[0.97] transition-transform duration-[120ms] ${
                          format === f ? "bg-accent text-accent-text" : "bg-surface-raised text-ink-secondary"
                        }`}
                      >
                        {f.toLowerCase()}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="year">
                  <input type="number" inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value)} className={inputCls} />
                </Field>
                <Field label="label">
                  <input value={label} onChange={(e) => setLabel(e.target.value)} className={inputCls} />
                </Field>
                <Field label="country">
                  <input value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls} />
                </Field>
                <Field label="catalog #">
                  <input value={catalogNumber} onChange={(e) => setCatalogNumber(e.target.value)} className={inputCls} />
                </Field>
                <Field label="variant">
                  <input value={variant} onChange={(e) => setVariant(e.target.value)} className={inputCls} />
                </Field>
              </>
            ) : (
              <p className="text-xs text-ink-secondary">
                discogs metadata is read-only — only your notes / cover / acquired date are editable.
              </p>
            )}
            <Field label="notes">
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={`${inputCls} h-auto py-3`} />
            </Field>
            <Field label="acquired">
              <input type="date" value={acquiredAt} onChange={(e) => setAcquiredAt(e.target.value)} className={inputCls} />
            </Field>
            <Field label="custom cover url">
              <input
                value={customCoverUrl}
                onChange={(e) => setCustomCoverUrl(e.target.value)}
                placeholder="paste a url to override the cover"
                className={inputCls}
              />
            </Field>
          </div>
        )}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {!editing && !confirmingDelete ? (
          <div className="space-y-2 pt-4">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="w-full h-[52px] rounded-lg bg-surface-raised text-ink font-medium lowercase active:scale-[0.97] transition-transform duration-[120ms]"
            >
              edit
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="w-full h-[52px] rounded-lg bg-surface text-destructive font-medium lowercase active:scale-[0.97] transition-transform duration-[120ms]"
            >
              remove from collection
            </button>
          </div>
        ) : null}

        {editing ? (
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={pending}
              className="flex-1 h-[52px] rounded-lg bg-surface text-ink-secondary font-medium lowercase active:scale-[0.97] transition-transform duration-[120ms]"
            >
              cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={pending}
              className="flex-1 h-[52px] rounded-lg bg-accent text-accent-text font-medium lowercase active:scale-[0.97] transition-transform duration-[120ms]"
            >
              {pending ? "saving…" : "save"}
            </button>
          </div>
        ) : null}
      </div>

      {confirmingDelete ? (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onClick={() => !pending && setConfirmingDelete(false)}
        >
          <div
            className="w-full max-w-sm bg-surface-raised rounded-md p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg">remove from collection?</h2>
            <p className="text-sm text-ink-secondary">
              this removes the album from your collection. the canonical metadata
              stays — re-add anytime.
            </p>
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={remove}
                disabled={pending}
                className="w-full h-[52px] rounded-lg bg-destructive text-destructive-text font-medium lowercase active:scale-[0.97] transition-transform duration-[120ms]"
              >
                {pending ? "removing…" : "remove"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                disabled={pending}
                className="w-full h-[52px] rounded-lg bg-surface text-ink-secondary font-medium lowercase active:scale-[0.97] transition-transform duration-[120ms]"
              >
                cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <BottomBar back={{ href: "/me" }} middle={null} primary={null} />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-surface-deep">
      <dt className="text-ink-secondary lowercase">{label}</dt>
      <dd className="text-ink text-right">{value}</dd>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs text-ink-secondary lowercase">
        {label}
        {required ? "" : <span className="opacity-60"> · optional</span>}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full h-[52px] px-4 rounded-md bg-surface-raised border border-surface-deep text-ink text-base placeholder:text-ink-secondary focus:outline-none focus:border-ink/40";
