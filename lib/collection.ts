"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  type DiscogsRelease,
  getRelease,
  joinArtists,
  parseTitle,
  pickFormatFromRelease,
  pickPrimaryImage,
  pickVariant,
  searchMasters,
} from "@/lib/discogs";
import { uploadFromUrl } from "@/lib/cloudinary";
import {
  type EditCollectionItemInput,
  type EditManualPressingInput,
  type ManualAlbumInput,
  editCollectionItemInput,
  editManualPressingInput,
  manualAlbumInput,
} from "@/lib/schemas";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  return session.user.id;
}

// ── Reads ───────────────────────────────────────────────────────────────────

export async function getCollection(userId: string) {
  return prisma.collectionItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      customCoverUrl: true,
      pressing: {
        select: {
          coverUrl: true,
          format: true,
          album: { select: { title: true, artist: true } },
        },
      },
    },
  });
}

export async function getCollectionStats(userId: string) {
  const items = await prisma.collectionItem.findMany({
    where: { userId },
    select: { pressing: { select: { format: true } } },
  });
  const total = items.length;
  const vinyl = items.filter((i) => i.pressing.format === "VINYL").length;
  const cd = items.filter((i) => i.pressing.format === "CD").length;
  return { total, vinyl, cd };
}

export async function getCollectionItemDetail(itemId: string, userId: string) {
  return prisma.collectionItem.findFirst({
    where: { id: itemId, userId },
    select: {
      id: true,
      notes: true,
      customCoverUrl: true,
      acquiredAt: true,
      createdAt: true,
      pressing: {
        select: {
          id: true,
          format: true,
          label: true,
          country: true,
          year: true,
          catalogNumber: true,
          variant: true,
          coverUrl: true,
          metadataSource: true,
          externalId: true,
          album: {
            select: { id: true, title: true, artist: true, year: true },
          },
        },
      },
    },
  });
}

// ── Add: from Discogs ───────────────────────────────────────────────────────

export async function addFromDiscogs(formData: FormData) {
  const userId = await requireUser();
  const releaseId = String(formData.get("releaseId") ?? "");
  if (!releaseId) throw new Error("missing releaseId");

  const release = await getRelease(releaseId);
  const format = pickFormatFromRelease(release);
  if (!format) {
    throw new Error("format not supported in v1");
  }

  await ensureAlbumAndPressingFromDiscogs(release, format);

  const pressing = await prisma.pressing.findFirst({
    where: { metadataSource: "DISCOGS", externalId: String(release.id) },
    select: { id: true },
  });
  if (!pressing) throw new Error("pressing not found after upsert"); // unreachable

  await prisma.collectionItem.create({
    data: { userId, pressingId: pressing.id },
  });

  revalidatePath("/me");
  redirect("/me");
}

async function ensureAlbumAndPressingFromDiscogs(
  release: DiscogsRelease,
  format: "CD" | "VINYL",
) {
  // Album: keyed by master_id (or release id if no master)
  const albumExternalId = String(release.master_id ?? release.id);
  const { artist, title } = release.artists?.length
    ? { artist: joinArtists(release.artists), title: release.title.replace(/^.*\s-\s/, "") }
    : parseTitle(release.title);

  const album = await prisma.album.upsert({
    where: {
      metadataSource_externalId: {
        metadataSource: "DISCOGS",
        externalId: albumExternalId,
      },
    },
    update: {},
    create: {
      title,
      artist,
      year: release.year ?? undefined,
      metadataSource: "DISCOGS",
      externalId: albumExternalId,
    },
  });

  const existingPressing = await prisma.pressing.findFirst({
    where: { metadataSource: "DISCOGS", externalId: String(release.id) },
    select: { id: true, coverUrl: true },
  });
  if (existingPressing) return existingPressing;

  // First time we've seen this Pressing — re-host its cover.
  const sourceCover = pickPrimaryImage(release);
  const coverUrl = sourceCover
    ? await uploadFromUrl(sourceCover, {
        folder: "slowell/covers",
        publicId: `discogs-${release.id}`,
      })
    : null;

  return prisma.pressing.create({
    data: {
      albumId: album.id,
      format,
      label: release.labels?.[0]?.name,
      country: release.country,
      year: release.year ?? undefined,
      catalogNumber: release.labels?.[0]?.catno,
      variant: pickVariant(release),
      coverUrl,
      metadataSource: "DISCOGS",
      externalId: String(release.id),
    },
  });
}

// ── Add: manual (with optional Discogs match suggestion) ───────────────────

export type ManualAddResult =
  | { status: "created"; itemId: string }
  | {
      status: "suggestion";
      match: { id: number; title: string; year?: string; thumb?: string };
    };

/**
 * Server action used by the manual-entry form.
 * If no `force=true` flag is set, we first probe Discogs for a high-confidence
 * match and return a "suggestion" so the client can interrupt the save.
 */
export async function addManual(
  input: ManualAlbumInput,
  opts: { force?: boolean } = {},
): Promise<ManualAddResult> {
  const userId = await requireUser();
  const parsed = manualAlbumInput.parse(input);

  if (!opts.force) {
    const match = await probeDiscogsMatch(parsed.title, parsed.artist);
    if (match) return { status: "suggestion", match };
  }

  const album = await prisma.album.create({
    data: {
      title: parsed.title,
      artist: parsed.artist,
      year: parsed.year,
      metadataSource: "MANUAL",
    },
  });

  const pressing = await prisma.pressing.create({
    data: {
      albumId: album.id,
      format: parsed.format,
      label: parsed.label,
      country: parsed.country,
      year: parsed.year,
      catalogNumber: parsed.catalogNumber,
      variant: parsed.variant,
      metadataSource: "MANUAL",
    },
  });

  const item = await prisma.collectionItem.create({
    data: {
      userId,
      pressingId: pressing.id,
      notes: parsed.notes,
      acquiredAt: parsed.acquiredAt,
    },
    select: { id: true },
  });

  revalidatePath("/me");
  return { status: "created", itemId: item.id };
}

async function probeDiscogsMatch(
  title: string,
  artist: string,
): Promise<{ id: number; title: string; year?: string; thumb?: string } | null> {
  try {
    const results = await searchMasters(`${title} ${artist}`, { perPage: 3 });
    if (results.length === 0) return null;
    const top = results[0];

    // High-confidence heuristic: Discogs returns "Artist - Title".
    // We require both parts to fuzzy-match.
    const { artist: dArtist, title: dTitle } = parseTitle(top.title);
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (
      norm(dTitle).includes(norm(title)) ||
      norm(title).includes(norm(dTitle))
    ) {
      if (
        norm(dArtist).includes(norm(artist)) ||
        norm(artist).includes(norm(dArtist))
      ) {
        return {
          id: top.id, // master id — links to /me/add/master/<id>
          title: top.title,
          year: top.year,
          thumb: top.cover_image ?? top.thumb,
        };
      }
    }
    return null;
  } catch {
    // Discogs unreachable — degrade gracefully, allow manual creation.
    return null;
  }
}

// ── Edit / delete ───────────────────────────────────────────────────────────

export async function updateCollectionItem(
  itemId: string,
  input: EditCollectionItemInput,
) {
  const userId = await requireUser();
  const parsed = editCollectionItemInput.parse(input);

  await prisma.collectionItem.update({
    where: { id: itemId, userId } as Prisma.CollectionItemWhereUniqueInput,
    data: {
      notes: parsed.notes ?? null,
      customCoverUrl: parsed.customCoverUrl ?? null,
      acquiredAt: parsed.acquiredAt ?? null,
    },
  });
  revalidatePath("/me");
  revalidatePath(`/me/${itemId}`);
}

export async function updateManualPressing(
  itemId: string,
  input: EditManualPressingInput,
) {
  const userId = await requireUser();
  const parsed = editManualPressingInput.parse(input);

  const item = await prisma.collectionItem.findFirst({
    where: { id: itemId, userId },
    select: {
      pressing: {
        select: { id: true, metadataSource: true, albumId: true },
      },
    },
  });
  if (!item) throw new Error("item not found");
  if (item.pressing.metadataSource !== "MANUAL") {
    throw new Error("cannot edit metadata for a Discogs-sourced pressing");
  }

  await prisma.album.update({
    where: { id: item.pressing.albumId },
    data: { title: parsed.title, artist: parsed.artist, year: parsed.year },
  });
  await prisma.pressing.update({
    where: { id: item.pressing.id },
    data: {
      format: parsed.format,
      label: parsed.label,
      country: parsed.country,
      year: parsed.year,
      catalogNumber: parsed.catalogNumber,
      variant: parsed.variant,
    },
  });
  revalidatePath("/me");
  revalidatePath(`/me/${itemId}`);
}

export async function deleteCollectionItem(itemId: string) {
  const userId = await requireUser();
  await prisma.collectionItem.delete({
    where: { id: itemId, userId } as Prisma.CollectionItemWhereUniqueInput,
  });
  revalidatePath("/me");
  redirect("/me");
}
