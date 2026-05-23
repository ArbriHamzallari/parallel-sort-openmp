# Parallel Sort Visualizer (Web)

Interactive sorting visualizer for **Bitonic**, **Sample (PSRS)**, and **Radix (LSD)** — plus classic comparison sorts. Static site: HTML, CSS, vanilla ES modules, Canvas, Web Audio.

## Run locally

ES modules require HTTP (not `file://`):

```bash
cd web
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000) for the **home page**, then pick an algorithm from the menu or cards.

Routes: `#/` (home), `#/bitonic`, `#/sample`, `#/radix`, and classic sorts (`#/bubble`, …).

## Deploy on Vercel (recommended)

The app is a **static site** with no build step. All paths are relative (`./src/...`, `./styles/...`).

### One-time setup

1. Push this repo to GitHub (the `web/` folder must be committed; `CLAUDE.md` is gitignored).
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
3. Click **Add New… → Project** and import `parallel-sort-openmp` (or your repo name).

### Project settings

| Setting | Value |
|--------|--------|
| **Framework Preset** | Other |
| **Root Directory** | `web` |
| **Build Command** | *(leave empty)* |
| **Output Directory** | `.` *(default when root is `web`)* |
| **Install Command** | *(leave empty)* |

4. Click **Deploy**.

Your site will be live at `https://<project-name>.vercel.app`. Hash routes work out of the box (`#/bitonic`, etc.).

### Optional: custom domain

In the Vercel project → **Settings → Domains**, add your domain and follow DNS instructions.

### Redeploy after changes

Push to `main`. If the repo is connected to Vercel, each push triggers a new deployment automatically.

## Deploy on GitHub Pages

1. Repository **Settings → Pages**.
2. Source: branch **`main`**, folder **`/web`**.
3. Site URL: `https://<user>.github.io/<repo>/`

## Structure

- `src/core/` — operation trace (`ops.js`), `player.js`, `renderer.js`, `audio.js`
- `src/algorithms/` — instrumented `run()` functions + `snippets/` for the code panel
- `src/ui/` — nav drawer, controls, landing page, implementations
- `vercel.json` — Vercel static config (no build)

## Verify sorts (Node)

```bash
cd web
node src/verify.mjs
```

After playing an animation, the browser console warns if the final array does not match the sorted snapshot.
