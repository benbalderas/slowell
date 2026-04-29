// Discogs API client — server-only.
// Docs: https://www.discogs.com/developers

const BASE = "https://api.discogs.com";
const UA = "Slowell/0.1 +https://slowell.club";

export interface DiscogsSearchResult {
  id: number;
  master_id?: number;
  title: string; // "Artist - Title"
  year?: string;
  country?: string;
  label?: string[];
  format?: string[];
  thumb?: string;
  cover_image?: string;
}

export interface DiscogsRelease {
  id: number;
  master_id?: number;
  title: string;
  artists: { name: string; anv?: string; join?: string }[];
  year?: number;
  released?: string;
  country?: string;
  labels?: { name: string; catno?: string }[];
  formats?: { name: string; qty?: string; descriptions?: string[] }[];
  images?: { type: string; uri: string; resource_url: string }[];
  thumb?: string;
}

export interface DiscogsSearchResponse {
  results: DiscogsSearchResult[];
  pagination: { items: number; pages: number; per_page: number; page: number };
}

export interface DiscogsMaster {
  id: number;
  title: string;
  artists?: { name: string; anv?: string; join?: string }[];
  year?: number;
  main_release?: number;
  images?: { type: string; uri: string }[];
}

export interface DiscogsVersion {
  id: number;
  title: string;
  released?: string;
  country?: string;
  label?: string;
  format: string;
  catno?: string;
  thumb?: string;
  major_formats?: string[];
}

interface DiscogsVersionsResponse {
  versions: DiscogsVersion[];
  pagination: { items: number; pages: number; per_page: number; page: number };
}

class DiscogsError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "DiscogsError";
  }
}

async function fetchDiscogs<T>(path: string): Promise<T> {
  const token = process.env.DISCOGS_TOKEN;
  if (!token) throw new DiscogsError("DISCOGS_TOKEN not configured");

  const res = await fetch(`${BASE}${path}`, {
    headers: {
      Authorization: `Discogs token=${token}`,
      "User-Agent": UA,
    },
    // Cache aggressively at the edge — release data is effectively immutable.
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new DiscogsError(
      `discogs ${res.status}: ${await res.text().catch(() => "")}`.slice(0, 200),
      res.status,
    );
  }
  return res.json() as Promise<T>;
}

export async function searchReleases(
  q: string,
  opts: { perPage?: number } = {},
): Promise<DiscogsSearchResult[]> {
  const perPage = String(opts.perPage ?? 20);

  // Two parallel queries: `artist=` ignores tracklist/label/etc. matches and
  // gives clean artist-bucketed results. `q=` is a wider net for cases where
  // the user typed an album title or partial phrase. We merge, dedupe, and
  // re-rank — see scoreResult below.
  //
  // Note: Discogs's `format` parameter does NOT accept comma-separated values
  // ("Vinyl,CD" returns zero results). We over-fetch with no format filter
  // and post-filter for vinyl/CD ourselves.
  const [byArtist, byQuery] = await Promise.all([
    fetchDiscogs<DiscogsSearchResponse>(
      `/database/search?${new URLSearchParams({
        artist: q,
        type: "release",
        per_page: perPage,
      })}`,
    ).catch(() => ({ results: [], pagination: { items: 0, pages: 0, per_page: 0, page: 1 } } satisfies DiscogsSearchResponse)),
    fetchDiscogs<DiscogsSearchResponse>(
      `/database/search?${new URLSearchParams({
        q,
        type: "release",
        per_page: perPage,
      })}`,
    ).catch(() => ({ results: [], pagination: { items: 0, pages: 0, per_page: 0, page: 1 } } satisfies DiscogsSearchResponse)),
  ]);

  // Dedupe by release id, prefer the artist-matched copy.
  const byId = new Map<number, DiscogsSearchResult>();
  for (const r of byQuery.results) byId.set(r.id, r);
  for (const r of byArtist.results) byId.set(r.id, r);

  const merged = Array.from(byId.values()).filter(isVinylOrCd);
  merged.sort((a, b) => scoreResult(b, q, byArtist.results) - scoreResult(a, q, byArtist.results));
  return merged.slice(0, opts.perPage ?? 20);
}

function isVinylOrCd(r: DiscogsSearchResult): boolean {
  if (!r.format) return false;
  return r.format.some((f) => f === "Vinyl" || f === "CD" || f === "LP");
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

function scoreResult(
  r: DiscogsSearchResult,
  query: string,
  artistMatched: DiscogsSearchResult[],
): number {
  const q = norm(query);
  const tokens = q.split(" ").filter((t) => t.length > 1);
  const { artist, title } = parseTitle(r.title);
  const a = norm(artist);
  const t = norm(title);

  let score = 0;
  // Strongest signal: result came back from artist=<q> query directly.
  if (artistMatched.some((m) => m.id === r.id)) score += 100;
  // Artist-name token coverage.
  for (const tok of tokens) {
    if (a.includes(tok)) score += 20;
    if (t.includes(tok)) score += 5;
  }
  // Penalize "Various" / compilation-style entries unless query implies it.
  if (a.includes("various") && !q.includes("various")) score -= 30;
  return score;
}

export async function getRelease(id: number | string): Promise<DiscogsRelease> {
  return fetchDiscogs<DiscogsRelease>(`/releases/${id}`);
}

export async function searchMasters(
  q: string,
  opts: { perPage?: number } = {},
): Promise<DiscogsSearchResult[]> {
  const perPage = String(opts.perPage ?? 20);

  const empty = {
    results: [],
    pagination: { items: 0, pages: 0, per_page: 0, page: 1 },
  } satisfies DiscogsSearchResponse;

  const [byArtist, byQuery] = await Promise.all([
    fetchDiscogs<DiscogsSearchResponse>(
      `/database/search?${new URLSearchParams({
        artist: q,
        type: "master",
        per_page: perPage,
      })}`,
    ).catch(() => empty),
    fetchDiscogs<DiscogsSearchResponse>(
      `/database/search?${new URLSearchParams({
        q,
        type: "master",
        per_page: perPage,
      })}`,
    ).catch(() => empty),
  ]);

  const byId = new Map<number, DiscogsSearchResult>();
  for (const r of byQuery.results) byId.set(r.id, r);
  for (const r of byArtist.results) byId.set(r.id, r);

  const merged = Array.from(byId.values());
  merged.sort(
    (a, b) => scoreResult(b, q, byArtist.results) - scoreResult(a, q, byArtist.results),
  );
  return merged.slice(0, opts.perPage ?? 20);
}

export async function getMaster(id: number | string): Promise<DiscogsMaster> {
  return fetchDiscogs<DiscogsMaster>(`/masters/${id}`);
}

export async function getMasterVersions(
  id: number | string,
): Promise<DiscogsVersion[]> {
  const data = await fetchDiscogs<DiscogsVersionsResponse>(
    `/masters/${id}/versions?per_page=100`,
  );
  return data.versions.filter(isVersionVinylOrCd);
}

function isVersionVinylOrCd(v: DiscogsVersion): boolean {
  const formats = v.major_formats ?? v.format.split(",").map((s) => s.trim());
  return formats.some((f) => f === "Vinyl" || f === "CD" || f === "LP");
}

// Helpers for mapping Discogs data → our schema.

export function parseTitle(discogsTitle: string): { artist: string; title: string } {
  // Discogs format: "Artist - Title" (with rare exceptions for self-titled albums)
  const idx = discogsTitle.indexOf(" - ");
  if (idx === -1) return { artist: discogsTitle, title: discogsTitle };
  return {
    artist: discogsTitle.slice(0, idx).trim(),
    title: discogsTitle.slice(idx + 3).trim(),
  };
}

export function pickFormat(formats: string[] | undefined): "VINYL" | "CD" | null {
  if (!formats) return null;
  const lower = formats.map((f) => f.toLowerCase());
  if (lower.includes("vinyl")) return "VINYL";
  if (lower.includes("cd")) return "CD";
  return null;
}

export function pickFormatFromRelease(
  release: DiscogsRelease,
): "VINYL" | "CD" | null {
  const names = release.formats?.map((f) => f.name) ?? [];
  return pickFormat(names);
}

export function pickVariant(release: DiscogsRelease): string | null {
  const desc = release.formats?.[0]?.descriptions;
  if (!desc || desc.length === 0) return null;
  return desc.join(", ");
}

export function pickPrimaryImage(release: DiscogsRelease): string | null {
  if (!release.images) return null;
  const primary = release.images.find((i) => i.type === "primary") ?? release.images[0];
  return primary?.uri ?? primary?.resource_url ?? null;
}

export function joinArtists(artists: DiscogsRelease["artists"]): string {
  return artists.map((a, i) => (i === 0 ? a.name : `${a.join ?? ","} ${a.name}`)).join(" ");
}

export { DiscogsError };
