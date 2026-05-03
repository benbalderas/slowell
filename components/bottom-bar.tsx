import Link from "next/link";
import { IconBack } from "@/components/icons";

interface BottomBarProps {
  back?: { href: string } | null;
  middle?: { label: string; href?: string } | null;
  primary?:
    | { label: string; href: string }
    | { label: string; type: "submit"; form?: string }
    | null;
}

// The signature 3-pill action bar — pinned to the bottom, hardware-inspired.
// Per design system: 52px tall, 20px radius, lowercase, scale(0.97) on press,
// bottom safe-area padding for iOS home indicator.
export function BottomBar({ back, middle, primary }: BottomBarProps) {
  return (
    <div
      className="fixed bottom-0 inset-x-0 px-4 pb-4 pointer-events-none"
      style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
    >
      <div className="max-w-[732px] mx-auto flex gap-2 pointer-events-auto">
        {back ? (
          <Link
            href={back.href}
            aria-label="back"
            className="h-[52px] w-[52px] flex items-center justify-center rounded-lg bg-surface-deep text-ink-secondary active:scale-[0.97] transition-transform duration-[120ms]"
          >
            <IconBack />
          </Link>
        ) : null}

        {middle ? (
          middle.href ? (
            <Link
              href={middle.href}
              className="h-[52px] min-w-[80px] flex-1 flex items-center justify-center px-4 rounded-lg bg-surface-deep text-ink font-medium lowercase active:scale-[0.97] transition-transform duration-[120ms]"
            >
              {middle.label}
            </Link>
          ) : (
            <div className="h-[52px] min-w-[80px] flex-1 flex items-center justify-center px-4 rounded-lg bg-surface-deep text-ink font-medium lowercase">
              {middle.label}
            </div>
          )
        ) : null}

        {primary ? (
          "href" in primary ? (
            <Link
              href={primary.href}
              className="h-[52px] flex-[2] flex items-center justify-center px-4 rounded-lg bg-accent text-accent-text font-medium lowercase active:scale-[0.97] transition-transform duration-[120ms]"
            >
              {primary.label}
            </Link>
          ) : (
            <button
              type="submit"
              form={primary.form}
              className="h-[52px] flex-[2] flex items-center justify-center px-4 rounded-lg bg-accent text-accent-text font-medium lowercase active:scale-[0.97] transition-transform duration-[120ms]"
            >
              {primary.label}
            </button>
          )
        ) : null}
      </div>
    </div>
  );
}
