# PulseCart

**What's trending. Delivered.**

PulseCart is a zero-cost, mostly automated dropshipping storefront for South Africa. A scheduled
pipeline watches live trend signals, researches real supplier listings, writes the product copy and
queues organic social posts. The storefront is a fully static Next.js site deployed on Cloudflare
Pages.

- **Market:** South Africa
- **Currency:** ZAR
- **Brand:** PulseCart
- **Runtime:** GitHub Actions (free for public repositories)
- **Storefront:** Next.js static export + Tailwind CSS v4 on Cloudflare Pages
- **Database:** JSON files in [`data/`](data), committed by CI
- **Advertising:** organic auto-posting to Telegram, Bluesky and Mastodon

> The three launch products are curated demo entries built from real marketplace listings. New
> products are only published when supplier confidence and margin pass the configured gate.

---

## How it works

```text
             ┌─────────────────────────────────────────────────────────┐
             │                  GitHub Actions (daily)                 │
             │                                                         │
  Google ───▶│  scan ──▶ research ──▶ content ──▶ publish ──▶ commit    │──▶ Cloudflare Pages
  News   ───▶│    │         │            │           │          data/     │       │
  Trends ───▶│    │         │            │           │                    │       ▼
  AliExpress ▶│    └─────────┴────────────┴───────────┘                    │   Storefront
  Reddit ───▶│         trends → products → copy → social posts            │   (static)
             └─────────────────────────────────────────────────────────┘
```

### Pipeline stages

| Stage | What it does | Output |
| --- | --- | --- |
| `scan` | Collects Google Trends ZA, Google News, Reddit and marketplace signals, merges duplicates, filters informational noise and scores product momentum. | `data/trends/latest.json` |
| `research` | Matches the best trends to real supplier listings, checks price, shipping, delivery window and stock, calculates the ZAR price and gates publishing. | `data/products/*.json`, `data/research/*.json` |
| `content` | Writes the listing copy and social captions with an AI provider when configured, or a deterministic template fallback. | Product copy, `data/posts/queue.json` |
| `publish` | Posts queued content to the enabled channels. Missing credentials are skipped, not treated as fatal. | `data/posts/queue.json` |

The pipeline is deliberately conservative:

- `autoPublish` is `false` in [`data/config.json`](data/config.json), so new products remain drafts
  until reviewed.
- `requireSupplierConfidence` is `medium`.
- Demo products are marked `demo: true` and skipped by the content stage.
- The storefront only renders products with `status: "published"` or `demo: true`.

### Why JSON instead of a database?

The catalogue is small and the whole point is zero cost. JSON files are versioned in Git, reviewed
in pull requests, and read directly by the static build. There is no database bill and no server to
keep alive.

---

## Project layout

```text
pulsecart/
├─ .github/workflows/
│  ├─ ci.yml                 # typecheck + build on push / PR
│  └─ pipeline.yml           # daily scan → research → content → publish → commit
├─ data/
│  ├─ config.json            # brand, market, pipeline thresholds, channels, legal
│  ├─ products/              # published / draft product records
│  ├─ research/              # supplier research snapshots
│  ├─ trends/                # daily radar + latest.json
│  └─ posts/                 # social queue (created by the content stage)
├─ docs/BRAND.md             # voice, palette, content rules
├─ pipeline/
│  └─ src/
│     ├─ sources/            # Google Trends, News, Reddit, AliExpress, manual
│     ├─ stages/             # scan, research, content, publish
│     ├─ channels/           # Telegram, Bluesky, Mastodon
│     └─ run.ts              # CLI entry point
└─ storefront/
   ├─ app/                   # Next.js App Router pages
   ├─ components/            # UI, cart, checkout, product cards
   ├─ lib/                   # data loading, formatting, contact helpers
   └─ public/                # product images, OG image, headers
```

---

## Local development

Requirements: **Node.js 22+** and npm. The repo includes an `.nvmrc`.

```bash
npm install
npm run typecheck
npm run dev
```

The storefront runs at `http://localhost:3000`. It reads the JSON in `data/` at build time, so changes
to products or trends show up on the next dev reload or build.

### Useful commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the storefront dev server |
| `npm run build` | Build the static site into `storefront/out` |
| `npm run preview` | Serve the built static site locally |
| `npm run typecheck` | Typecheck both workspaces |
| `npm run pipeline` | Run every pipeline stage |
| `npm run scan` | Refresh trend data only |
| `npm run research` | Turn trends into product drafts |
| `npm run content` | Generate listing copy and the social queue |
| `npm run publish` | Publish queued social posts |

---

## Configuration

### `data/config.json`

| Key | Purpose |
| --- | --- |
| `brand.domain` | Canonical site URL used by metadata, sitemap and product links |
| `brand.email` | Support email shown across the storefront |
| `brand.whatsapp` | Digits for `wa.me` links, e.g. `27821234567`. Leave empty to fall back to email |
| `pipeline.autoPublish` | Set `true` only when you trust the supplier gate |
| `pipeline.minTrendScore` | Minimum trend score for research |
| `pipeline.requireSupplierConfidence` | `low`, `medium` or `high` |
| `pipeline.markup` | ZAR pricing multiplier bands |
| `channels.*` | Enable or disable each social channel |

Before going live, replace the placeholder domain, email and WhatsApp number. The legal fields in
`data/config.json` are used by the footer and policy pages.

### Environment variables

Copy [`.env.example`](.env.example) to `.env` for local runs. Everything is optional:

- **AI copy:** `GEMINI_API_KEY`, `GROQ_API_KEY` or `OPENROUTER_API_KEY`
- **Telegram:** `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
- **Bluesky:** `BLUESKY_HANDLE`, `BLUESKY_APP_PASSWORD`
- **Mastodon:** `MASTODON_INSTANCE`, `MASTODON_TOKEN`
- **Reddit:** `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_USER_AGENT`
- **Currency fallback:** `USD_ZAR_RATE`

Without an AI key the pipeline still runs, using the template writer. Without social credentials the
publish stage skips channels cleanly. Without Reddit credentials the Reddit source is skipped.

---

## Deployment

### 1. Push the repository to GitHub

```bash
git add .
git commit -m "feat: launch PulseCart"
git branch -M main
git remote add origin https://github.com/<you>/pulsecart.git
git push -u origin main
```

### 2. Create the Cloudflare Pages project

1. Open the Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Select the repository.
3. Use these build settings:

   | Setting | Value |
   | --- | --- |
   | Framework preset | None / Next.js (Static HTML Export) |
   | Build command | `npm run build` |
   | Build output directory | `storefront/out` |
   | Root directory | *(leave blank — the repo root)* |
   | Node version | `22` (set `NODE_VERSION=22` if prompted) |

4. Deploy. Cloudflare gives you a free `*.pages.dev` URL. Add a custom domain later if you buy one.

The build is a pure static export: no Cloudflare Functions, no server runtime, no paid plan.

### 3. Let the daily workflow commit data

The workflow in [`.github/workflows/pipeline.yml`](.github/workflows/pipeline.yml) runs at **04:23
UTC** every day and can be triggered manually from the Actions tab. It:

1. installs dependencies and typechecks;
2. runs the pipeline;
3. commits any changes under `data/`;
4. optionally calls a Cloudflare deploy hook.

If your Pages project is connected directly to the repository, the data commit should trigger a new
build automatically. If it does not, create a **Deploy Hook** in Cloudflare Pages and add it as the
`CLOUDFLARE_DEPLOY_HOOK` repository secret. Leave the secret unset if you do not need it.

The workflow needs **Read and write** permission for repository contents. This is already declared in
the workflow, but the repository setting must allow it:

> Settings → Actions → General → Workflow permissions → **Read and write permissions**

### 4. Add the optional secrets

Add any of the variables from [`.env.example`](.env.example) under:

> Settings → Secrets and variables → Actions → New repository secret

Start with the channels you actually use. Telegram + Bluesky + Mastodon are the fully automated
ones; Pinterest, Instagram, TikTok and X are intentionally manual and disabled in the config.

---

## The storefront

- **Home** — editorial hero, live trend radar, current edit, how it works, category grid.
- **Shop** — client-side category filters, search and sorting over the static catalogue.
- **Product** — gallery, quantity picker, WhatsApp order handoff, delivery/returns accordions,
  related products, Product + Breadcrumb JSON-LD.
- **Trend radar** — the live signals behind the edit, with scores and source mix.
- **Cart** — localStorage cart, quantity controls, free-delivery progress, order summary.
- **Checkout** — validated delivery form that composes a WhatsApp order message, with an email
  fallback. No card details are collected on the site.
- **Trust pages** — about, contact, shipping & returns, privacy (POPIA + PAIA), terms, 404.

Checkout is intentionally manual for launch: the customer sends the order, you confirm stock, then
send a secure payment link. PayFast or Paystack can be added later without changing the catalogue
format.

### Product record shape

A product lives in `data/products/<slug>.json`:

```json
{
  "id": "p_face_ice_roller_gua_sha",
  "slug": "face-ice-roller-gua-sha-set",
  "title": "Face Ice Roller & Gua Sha Set",
  "tagline": "The five-minute morning de-puff.",
  "description": ["...", "..."],
  "bullets": ["...", "..."],
  "priceZar": 230.99,
  "images": ["/products/ice-roller.webp"],
  "category": "beauty",
  "tags": ["Beauty & Wellness", "skincare"],
  "trend": { "id": "t_...", "title": "...", "source": "aliexpress", "score": 88 },
  "supplier": {
    "supplier": "AliExpress",
    "url": "https://www.aliexpress.com/item/....html",
    "costZar": 24,
    "shippingZar": 65,
    "deliveryDays": [10, 18],
    "inStock": true,
    "confidence": "high",
    "checkedAt": "2026-11-02T20:00:00.000Z"
  },
  "seo": { "title": "...", "description": "...", "keywords": ["..."] },
  "status": "published",
  "demo": true,
  "createdAt": "2026-11-02T20:00:00.000Z",
  "updatedAt": "2026-11-02T20:00:00.000Z"
}
```

Set `"status": "draft"` to hide a product. Remove `"demo": true` once a product is fully verified and
you want the content stage to manage it.

---

## Zero-cost stack

| Piece | Service | Free tier |
| --- | --- | --- |
| Storefront hosting | Cloudflare Pages | 500 builds/month, unlimited static requests |
| Automation | GitHub Actions | 2,000 minutes/month for private repos, free for public |
| Data store | Git + JSON | Free |
| Trend data | Google Trends, Google News RSS, Reddit API, AliExpress pages | Free |
| Social posting | Telegram Bot API, Bluesky, Mastodon | Free |
| AI copy | Gemini / Groq / OpenRouter free tiers | Optional |
| Payments | WhatsApp order + secure payment link | Free to start |

Costs only appear if you choose to add a custom domain, paid ads or a payment gateway's transaction
fees. The storefront and pipeline themselves can run at R0.

---

## Safety and limitations

- **Supplier verification is the gate.** A high trend score is a reason to research, not a reason to
  sell. Keep `autoPublish` off until you have reviewed several runs.
- **Marketplace scraping is best-effort.** AliExpress can serve anti-bot pages from some networks.
  The parser handles the normal search payload, but repeated requests may need throttling or a
  different source.
- **Demo products are not a live supplier commitment.** Re-check price, stock and delivery before
  taking real orders.
- **Organic posting is not paid reach.** Telegram, Bluesky and Mastodon work automatically; the
  visual-first channels are manual by design.
- **Legal pages are a practical starting point.** Review the privacy policy, terms and PAIA section
  with a South African legal professional before trading at scale, and fill in the company
  registration details.
- **No fake urgency.** There are no invented reviews, stock counts or countdown timers. Keep it that
  way.

---

## Roadmap

- [ ] Add PayFast or Paystack hosted checkout.
- [ ] Add a supplier price re-check before dispatch.
- [ ] Add Pinterest and Instagram manual export packs.
- [ ] Add product image optimisation and local caching.
- [ ] Add an email drop-alert provider.
- [ ] Add a simple admin view for drafts.

---

## License

Private project. All brand assets, copy and code are © PulseCart.
