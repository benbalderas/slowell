"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateProfile } from "@/lib/profile";

interface Props {
  initial: { displayName: string; bio: string; image: string };
  onClose: () => void;
}

export function ProfileEdit({ initial, onClose }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [bio, setBio] = useState(initial.bio);
  const [image, setImage] = useState(initial.image);
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        await updateProfile({
          displayName: displayName || undefined,
          bio: bio || undefined,
          image: image || undefined,
        });
        onClose();
        router.refresh();
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  return (
    <header className="px-4 pt-8 pb-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl">edit profile</h1>

      <Field label="display name">
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={60}
          placeholder="how you want to be seen"
          className={inputCls}
        />
      </Field>

      <Field label="bio">
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="a sentence or two."
          className={`${inputCls} h-auto py-3`}
        />
      </Field>

      <Field label="avatar url">
        <input
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="paste a url to override the avatar"
          className={inputCls}
        />
      </Field>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="flex-1 h-[52px] rounded-lg bg-surface-deep text-ink-secondary font-medium lowercase active:scale-[0.97] transition-transform duration-[120ms]"
        >
          cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="flex-1 h-[52px] rounded-lg bg-accent text-accent-text font-medium lowercase active:scale-[0.97] transition-transform duration-[120ms]"
        >
          {pending ? "saving…" : "save"}
        </button>
      </div>
    </header>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs text-ink-secondary lowercase">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full h-[52px] px-4 rounded-md bg-surface-raised border border-surface-deep text-ink text-base placeholder:text-ink-secondary focus:outline-none focus:border-ink/40";
