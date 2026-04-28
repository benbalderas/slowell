# slowell

A home for your physical music collection. Part of the [offline.blue](https://offline.blue) ecosystem.

## Local development

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Fonts

PP Neue Montreal and PP NeueBit are licensed Pangram Pangram fonts. See [`public/fonts/README.md`](./public/fonts/README.md) for the files to drop in and how to wire them up.

Until the font files are added, the app falls back to system sans/mono — the design tokens are otherwise fully live.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v3 with design-system tokens
- next-themes for light / auto / dark
