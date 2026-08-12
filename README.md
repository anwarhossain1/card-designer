# CardCraft — Business Card Designer

A Canva-style editor focused on one product: the 3.5 × 2 inch business card.
Design both sides in the browser, autosave locally, export print-ready
PNG / JPEG / PDF.

```
card-designer/
├─ web/      Next.js 15 (App Router) · TypeScript · Tailwind v4 · Fabric.js · Zustand · React Query
└─ server/   NestJS 11 · TypeScript · Mongoose
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
├─ app/                  routes: / · /editor · /sign-in · /sign-up
│  ├─ layout.tsx         fonts, metadata, providers
│  └─ providers.tsx      React Query
├─ components/
│  ├─ ui/                design-system primitives (Button, IconButton, …)
│  ├─ landing/           marketing sections
│  ├─ auth/              sign-in and sign-up forms, account menu
│  └─ editor/            toolbar · left sidebar · canvas · right sidebar
├─ config/               print geometry, zoom/snap tuning, font registry
├─ hooks/                canvas, selection, sides, history, shortcuts,
│                        autosave, design sync, session
├─ lib/
│  ├─ api/               fetch client for the API
│  ├─ canvas/            all Fabric.js interaction lives here
│  ├─ document/          card side helpers and invariants
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
  migrations; v2 gave every document a back. `kind` leaves room for other print
  products.
- **One canvas, two sides.** Fabric holds only the side being edited; the other
  lives in `useCardSides` as serialized JSON — the same format autosave and
  export already speak. Switching is a save-then-load round trip through that
  format, so a side survives a swap exactly as well as it survives a reload.
  Undo history is per side, because a snapshot is the whole canvas.
- **Elements carry metadata.** Every canvas object holds an `ElementMeta`
  envelope (`id`, `kind`, `name`, `role`, `locked`) so layers, properties and
  templates never inspect Fabric internals.
- **Persistence is offline-first.** LocalStorage is the real autosave: it is
  synchronous, so it still lands when a tab closes, and a network that comes
  and goes never costs anyone the twenty minutes they just spent on a card.
  The server sits on top as a copy that follows them to the next device.
  Conflicts resolve last-write-wins on the document's own `updatedAt` — right
  for one person editing one card, and not enough the day two people share
  one, which is why the timestamps belong to the document rather than the row.
- **Files stay small.** ~300 lines max, one responsibility per module.

## Backend layout

```
server/src/
├─ main.ts               bootstrap: helmet, CORS, /api prefix, shutdown hooks
├─ app.module.ts         API surface — feature modules register here
├─ common/               response envelope, exception filter, zod pipe,
│                        session and guest guards, decorators
├─ config/               env validation (zod), Mongo connection
└─ modules/<feature>/    module · controller · service · schema
```

Responses use a single envelope: `{ data }` on success, `{ message, details }`
on error. Both are global — an interceptor wraps every return value and one
exception filter shapes every failure — so a controller just returns its value
and a service just throws.

Validation is zod everywhere, including request input: `ZodValidationPipe`
takes a schema, and a `ZodError` lands in the same `{ message, details }` shape
as any other failure. Nest's own convention is class-validator DTOs; one schema
library was judged better than two.

Mongo is required — users and sessions need somewhere to live.

### Sessions

`JwtAuthGuard` is registered globally, so a route added from now on is
authenticated unless it carries `@Public()`. Forgetting the decorator breaks
the endpoint loudly; forgetting to add a guard would have published it quietly.

Both tokens travel as httpOnly cookies, so no token is reachable from page
JavaScript and an XSS bug cannot walk away with a session. The trade is that
requests carry ambient authority, which `sameSite: strict` is there to contain
— split the app and API across unrelated domains and that has to become `none`,
at which point a CSRF token stops being optional.

A short-lived access token pairs with a 7-day refresh token that **rotates on
every use**: the presented token is swapped for its replacement in one update,
so a token that is not found was already used and buys nothing. Refresh tokens
are stored as SHA-256 hashes, capped at five concurrent sessions per account,
and `tokenVersion` invalidates every session at once.

### Designs and guests

A design belongs to an account **or** to a browser — exactly one of `owner` and
`guestId` is set, never both. Guests are not a lesser path bolted on beside the
real one; the two cases differ only in which column the query filters on, and
signing in moves a row from the second to the first.

Browsers without a session get a `guestId` cookie on first contact, issued by a
guard rather than middleware because middleware runs before guards and would
see every signed-in request as anonymous. The cookie is httpOnly like the
session ones, and responses are mapped to the document shape rather than
returned as stored — handing a browser back its own guest id would undo the
point of hiding it.

Signing in claims whatever that browser made, and the guest cookie is dropped
either way so there is only ever one identity. A failed claim never fails the
sign-in: the design is still in the browser, and refusing entry over it helps
nobody. Guests are capped at 10 designs against an account's 50, since a guest
id is self-issued by anyone who can set a cookie.

## Deliberately not built yet

A "my designs" screen — the editor syncs one card, the one you last worked on,
so a second design can only be reached by starting from a blank canvas. Google
sign-in, password reset, email verification, collaboration, print ordering,
payments, template marketplace, and templates that carry a matching back. Export still trims at
the card edge — bleed and crop marks are configured but not yet emitted. The
document model, module boundaries and API envelope are shaped to absorb these
without a rewrite.
