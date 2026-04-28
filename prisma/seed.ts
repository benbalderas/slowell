import { Format, MetadataSource, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Idempotent — re-runnable. Wipe the demo user's data first.
  await prisma.user.deleteMany({ where: { handle: "bb" } });

  const user = await prisma.user.create({
    data: {
      email: "demo@slowell.club",
      emailVerified: new Date(),
      handle: "bb",
      displayName: "demo",
      bio: "first crate, freshly dug.",
    },
  });

  // Album 1 — single pressing, vinyl, single owned copy
  const albumA = await prisma.album.create({
    data: {
      title: "in rainbows",
      artist: "radiohead",
      year: 2007,
      pressings: {
        create: {
          format: Format.VINYL,
          label: "XL Recordings",
          country: "UK",
          year: 2016,
          catalogNumber: "XLLP324",
          variant: "180g black",
          metadataSource: MetadataSource.MANUAL,
        },
      },
    },
    include: { pressings: true },
  });

  // Album 2 — single pressing, CD
  const albumB = await prisma.album.create({
    data: {
      title: "the dark side of the moon",
      artist: "pink floyd",
      year: 1973,
      pressings: {
        create: {
          format: Format.CD,
          label: "Capitol",
          country: "US",
          year: 1990,
          catalogNumber: "CDP 7 46001 2",
          metadataSource: MetadataSource.MANUAL,
        },
      },
    },
    include: { pressings: true },
  });

  // Album 3 — two pressings (original + reissue), demonstrates the
  // album-vs-pressing split. User owns the reissue twice (clean + reader).
  const albumC = await prisma.album.create({
    data: {
      title: "rumours",
      artist: "fleetwood mac",
      year: 1977,
      pressings: {
        create: [
          {
            format: Format.VINYL,
            label: "Warner Bros.",
            country: "US",
            year: 1977,
            catalogNumber: "BSK 3010",
            variant: "first press",
            metadataSource: MetadataSource.MANUAL,
          },
          {
            format: Format.VINYL,
            label: "Rhino",
            country: "US",
            year: 2011,
            catalogNumber: "R1 3010",
            variant: "180g reissue",
            metadataSource: MetadataSource.MANUAL,
          },
        ],
      },
    },
    include: { pressings: true },
  });

  const reissue = albumC.pressings.find((p) => p.variant === "180g reissue")!;

  await prisma.collectionItem.createMany({
    data: [
      {
        userId: user.id,
        pressingId: albumA.pressings[0].id,
        notes: "rainy sunday album.",
        acquiredAt: new Date("2024-09-12"),
      },
      {
        userId: user.id,
        pressingId: albumB.pressings[0].id,
      },
      {
        userId: user.id,
        pressingId: reissue.id,
        notes: "clean copy.",
      },
      {
        userId: user.id,
        pressingId: reissue.id,
        notes: "reader copy — gatefold split.",
      },
    ],
  });

  console.log(
    `seeded user "${user.handle}" with ${await prisma.collectionItem.count({ where: { userId: user.id } })} collection items across 3 albums and 4 pressings.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
