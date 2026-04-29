import { randomBytes } from "node:crypto";
import type { PrismaClient } from "@prisma/client";

const MAX_BASE_LEN = 20;

export async function generateHandle(
  email: string,
  prisma: PrismaClient,
): Promise<string> {
  const local = email.split("@")[0]?.toLowerCase() ?? "";
  const base = local.replace(/[^a-z0-9]/g, "").slice(0, MAX_BASE_LEN) || "user";

  const free = !(await prisma.user.findUnique({
    where: { handle: base },
    select: { id: true },
  }));
  if (free) return base;

  for (let i = 0; i < 5; i++) {
    const candidate = `${base.slice(0, MAX_BASE_LEN - 5)}-${suffix()}`;
    const taken = await prisma.user.findUnique({
      where: { handle: candidate },
      select: { id: true },
    });
    if (!taken) return candidate;
  }

  throw new Error("could not generate a unique handle after 5 attempts");
}

function suffix(): string {
  return randomBytes(3).toString("base64url").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 4) || "x000";
}
