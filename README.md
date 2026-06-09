# DevFest Milano 2025 — static archive

This branch (`main-static`) is a fully **static, backend-free** snapshot of the
DevFest Milano 2025 website, served from **GitHub Pages**. The original site was
a "Hoverboard" Lit/Polymer SPA backed by Firestore; here it is frozen into plain
HTML/CSS/assets that render without any JavaScript app or backend.

## Layout

- Repo root — the static site itself (`index.html`, `404.html`, `assets/`,
  `images/`, `data/`, and the per-route pages: `speakers/`, `sessions/`,
  `schedule/`, `team/`, `faq/`, `location/`, `coc/`, `previous-speakers/`,
  `speakers-info/`). Published as-is to Pages.
- `scripts/static/` — the **rebuild tooling** that generated this snapshot
  (crawler + build pipeline). Not published. See its `README.md` / `RUNBOOK.md`
  to regenerate.
- `.github/workflows/deploy-pages.yaml` — publishes the site to GitHub Pages on
  every push to `main-static`.

## Deploy

GitHub Pages is configured with **Settings → Pages → Source: GitHub Actions**.
The workflow stages the site files (excluding tooling/docs/config) into `_site/`
and uploads them. For a custom domain, add a `CNAME` file at the root and set it
under Settings → Pages → Custom domain (see `scripts/static/README.md`).

## Rebuild

```bash
cd scripts/static
npm install                  # first time only
npm run build                # crawls the live site, regenerates the static output
node verify.mjs              # sanity checks
```

See `scripts/static/RUNBOOK.md` for the full playbook and gotchas.
