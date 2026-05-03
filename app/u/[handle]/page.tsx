import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getPublicProfile } from "@/lib/profile";
import { AlbumGrid } from "@/components/album-grid";
import { BottomBar } from "@/components/bottom-bar";
import { ProfileHeader } from "./profile-header";

interface Props {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const profile = await getPublicProfile(handle);
  if (!profile) return { title: "not found · slowell" };
  const name = profile.user.displayName ?? `@${profile.user.handle}`;
  const desc =
    profile.user.bio ??
    `${profile.stats.total} ${
      profile.stats.total === 1 ? "album" : "albums"
    } in ${name}'s collection`;
  return {
    title: `@${profile.user.handle} · slowell`,
    description: desc,
    openGraph: {
      title: `@${profile.user.handle} · slowell`,
      description: desc,
      type: "profile",
    },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { handle } = await params;
  const profile = await getPublicProfile(handle);
  if (!profile) notFound();

  const items = profile.items.map((it) => ({
    id: it.id,
    href: `/u/${handle}/${it.id}`,
    cover: it.cover,
    title: it.title,
    artist: it.artist,
  }));

  return (
    <>
      <ProfileHeader profile={profile} />
      <AlbumGrid items={items} />

      <BottomBar
        back={{ href: "/" }}
        middle={{ label: "all" }}
        primary={
          profile.isOwner
            ? { label: "add", href: `/u/${handle}/add` }
            : null
        }
      />
    </>
  );
}
