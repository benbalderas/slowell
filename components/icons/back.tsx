// Pixel-grid icon — drawn on the same grid as PP NeueBit.
// fill="currentColor" so it inherits text-* color from the parent.
export function IconBack({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M7.99829 3.99814H7V3H7.99829V3.99814ZM7 5.00311H5.99487V3.99814H7V5.00311ZM5.99487 6.00124H4.99658V5.00311H5.99487V6.00124ZM4.99658 6.99938H3.99829V6.00124H4.99658V6.99938ZM3.99829 10.0006H3V6.99938H3.99829V7.99751H16V9.00249H3.99829V10.0006ZM4.99658 10.9988H3.99829V10.0006H4.99658V10.9988ZM5.99487 12.0037H4.99658V10.9988H5.99487V12.0037ZM7 13.0019H5.99487V12.0037H7V13.0019ZM7.99829 14H7V13.0019H7.99829V14Z"
        fill="currentColor"
      />
      <path d="M8 2.99814H8.99829V2H8V2.99814Z" fill="currentColor" />
      <path d="M8 15H8.99829V14.0018H8V15Z" fill="currentColor" />
    </svg>
  );
}
