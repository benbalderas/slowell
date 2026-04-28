import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { neueBitFont, neueMontrealFont } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "slowell",
  description: "a home for your physical music collection",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const fontVars = [neueMontrealFont.variable, neueBitFont.variable]
    .filter(Boolean)
    .join(" ");

  return (
    <html lang="en" className={fontVars} suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
