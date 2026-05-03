import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/u/"],
        disallow: ["/me", "/sign-in", "/api"],
      },
    ],
    host: "https://slowell.club",
    sitemap: "https://slowell.club/sitemap.xml",
  };
}
