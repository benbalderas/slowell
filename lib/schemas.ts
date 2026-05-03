import { z } from "zod";

// Shared field shapes
const trimmed = (max: number) =>
  z.string().trim().min(1).max(max);
const trimmedOpt = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal("").transform(() => undefined));

export const formatEnum = z.enum(["CD", "VINYL"]);

// Manual album entry — used by the manual-add form.
export const manualAlbumInput = z.object({
  title: trimmed(200),
  artist: trimmed(200),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  format: formatEnum,
  label: trimmedOpt(100),
  country: trimmedOpt(100),
  catalogNumber: trimmedOpt(100),
  variant: trimmedOpt(200),
  notes: trimmedOpt(2000),
  acquiredAt: z.coerce.date().optional(),
});
export type ManualAlbumInput = z.infer<typeof manualAlbumInput>;

// Edit a CollectionItem (user-owned fields only).
export const editCollectionItemInput = z.object({
  notes: trimmedOpt(2000),
  customCoverUrl: trimmedOpt(500),
  acquiredAt: z.coerce.date().optional(),
});
export type EditCollectionItemInput = z.infer<typeof editCollectionItemInput>;

// Update profile fields (owner-only). Handle editing lives in Phase 6.
export const updateProfileInput = z.object({
  displayName: trimmedOpt(60),
  bio: trimmedOpt(500),
  image: trimmedOpt(500),
});
export type UpdateProfileInput = z.infer<typeof updateProfileInput>;

// Edit a manual Pressing's metadata (only allowed for MANUAL-source pressings).
export const editManualPressingInput = z.object({
  title: trimmed(200),
  artist: trimmed(200),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  format: formatEnum,
  label: trimmedOpt(100),
  country: trimmedOpt(100),
  catalogNumber: trimmedOpt(100),
  variant: trimmedOpt(200),
});
export type EditManualPressingInput = z.infer<typeof editManualPressingInput>;
