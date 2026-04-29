// Generic outlined-pulse grid skeleton — matches the album grid shape.
// 15 squares, staggered 80ms, fixed pattern (no need to know real item count).
export function SkeletonGrid() {
  return (
    <div className="grid grid-cols-5 gap-2 px-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8">
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="aspect-square rounded-sm border border-surface-deep animate-skeleton-pulse"
          style={{ animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
  );
}
