# AGENTS.md

## What this is

A browser FPS prototype (Vite + three.js) built from an empty repo. No backend, no
database, no external services, and therefore no secrets.

## Running it

```bash
docker compose -f docker-compose.base44.yml up -d
```

The single `web` service runs `npm ci` into the `node_modules` named volume, then
`npm run dev` — Vite on port 3000, bind-mounted from the repo so edits hot-reload.
`package-lock.json` is committed and is the source of truth for versions; if you add
a dependency, regenerate the lockfile before starting the stack:

```bash
docker run --rm -v "$PWD":/app -w /app node:22 npm install --package-lock-only <pkg>
```

## Sandbox specifics

- `vite.config.js` only adds the external host/HMR settings when
  `BASE44_PREVIEW_MODE === "1"`. With the flag unset the stock Vite config applies.
  The allowed host is `.${BASE44_SANDBOX_HOST_DOMAIN}` (wildcard, because the sandbox
  host id changes), and HMR's client port is pinned to 443 for the https preview proxy.
- Those variables are passed through from compose `environment:` as bare names — never
  hardcode resolved `BASE44_*` values into files.

## How to verify

```bash
curl -s http://localhost:3000/ | head          # should return index.html
docker compose -f docker-compose.base44.yml ps # web should be healthy
```

In the browser: click **Click to play** to capture the pointer, WASD to move, left
click to fire at the glowing targets; score increments in the top-left HUD.
