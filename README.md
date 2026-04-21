# SentinelChain

**Aviation fuel supply chain risk intelligence — in real time.**

SentinelChain (internally *SupplyPulse*) is an operations dashboard for airline risk,
fuel procurement, and supply chain teams. It consolidates chokepoints, refineries,
prices, and routes for jet fuel into a single view so teams can see exposure,
simulate disruptions, and act before a crisis spreads through the network.

---

## Features

- **Risk Dashboard** — KPI surface for active events, jet fuel prices, watchlist
  exposure, and regional buffers.
- **World Risk Map** — live heatmap of refineries, chokepoints, and supply routes
  with node-level drill-down.
- **Dependency Graph** — upstream / downstream exposure: which airports depend on
  which refineries.
- **What-If Simulator** — AI-driven scenarios (Strait of Hormuz closure, refinery
  outage, sanctions shifts) with structured impact estimates.
- **Alerts** — rule-based price, event, and risk-score triggers via email and
  in-app notifications.
- **Intelligence Feed** — curated, scored news from Reuters, IATA, BBC, EIA, and
  other primary sources.

## Tech stack

| Layer          | Choice                                                     |
| -------------- | ---------------------------------------------------------- |
| Framework      | [TanStack Start](https://tanstack.com/start) (SSR + Vite)  |
| Routing        | [TanStack Router](https://tanstack.com/router) (file-based)|
| UI             | React 19 · Tailwind CSS v4 · Radix UI · shadcn/ui          |
| Data / Auth    | Supabase (Postgres, Auth, RLS)                             |
| Forms          | React Hook Form + Zod                                      |
| Charts         | Recharts                                                   |
| Deployment     | Vercel (Build Output API v3)                               |

## Project structure

```
.
├── scripts/
│   └── vercel-adapter.mjs     # Post-build adapter → .vercel/output/
├── src/
│   ├── components/            # Shared UI (AppShell, SeverityBadge, shadcn/ui)
│   ├── hooks/                 # useAuth, useWatchlist, use-mobile
│   ├── integrations/supabase/ # Browser + server-side Supabase clients
│   ├── lib/                   # utils, severity helpers
│   ├── routes/                # File-based routes (app.*, auth.*, index)
│   ├── router.tsx             # Router factory + error boundary
│   └── styles.css             # Tailwind v4 entry
├── supabase/                  # Migrations + local config
├── vite.config.ts
├── vercel.json
└── package.json
```

## Quickstart

Requirements: Node.js `>= 20`, npm `>= 10`.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
#   fill in Supabase URL, anon key, and service-role key

# 3. Run the dev server
npm run dev
```

The app starts on `http://localhost:3000` by default.

## Environment variables

| Variable                        | Scope   | Purpose                                      |
| ------------------------------- | ------- | -------------------------------------------- |
| `VITE_SUPABASE_URL`             | public  | Supabase project URL (browser + server).     |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | public  | Supabase anon key (browser + server).        |
| `VITE_SUPABASE_PROJECT_ID`      | public  | Supabase project ID.                         |
| `SUPABASE_URL`                  | server  | Mirror of the project URL for server code.   |
| `SUPABASE_PUBLISHABLE_KEY`      | server  | Mirror of the anon key for server code.      |
| `SUPABASE_SERVICE_ROLE_KEY`     | server  | Service role key — bypasses RLS, never ship. |

Any variable prefixed with `VITE_` is inlined into the client bundle. Keep
secrets out of `VITE_*` names.

## Scripts

| Script                  | Description                                                |
| ----------------------- | ---------------------------------------------------------- |
| `npm run dev`           | Start the Vite dev server with HMR.                        |
| `npm run build`         | Production build (`dist/client` + `dist/server`).          |
| `npm run preview`       | Preview the production build locally.                      |
| `npm run vercel-build`  | Build + emit Vercel Build Output API v3 (`.vercel/output/`). |
| `npm run lint`          | Run ESLint.                                                |
| `npm run format`        | Run Prettier.                                              |

## Deployment on Vercel

This project ships with a Vercel adapter that outputs the Build Output API v3
format directly, so no framework preset is required.

1. Push the repo to GitHub / GitLab / Bitbucket.
2. Import the project in the [Vercel dashboard](https://vercel.com/new).
3. Leave the **Framework Preset** as "Other" — `vercel.json` already sets
   `buildCommand: npm run vercel-build` and `installCommand: npm ci`.
4. Add the environment variables from the table above in **Project Settings →
   Environment Variables**.
5. Deploy.

On every push, Vercel runs `vite build` and then `scripts/vercel-adapter.mjs`,
which assembles:

```
.vercel/output/
├── config.json                    # filesystem + SSR fallback routing
├── static/                        # client bundle (served as static assets)
└── functions/index.func/          # Node 22 serverless function (SSR)
    ├── .vc-config.json
    └── server.js
```

Vercel detects `.vercel/output/` and deploys static assets to the edge and the
SSR handler to a Node.js serverless function.

### Deploying with the Vercel CLI

```bash
npm i -g vercel
vercel           # first-time: link project and pull env vars
vercel --prod    # deploy to production
```

## Supabase

Database migrations live in `supabase/migrations/`. With the
[Supabase CLI](https://supabase.com/docs/guides/cli) installed:

```bash
supabase link --project-ref <your-project-id>
supabase db push
```

`src/integrations/supabase/client.ts` is the browser client (RLS-scoped).
`src/integrations/supabase/client.server.ts` is the admin client (service-role,
bypasses RLS) and **must only be imported from server code**.

## Disclaimer

Forecasts, prices, and impact estimates surfaced in this app are directional
estimates derived from public sources. Validate before operational use.

## Author

**Mohammad Zeeshan** · [@m-zest](https://github.com/m-zest)

## License

MIT © Mohammad Zeeshan
