"use client";

// Temporary design-system reference page — replaced later by the real landing
// (curated collections, recommendations). Lives at `/` so the design tokens
// can be eyeballed in both modes without signing in.

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import {
  IconBack,
  IconBrowse,
  IconCD,
  IconGrid,
  IconMint,
  IconPress,
  IconVinyl,
} from "@/components/icons";

const ICON_SET = [
  { name: "back", Icon: IconBack, hint: "navigation" },
  { name: "browse", Icon: IconBrowse, hint: "discover / browse" },
  { name: "grid", Icon: IconGrid, hint: "grid view toggle" },
  { name: "vinyl", Icon: IconVinyl, hint: "format: vinyl" },
  { name: "cd", Icon: IconCD, hint: "format: cd" },
  { name: "press", Icon: IconPress, hint: "pressing detail" },
  { name: "mint", Icon: IconMint, hint: "condition: mint" },
] as const;

export default function DesignSystemRef() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- next-themes hydration pattern
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-surface text-ink">
      <div className="max-w-[732px] mx-auto px-4 py-12 space-y-12">
        <header className="space-y-2">
          <p className="text-xs text-ink-secondary lowercase">temporary</p>
          <h1 className="text-xl">slowell design reference</h1>
          <p className="text-sm text-ink-secondary">
            this page documents tokens in use. it will be replaced by the real
            landing (curated collections, recommendations) later.
          </p>
        </header>

        <Section label="theme">
          <div className="inline-flex rounded-lg bg-surface-deep p-1 gap-1">
            {(["light", "system", "dark"] as const).map((t) => {
              const active = mounted && theme === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={`h-10 px-4 rounded-md text-sm lowercase ${
                    active ? "bg-surface-raised text-ink" : "text-ink-secondary"
                  }`}
                >
                  {t === "system" ? "auto" : t}
                </button>
              );
            })}
          </div>
        </Section>

        <Section label="surfaces">
          <div className="flex gap-2 flex-wrap">
            <Swatch className="bg-surface" name="surface" />
            <Swatch className="bg-surface-raised" name="surface-raised" />
            <Swatch className="bg-surface-deep" name="surface-deep" />
            <Swatch className="bg-accent" name="accent" />
            <Swatch className="bg-destructive" name="destructive" />
          </div>
        </Section>

        <Section label="type scale — neue montreal">
          <div className="space-y-2">
            <p className="text-xs">text-xs · 11px · captions, metadata</p>
            <p className="text-sm">text-sm · 13px · secondary body, labels</p>
            <p className="text-base">text-base · 15px · primary body</p>
            <p className="text-lg">text-lg · 17px · section titles</p>
            <p className="text-xl">text-xl · 22px · page titles</p>
          </div>
        </Section>

        <Section label="type scale — neue bit (numerics, stats)">
          <div className="space-y-2">
            <p className="font-bit text-base tabular-nums">12 albums</p>
            <p className="font-bit text-lg tabular-nums">12 albums</p>
            <p className="font-bit text-xl tabular-nums">12 albums</p>
            <p className="font-bit text-2xl tabular-nums">153</p>
            <p className="font-bit text-display tabular-nums">153</p>
          </div>
        </Section>

        <Section label="weights — book (400) and medium (500) only, no bold">
          <div className="space-y-2">
            <p className="text-base font-normal">book — the everyday weight</p>
            <p className="text-base font-medium">medium — active states, action labels</p>
          </div>
        </Section>

        <Section label="buttons">
          <div className="space-y-2">
            <button
              type="button"
              className="w-full h-[52px] rounded-lg bg-accent text-accent-text font-medium lowercase active:scale-[0.97] transition-transform duration-[120ms]"
            >
              primary — add
            </button>
            <button
              type="button"
              className="w-full h-[52px] rounded-lg bg-surface-deep text-ink font-medium lowercase active:scale-[0.97] transition-transform duration-[120ms]"
            >
              secondary — surface-deep, mode-invariant
            </button>
            <button
              type="button"
              className="w-full h-[52px] rounded-lg text-ink-secondary font-medium lowercase active:scale-[0.97] transition-transform duration-[120ms]"
            >
              ghost — back, cancel
            </button>
            <button
              type="button"
              className="w-full h-[52px] rounded-lg bg-destructive text-destructive-text font-medium lowercase active:scale-[0.97] transition-transform duration-[120ms]"
            >
              destructive — delete account
            </button>
          </div>
        </Section>

        <Section label="icons — pixel grid, currentColor">
          <p className="text-xs text-ink-secondary">
            18×18 native, scale via text-* sizing. fill inherits parent text color.
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ICON_SET.map(({ name, Icon, hint }) => (
              <div
                key={name}
                className="flex items-center gap-3 p-3 rounded-md bg-surface-raised"
              >
                <Icon className="text-ink" />
                <div className="min-w-0">
                  <p className="text-sm text-ink lowercase">{name}</p>
                  <p className="text-xs text-ink-secondary lowercase truncate">
                    {hint}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section label="bottom bar">
          <div className="flex gap-2">
            <div className="h-[52px] w-[52px] flex items-center justify-center rounded-lg bg-surface-deep text-ink-secondary">
              <IconBack />
            </div>
            <div className="h-[52px] flex-1 flex items-center justify-center px-4 rounded-lg bg-surface-deep text-ink font-medium lowercase">
              all
            </div>
            <div className="h-[52px] flex-[2] flex items-center justify-center px-4 rounded-lg bg-accent text-accent-text font-medium lowercase">
              add
            </div>
          </div>
        </Section>

        <Section label="skeleton — outlined pulse, 1.6s, 80ms stagger">
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-sm border border-surface-deep animate-skeleton-pulse"
                style={{ animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
        </Section>

        <Section label="cover grid example">
          <div className="grid grid-cols-5 gap-2 md:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-sm bg-surface-deep"
              />
            ))}
          </div>
        </Section>
      </div>
    </main>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <p className="text-xs text-ink-secondary lowercase tracking-wide">
        {label}
      </p>
      {children}
    </section>
  );
}

function Swatch({ className, name }: { className: string; name: string }) {
  return (
    <div className="flex flex-col items-start gap-1">
      <div className={`h-20 w-20 rounded-sm border border-surface-deep ${className}`} />
      <span className="text-xs text-ink-secondary lowercase">{name}</span>
    </div>
  );
}
