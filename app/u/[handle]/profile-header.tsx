"use client";

import { useState } from "react";

import type { PublicProfile } from "@/lib/profile";
import { ProfileEdit } from "./profile-edit";

export function ProfileHeader({ profile }: { profile: PublicProfile }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <ProfileEdit
        initial={{
          displayName: profile.user.displayName ?? "",
          bio: profile.user.bio ?? "",
          image: profile.user.image ?? "",
        }}
        onClose={() => setEditing(false)}
      />
    );
  }

  // Title rendering: owner sees lowercase UI chrome ("my collection"),
  // visitor sees the possessor name as-is ("terriwao's collection" /
  // "Terri's collection").
  const possessor = profile.user.displayName ?? profile.user.handle;
  const title = profile.isOwner ? "my collection" : `${possessor}'s collection`;

  return (
    <header className="pt-8 pb-6">
      <div className="flex items-start gap-4">
        <div className="font-bit text-xl text-ink-secondary leading-none mt-1">
          ♪
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <h1 className="text-xl truncate">{title}</h1>
          <p className="text-sm text-ink-secondary tabular-nums">
            <span className="font-bit text-base">{profile.stats.total}</span>{" "}
            {profile.stats.total === 1 ? "album" : "albums"}
          </p>
        </div>

        {profile.isOwner ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="h-12 w-12 rounded-full bg-surface-deep overflow-hidden flex-shrink-0 active:scale-[0.97] transition-transform duration-[120ms]"
            style={{ outline: "3px solid #D3FB67", outlineOffset: "2px" }}
            aria-label="edit profile"
          >
            {profile.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.user.image}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-ink-secondary lowercase">
                {profile.user.handle.slice(0, 2)}
              </div>
            )}
          </button>
        ) : (
          <div
            className="w-12 h-12 rounded-full bg-surface-deep overflow-hidden flex-shrink-0"
            style={{ outline: "3px solid #D3FB67", outlineOffset: "2px" }}
          >
            {profile.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.user.image}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-ink-secondary lowercase">
                {profile.user.handle.slice(0, 2)}
              </div>
            )}
          </div>
        )}
      </div>

      {profile.user.bio ? (
        <p className="text-sm text-ink-secondary mt-4 whitespace-pre-wrap">
          {profile.user.bio}
        </p>
      ) : null}
    </header>
  );
}
