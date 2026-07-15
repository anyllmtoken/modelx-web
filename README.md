# ModelX Web

> AI model catalog frontend — browse, compare, and search models across 60+ providers.

Data sourced from [modelx-data](https://github.com/anyllmtoken/modelx-data) — published daily as [`@anyllmtoken/modelx-data`](https://www.npmjs.com/package/@anyllmtoken/modelx-data) on npm.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router, Turbopack)
- [React](https://react.dev) 19
- [Tailwind CSS](https://tailwindcss.com) 4
- [Vercel](https://vercel.com) for deployment

## Development

From the monorepo root:

```bash
pnpm dev:web
```

Or from this directory:

```bash
pnpm dev
```

The dev server starts at `http://localhost:3000`.

## Build

```bash
pnpm build
```

## Project Structure

```
app/
  page.tsx                 → Homepage
  [provider]/              → Provider detail pages
  [provider]/[...id]/      → Model detail pages
  models/                  → All models listing
  compare/                 → Model comparison
  changes/                 → Data change log
  analytics/               → Analytics dashboard
  api/                     → API routes (OG images, markdown)
components/
  pages/                   → Page-specific components
  shared/                  → Shared components (search, model list, etc.)
  ui/                      → Base UI components
lib/
  data.ts                  → Data access layer
  search.ts                → Search utilities
  sort.ts                  → Sorting utilities
```
