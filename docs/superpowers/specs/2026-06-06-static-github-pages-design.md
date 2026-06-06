# DevFest Milano 2025 — Static GitHub Pages Archive

**Date:** 2026-06-06
**Goal:** Recreate the live site https://devfestmilano.it/ as a fully static site
deployable to GitHub Pages, with every page and all real content, no backend.

## Context

The live site is a client-rendered SPA built from this repo (the "Hoverboard"
conference template — Polymer/Lit Web Components). Content is loaded at runtime
from Firestore (project `devfest-milano-2025`) and rendered inside Shadow DOM.
There is no static HTML content; the HTML shell only bootstraps JavaScript.

The event is in the past (today is 2026-06-06), so the target is a faithful
**static archive**, not a working application.

### Verified facts
- Firestore REST API responds **publicly** with the site's web API key for:
  `speakers` (72), `sessions` (95), `schedule` (1), `team` (1), `partners` (4),
  `blog` (5), `gallery` (11), `videos` (22), `previousSpeakers` (22),
  `tickets` (1). `config` is locked (403).
- Web Firebase config (public): projectId `devfest-milano-2025`,
  apiKey `AIzaSyDT7hHXLQ4tIBD1nhN5VL-WC9ee7cQIT4g`, database `(default)`.
- Live site returns HTTP 200; renders client-side only.
- App routes: `/`, `/schedule`, `/sessions/:id`, `/speakers`, `/speakers/:id`,
  `/previous-speakers`, `/team`, `/faq`, `/coc`, `/location`, `/blog`,
  `/post/:id`, `/speakers-info`.

## Decisions (from brainstorming)

- **Content source:** mix of live Firestore (REST) + crawl of the live site.
  Firestore gives clean data and the complete list of IDs; the crawl captures
  exact rendered markup/styling.
- **Dynamic features:** removed entirely (login, my-schedule, ticket purchase,
  push notifications, newsletter/feedback forms). Pure static archive.
- **Deploy target:** custom domain at root `/`. Root-relative asset paths.
  CNAME file deferred until the domain is chosen.
- **Depth:** every individual detail page (all 72 speakers, all 95 sessions,
  all blog posts) plus the main pages.
- **Approach:** Hybrid (C). Bake Firestore data + headless pre-render of every
  route into real per-page HTML using **Declarative Shadow DOM** so content
  renders without JS.

## Architecture — staged pipeline

Output to `static-site/`. Each stage is an independent script in
`scripts/static/`, run in order by an orchestrator.

1. **extract-data** (`extract-data.mjs`) — Dump every public Firestore
   collection via REST (paginated; convert Firestore typed JSON →
   plain JSON) into `static-site/data/*.json`. Emit the full route list.
2. **crawl-prerender** (`crawl.mjs`) — Playwright headless. For each route,
   load the live site, wait for full render, then serialize the DOM **with all
   shadow roots as Declarative Shadow DOM**, capturing per-shadow-root
   `adoptedStyleSheets` as inline `<style>` (Lit/Polymer apply styles via
   constructable stylesheets which DSD does not serialize — must be inlined).
   Collect every referenced asset URL.
3. **rewrite** (`rewrite.mjs`) — Rewrite asset/link URLs to root-relative.
   Neutralize backend JS: remove/replace Firebase SDK, service worker
   registration, analytics, auth, ticketing, and form handlers. Keep minimal
   inline JS only for the nav menu toggle.
4. **assets** (part of crawl/rewrite) — Download and localize CSS, JS, fonts,
   and images under `static-site/{styles,scripts,fonts,images}`.
5. **finalize** (`build.mjs`) — Write `404.html` fallback, `.nojekyll`,
   `sitemap.xml`, `robots.txt`. (CNAME added later when domain chosen.)

### Components (isolated units)
- `scripts/static/firestore.mjs` — REST client + typed→plain converter + paging.
- `scripts/static/extract-data.mjs` — dumps collections, writes route list.
- `scripts/static/crawl.mjs` — Playwright crawl + DSD serializer + asset collector.
- `scripts/static/rewrite.mjs` — URL rewriting + JS neutralization.
- `scripts/static/build.mjs` — orchestrator (runs stages, finalize).

### Data flow
Firestore REST → JSON + route list → Playwright renders each live route →
DSD-serialized HTML (+ inlined shadow styles) → rewrite/localize → `static-site/`.

## Key technical risk (de-risk first)

Lit components apply `static styles` via `adoptedStyleSheets` (constructable
stylesheets), which `getHTML({serializableShadowRoots})` does **not** serialize.
If unaddressed, serialized DSD pages would render unstyled. Mitigation: during
serialization, walk every shadow root, read its `adoptedStyleSheets`, and inject
their CSS as inline `<style>` inside each serialized shadow root.

**First plan task:** validate on the live home page that a DSD snapshot +
inlined adopted styles renders correctly with JS disabled. If DSD proves
unworkable, fall back to Approach B (ship the SPA reading static JSON).

## Removed at rewrite stage
Google login/auth, my-schedule, ticket purchase, push notifications,
newsletter/feedback forms, service worker, live Firebase/Firestore calls,
analytics beacons.

## Verification (before claiming done)
- Serve `static-site/` locally; visually inspect home, schedule, a speaker, a
  session, faq, location, team, blog post.
- Confirm **no** runtime network calls to `firebase`/`googleapis`.
- Confirm file counts: 72 `speakers/*`, 95 `sessions/*` pages exist.
- Internal link/asset check: no broken links or missing assets.

## Out of scope
- Working interactivity (auth, personalization, ticketing) — archive only.
- Re-implementing the build for future live use.
