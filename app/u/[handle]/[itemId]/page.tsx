import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ItemDetail } from "./item-detail";

interface Props {
  params: Promise<{ handle: string; itemId: string }>;
}

export default async function ItemDetailPage({ params }: Props) {
  const { handle, itemId } = await params;

  // Resolve the item by both handle and id — guards against /u/X/Y where Y
  // isn't actually X's item, returning a clean 404.
  const item = await prisma.collectionItem.findFirst({
    where: { id: itemId, user: { handle } },
    select: {
      id: true,
      userId: true,
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
  if (!item) notFound();

  const session = await auth();
  const isOwner = session?.user?.id === item.userId;

  return (
    <ItemDetail
      handle={handle}
      isOwner={isOwner}
      item={{
        id: item.id,
        notes: item.notes,
        customCoverUrl: item.customCoverUrl,
        acquiredAt: item.acquiredAt ? item.acquiredAt.toISOString() : null,
        pressing: {
          format: item.pressing.format,
          label: item.pressing.label,
          country: item.pressing.country,
          year: item.pressing.year,
          catalogNumber: item.pressing.catalogNumber,
          variant: item.pressing.variant,
          coverUrl: item.pressing.coverUrl,
          metadataSource: item.pressing.metadataSource,
          album: {
            title: item.pressing.album.title,
            artist: item.pressing.album.artist,
            year: item.pressing.album.year,
          },
        },
      }}
    />
  );
}
