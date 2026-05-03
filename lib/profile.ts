"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  type UpdateProfileInput,
  updateProfileInput,
} from "@/lib/schemas";

export interface PublicProfile {
  user: {
    id: string;
    handle: string;
    displayName: string | null;
    bio: string | null;
    image: string | null;
  };
  stats: { total: number; vinyl: number; cd: number };
  items: {
    id: string;
    cover: string | null;
    title: string;
    artist: string;
  }[];
  isOwner: boolean;
  viewerHandle: string | null;
}

export async function getPublicProfile(
  handle: string,
): Promise<PublicProfile | null> {
  const user = await prisma.user.findUnique({
    where: { handle },
    select: {
      id: true,
      handle: true,
      displayName: true,
      bio: true,
      image: true,
      collectionItems: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          customCoverUrl: true,
          pressing: {
            select: {
              format: true,
              coverUrl: true,
              album: { select: { title: true, artist: true } },
            },
          },
        },
      },
    },
  });
  if (!user) return null;

  const items = user.collectionItems.map((it) => ({
    id: it.id,
    cover: it.customCoverUrl ?? it.pressing.coverUrl ?? null,
    title: it.pressing.album.title,
    artist: it.pressing.album.artist,
  }));

  const total = user.collectionItems.length;
  const vinyl = user.collectionItems.filter(
    (it) => it.pressing.format === "VINYL",
  ).length;
  const cd = user.collectionItems.filter(
    (it) => it.pressing.format === "CD",
  ).length;

  const session = await auth();
  const viewerId = session?.user?.id ?? null;
  const viewerHandle = viewerId
    ? (
        await prisma.user.findUnique({
          where: { id: viewerId },
          select: { handle: true },
        })
      )?.handle ?? null
    : null;

  return {
    user: {
      id: user.id,
      handle: user.handle,
      displayName: user.displayName,
      bio: user.bio,
      image: user.image,
    },
    stats: { total, vinyl, cd },
    items,
    isOwner: viewerId === user.id,
    viewerHandle,
  };
}

export async function updateProfile(input: UpdateProfileInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("not signed in");
  const parsed = updateProfileInput.parse(input);

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      displayName: parsed.displayName ?? null,
      bio: parsed.bio ?? null,
      image: parsed.image ?? null,
    },
    select: { handle: true },
  });

  revalidatePath(`/u/${updated.handle}`);
  revalidatePath("/me");
}
