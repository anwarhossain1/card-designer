# CardCraft — Business Card Designer

A Canva-style editor focused on one product: the 3.5 × 2 inch business card.
Design in the browser, autosave locally, export print-ready PNG / JPEG / PDF.

```
card-designer/
├─ web/      Next.js 15 (App Router) · TypeScript · Tailwind v4 · Fabric.js · Zustand · React Query
└─ server/   Express 4 · TypeScript · Mongoose
```

## Running locally

```bash
cd web && npm run dev
```

```bash
cd server && npm run dev
```

The web app is fully usable without the API: templates ship in the bundle and
projects autosave to LocalStorage. The server is optional in the MVP and starts
even when `MONGODB_URI` is unset.

## Frontend layout

```
web/src/
├─ app/                  routes: / (landing), /editor
│  ├─ layout.tsx         fonts, metadata, providers
│  └─ providers.tsx      React Query
├─ components/
│  ├─ ui/                design-system primitives (Button, IconButton, …)
│  ├─ landing/           marketing sections
│  └─ editor/            toolbar · left sidebar · canvas · right sidebar
├─ config/               print geometry, zoom/snap tuning, font registry
├─ hooks/                canvas, selection, history, shortcuts, autosave
├─ lib/
│  ├─ api/               fetch client for the Express API
│  ├─ canvas/            all Fabric.js interaction lives here
│  ├─ export/            PNG · JPEG · PDF renderers
│  ├─ storage/           LocalStorage persistence
│  ├─ templates/         bundled template definitions
│  └─ utils/             cn, ids, unit conversion
├─ store/                Zustand stores (editor + UI state)
└─ types/                document, element and template models
```

### Architectural rules

- **Fabric stays behind `lib/canvas`.** React components never import `fabric`
  directly; they call typed helpers and hooks. Swapping the render engine, or
  rendering server-side for print, touches one folder.
- **The document is the contract.** `CardDocument` (`types/document.ts`) is what
  gets autosaved, exported and — later — stored per user. `schemaVersion` gates
  migrations. `kind` and `sides` leave room for back sides and other products.
- **Elements carry metadata.** Every canvas object holds an `ElementMeta`
  envelope (`id`, `kind`, `name`, `role`, `locked`) so layers, properties and
  templates never inspect Fabric internals.
- **Persistence is an adapter.** LocalStorage today, the same interface can be
  backed by the API once accounts exist.
- **Files stay small.** ~300 lines max, one responsibility per module.

## Backend layout

```
server/src/
├─ index.ts              bootstrap + graceful shutdown
├─ app.ts                middleware pipeline
├─ config/               env validation (zod), optional Mongo connection
├─ middleware/           404 + centralised error handling
├─ modules/<feature>/    model · service · controller · routes
├─ routes/index.ts       API surface
└─ utils/                AppError, asyncHandler, response envelope, logger
```

Responses use a single envelope: `{ data }` on success, `{ message, details }`
on error.

## Deliberately not built yet

Accounts, saved projects, collaboration, print ordering, payments, template
marketplace, card backs. The document model, module boundaries and API envelope
are shaped to absorb them without a rewrite.
