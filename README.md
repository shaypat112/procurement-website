# Procurement

A procurement and inventory workspace built with Next.js App Router, Tailwind CSS, shadcn/ui components, Prisma, PostgreSQL, and AWS S3. The interface supports dark and light themes; use the top-right theme button to switch. The adjacent question mark opens the in-app guide.

## Run with Docker (recommended for local editing)

Install Docker Desktop, then from this project directory run:

```bash
cp .env.example .env
docker compose up --build
```

Open `http://localhost:3000`. Compose starts the `web` app and `db` PostgreSQL service, waits for PostgreSQL to become healthy, and creates the tables automatically. The first build downloads dependencies and can take a few minutes.

## Discord sign-in

Create a Discord application in the [Discord Developer Portal](https://discord.com/developers/applications). In its OAuth2 settings, add `http://localhost:3000/api/auth/discord/callback` as a redirect URL. Set `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, and `APP_URL=http://localhost:3000` in `.env`. Set `AUTH_SECRET` to a random string of at least 32 characters (for example, run `openssl rand -base64 48`). Keep `.env` private. If you change `APP_PORT`, update `APP_URL` and the Discord redirect URL to match.

Visitors sign in with their Discord account before accessing the app or its API. The top-right sign-out button ends the session. For a public deployment, update `APP_URL` and the Discord redirect URL to the deployed HTTPS domain.

The unauthenticated `/api/health` endpoint reports whether PostgreSQL is connected, whether Discord is configured, and whether files use S3 or local storage. It never returns credentials.

Edit files in `src/` on your computer. The source directory is mounted into the `web` container, so Next.js reloads when files change. The database uses a named Docker volume and survives `docker compose down`. To stop the app, press Ctrl+C or run `docker compose down` in another terminal. To reset all local database data, run `docker compose down -v`.

Optional settings are in `.env`: `APP_PORT`, `DB_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, and the AWS S3 variables. Compose sets its own `DATABASE_URL` using the `db` service name. It also publishes PostgreSQL to `127.0.0.1:${DB_PORT:-5432}` so a locally running app can use the `localhost` URL in `.env`. Keep that URL's user, password, port, and database in sync with the Compose settings. If port 5432 is already in use, set `DB_PORT=5433` and use `localhost:5433` in `DATABASE_URL`. Restart `npm run dev` after changing `.env`. If you change PostgreSQL credentials after the database volume was created, recreate that volume or use the original credentials. After changing `package.json`, run `docker compose up --build --renew-anon-volumes` so the container picks up the new dependencies.

## Run locally

1. Install Node.js 20.9+ and start PostgreSQL, or run `docker compose up -d db` to use the project's database.
2. Copy `.env.example` to `.env`. Its `DATABASE_URL` matches the default Compose database. If you use a different PostgreSQL instance or change the Compose settings, update the URL accordingly. For file uploads, also set `AWS_REGION`, `AWS_S3_BUCKET`, and configure AWS credentials through the standard AWS credential chain or environment variables.
3. Install packages: `npm install` (this generates the Prisma client).
4. Create the database tables: `npm run db:push`.
5. Start the app: `npm run dev`

The app opens at `http://localhost:3000`. Without a real S3 bucket, item files are stored in `.data/inventory/` locally (ignored by Git). For a deployment, configure S3 for durable shared files. S3 uploads use short-lived presigned PUT URLs. The bucket must allow browser PUT requests from the app's origin through its CORS policy. Use an IAM principal scoped to the target bucket's `inventory/*` object keys.

## Activity Terrain component

The login screen uses the Kokonut UI component in `src/components/kokonutui/activity-terrain.tsx`. It renders a responsive, interactive canvas with flat and terrain views. The login view loads actual daily request counts for the past 12 weeks from `/api/public/activity`. This public endpoint returns dates and totals only; requester details stay behind sign-in. To use the component on another page:

```tsx
import ActivityTerrain from "@/components/kokonutui/activity-terrain";

<ActivityTerrain
  title="Orders received"
  data={[0, 2, 1, 4, 3, 0, 1]}
  endDate="2026-11-03"
  className="w-full"
/>
```

Pass one count per day in `data`, oldest first; `endDate` is the date of the last count. `defaultFlat` starts it in heatmap mode. The login screen overrides its colors through the `login-terrain` class in `src/app/globals.css`.

## Bento dashboard component

The signed-in overview uses Kokonut UI's draggable, resizable `WidgetGrid` from `src/components/kokonutui/bento-grid.tsx`. Its widgets receive live values from the existing orders and inventory APIs. To add a widget, edit the `items` array in `src/components/personal-dashboard.tsx`:

```tsx
import WidgetGrid, { type WidgetGridItem } from "@/components/kokonutui/bento-grid";

const items: WidgetGridItem[] = [
  { id: "pending", title: "Pending requests", defaultSpan: 2, render: () => <p>{pendingCount}</p> },
];

<WidgetGrid items={items} className="!max-w-none [--wg-accent:var(--accent)]" />
```

Each widget has a unique `id`, a title, optional icon, a `render` function, and a default span from 2 to 6 columns. On phones, the grid adapts to two columns. The mascot image is in `public/mascot.png`; Next.js uses `src/app/icon.png` as the favicon.

## Workflows

The Next.js App Router pages are `/` (overview), `/catalog`, `/catalog/new`, `/orders`, `/orders/new`, `/inventory`, and `/help`. API route handlers live under `src/app/api/`; the shared interactive workspace lives under `src/components/`, and editable shadcn component source lives under `src/components/ui/`.

- **Catalog:** Name a part by type, size, and key specification, using consistent units; enter the supplier part number when available. Names and part numbers are checked case-insensitively to prevent duplicate catalog entries. Save category, supplier, description, cost, and product URL once for reuse.
- **Orders:** Select a catalog item and quantity. Discord supplies the requester identity. The app warns about active orders; confirming stacks quantity onto a pending order for the same subsystem, otherwise it records a separate request. Every requester is recorded under a stacked order and sees it on their dashboard.
- **Order sheet:** Robbie or a student can move an order through Pending, Ordered, and Delivered. Pending orders can accumulate; Ordered orders are closed to stacking. Delivered orders are added to inventory in the same database transaction.
- **Inventory:** One on-hand quantity is kept per catalog item. Delivered orders add to that quantity. Attach files in S3 and open them from the inventory page.
- **Reinventory:** Each check-in replaces the on-hand quantity with the physical count and saves a dated audit entry.

## First iteration notes

Discord sign-in protects the workspace and API. Role-based permission rules for purchasing and receiving are not configured yet. The AWS SDK uses its standard credential chain; do not commit cloud credentials.
# procurement-website
# procurement-website
