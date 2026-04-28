"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function TokenValidation() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- next-themes hydration pattern
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-surface text-ink p-8 space-y-8">
      <header className="space-y-2">
        <h1 className="text-xl">slowell — scaffolding check</h1>
        <p className="text-sm text-ink-secondary">
          temporary page. delete once feature work begins.
        </p>
      </header>

      <section className="space-y-3">
        <p className="text-xs text-ink-secondary">surfaces</p>
        <div className="flex gap-2">
          <div className="h-24 w-24 rounded-sm bg-surface" />
          <div className="h-24 w-24 rounded-sm bg-surface-raised" />
          <div className="h-24 w-24 rounded-sm bg-surface-deep" />
          <div className="h-24 w-24 rounded-sm bg-accent" />
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-xs text-ink-secondary">stat (neuebit, tabular)</p>
        <div className="font-bit text-2xl tabular-nums">12 albums</div>
        <div className="font-bit text-display tabular-nums">153</div>
      </section>

      <section className="space-y-3">
        <p className="text-xs text-ink-secondary">primary action</p>
        <button
          type="button"
          className="h-[52px] px-6 rounded-lg bg-accent text-accent-text font-medium lowercase active:scale-[0.97] transition-transform duration-[120ms]"
        >
          add
        </button>
      </section>

      <section className="space-y-3">
        <p className="text-xs text-ink-secondary">skeleton row (1.6s pulse, 80ms stagger)</p>
        <div className="grid grid-cols-5 gap-2 max-w-md">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-sm border border-surface-deep animate-skeleton-pulse"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-xs text-ink-secondary">theme</p>
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
      </section>
    </main>
  );
}
