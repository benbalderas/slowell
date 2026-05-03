// Visual shell for the canonical user-collection URL.
// No auth gate here — /u/[handle] is the public-facing surface; ownership
// is detected per-page (via getPublicProfile or auth() check) and gates
// the edit/add affordances. The /add and /[itemId] mutation paths have
// their own auth gates in their layout/page.
export default function PublicProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface text-ink pb-32">
      <div className="max-w-[732px] mx-auto px-4">{children}</div>
    </div>
  );
}
