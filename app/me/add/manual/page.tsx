"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { addManual, type ManualAddResult } from "@/lib/collection";
import { BottomBar } from "@/components/bottom-bar";

interface FormState {
  title: string;
  artist: string;
  year: string;
  format: "VINYL" | "CD";
  label: string;
  country: string;
  catalogNumber: string;
  variant: string;
  notes: string;
  acquiredAt: string;
}

const empty: FormState = {
  title: "",
  artist: "",
  year: "",
  format: "VINYL",
  label: "",
  country: "",
  catalogNumber: "",
  variant: "",
  notes: "",
  acquiredAt: "",
};

export default function ManualAddPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>(empty);
  const [suggestion, setSuggestion] = useState<
    Extract<ManualAddResult, { status: "suggestion" }>["match"] | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function buildInput(): Parameters<typeof addManual>[0] {
    return {
      title: form.title,
      artist: form.artist,
      year: form.year ? Number(form.year) : undefined,
      format: form.format,
      label: form.label || undefined,
      country: form.country || undefined,
      catalogNumber: form.catalogNumber || undefined,
      variant: form.variant || undefined,
      notes: form.notes || undefined,
      acquiredAt: form.acquiredAt ? new Date(form.acquiredAt) : undefined,
    } as Parameters<typeof addManual>[0];
  }

  function submit(force: boolean) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await addManual(buildInput(), { force });
        if (result.status === "suggestion") {
          setSuggestion(result.match);
        } else {
          router.push("/me");
          router.refresh();
        }
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  return (
    <>
      <header className="px-4 pt-8 pb-4 space-y-2">
        <h1 className="text-xl">add manually</h1>
        <p className="text-sm text-ink-secondary">
          for pressings discogs doesn&apos;t have, or details you want to control.
        </p>
      </header>

      <form
        id="manual-form"
        className="px-4 pb-4 space-y-4 max-w-md mx-auto"
        onSubmit={(e) => {
          e.preventDefault();
          submit(false);
        }}
      >
        <Field label="title" required>
          <input
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            required
            className={inputCls}
          />
        </Field>
        <Field label="artist" required>
          <input
            value={form.artist}
            onChange={(e) => update("artist", e.target.value)}
            required
            className={inputCls}
          />
        </Field>
        <Field label="format">
          <div className="flex gap-2">
            {(["VINYL", "CD"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => update("format", f)}
                className={`flex-1 h-[52px] rounded-md font-medium lowercase active:scale-[0.97] transition-transform duration-[120ms] ${
                  form.format === f
                    ? "bg-accent text-accent-text"
                    : "bg-surface-raised text-ink-secondary"
                }`}
              >
                {f.toLowerCase()}
              </button>
            ))}
          </div>
        </Field>
        <Field label="year">
          <input
            type="number"
            inputMode="numeric"
            value={form.year}
            onChange={(e) => update("year", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="label">
          <input
            value={form.label}
            onChange={(e) => update("label", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="country">
          <input
            value={form.country}
            onChange={(e) => update("country", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="catalog #">
          <input
            value={form.catalogNumber}
            onChange={(e) => update("catalogNumber", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="variant">
          <input
            value={form.variant}
            onChange={(e) => update("variant", e.target.value)}
            placeholder="180g, translucent red, first press, ..."
            className={inputCls}
          />
        </Field>
        <Field label="notes">
          <textarea
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            rows={3}
            className={`${inputCls} h-auto py-3`}
          />
        </Field>
        <Field label="acquired">
          <input
            type="date"
            value={form.acquiredAt}
            onChange={(e) => update("acquiredAt", e.target.value)}
            className={inputCls}
          />
        </Field>
      </form>

      {error ? (
        <p className="px-4 text-sm text-destructive">{error}</p>
      ) : null}

      {suggestion ? (
        <SuggestionModal
          match={suggestion}
          pending={pending}
          onUseDiscogs={() => router.push(`/me/add/master/${suggestion.id}`)}
          onKeepManual={() => {
            setSuggestion(null);
            submit(true);
          }}
          onCancel={() => setSuggestion(null)}
        />
      ) : null}

      <BottomBar
        back={{ href: "/me/add" }}
        middle={null}
        primary={{
          label: pending ? "saving…" : "save",
          type: "submit",
          form: "manual-form",
        }}
      />

      <noscript>
        <p className="px-4 text-sm text-ink-secondary">
          this form needs javascript. <Link href="/me/add" className="underline">go back</Link>.
        </p>
      </noscript>
    </>
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

function SuggestionModal({
  match,
  pending,
  onUseDiscogs,
  onKeepManual,
  onCancel,
}: {
  match: { id: number; title: string; year?: string; thumb?: string };
  pending: boolean;
  onUseDiscogs: () => void;
  onKeepManual: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-surface-raised rounded-md p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg">looks familiar</h2>
        <p className="text-sm text-ink-secondary">
          this might already be on discogs:
        </p>
        <div className="flex gap-3 items-center">
          <div className="w-16 h-16 rounded-sm bg-surface-deep overflow-hidden flex-shrink-0">
            {match.thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={match.thumb} alt="" className="w-full h-full object-cover" />
            ) : null}
          </div>
          <div className="min-w-0">
            <p className="text-base text-ink truncate">{match.title}</p>
            {match.year ? (
              <p className="text-sm text-ink-secondary tabular-nums">{match.year}</p>
            ) : null}
          </div>
        </div>
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={onUseDiscogs}
            disabled={pending}
            className="w-full h-[52px] rounded-lg bg-accent text-accent-text font-medium lowercase active:scale-[0.97] transition-transform duration-[120ms]"
          >
            use discogs metadata
          </button>
          <button
            type="button"
            onClick={onKeepManual}
            disabled={pending}
            className="w-full h-[52px] rounded-lg bg-surface text-ink-secondary font-medium lowercase active:scale-[0.97] transition-transform duration-[120ms]"
          >
            {pending ? "saving…" : "keep my entry"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full h-[52px] px-4 rounded-md bg-surface-raised border border-surface-deep text-ink text-base placeholder:text-ink-secondary focus:outline-none focus:border-ink/40";
