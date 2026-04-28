import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7 moved connection URLs out of schema.prisma. The migrate engine reads
// `datasource.url` directly. Use the direct (unpooled) URL so it can run DDL —
// PgBouncer can't.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DIRECT_URL,
  },
});
