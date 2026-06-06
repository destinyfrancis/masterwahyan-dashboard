# Master Wahyan Private Dashboard

Private Cloudflare Pages site for Codex project dashboards.

Production URL:

```text
https://dash.masterwahyan.com
```

## Included dashboards

- Astrology Sessions
- BaZiLogicEngine
- Murmura
- SoundScribe

`BaZiStudioPro/dashboard` is intentionally excluded because it is a Python app, not a static report.

## Local setup

```bash
npm install
npm run sync
npm run dev
```

Create `.dev.vars` locally from `.dev.vars.example` before running the dev server.

## Password setup

Generate a password hash:

```bash
node scripts/hash-password.js "your strong password"
```

Set Cloudflare Pages secrets:

```bash
wrangler pages secret put DASHBOARD_PASSWORD_HASH --project-name=masterwahyan-dashboard
wrangler pages secret put DASHBOARD_SESSION_SECRET --project-name=masterwahyan-dashboard
```

Use a long random value for `DASHBOARD_SESSION_SECRET`.

## Cloudflare Pages

- Project name: `masterwahyan-dashboard`
- Production branch: your private GitHub repo branch
- Build command: none
- Build output directory: `public`
- Custom domain: `dash.masterwahyan.com`

Keep this repository private. The authentication protects deployed files, but the source dashboard reports may still contain sensitive project information.
