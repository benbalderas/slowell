import localFont from "next/font/local";

// PP Neue Montreal — Book (400) for body/UI, Medium (500) for active states
// and primary action labels. We deliberately do not load Bold; per the project's
// amended design system, Medium is the heaviest weight in use.
export const neueMontrealFont = localFont({
  src: [
    {
      path: "../public/fonts/PPNeueMontreal-Book.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/PPNeueMontreal-Medium.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-neue-montreal",
  display: "swap",
});

// PP NeueBit — single effective weight per design-system spec.
export const neueBitFont = localFont({
  src: [
    {
      path: "../public/fonts/PPNeueBit-Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-neue-bit",
  display: "swap",
});
