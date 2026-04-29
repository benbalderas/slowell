import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { getCollectionItemDetail } from "@/lib/collection";
import { ItemDetail } from "./item-detail";

interface Props {
  params: Promise<{ itemId: string }>;
}

export default async function ItemDetailPage({ params }: Props) {
  const { itemId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const item = await getCollectionItemDetail(itemId, session.user.id);
  if (!item) notFound();

  return (
    <ItemDetail
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
