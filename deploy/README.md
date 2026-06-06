# Deploying GoethePrep (multi-subdomain)

Placeholder domain: **goetheprep.com** — update `site.config.json` and CNAME files when your domain is confirmed.

## Site structure

```
goetheprep.com          → repo root (index.html, blog/, css/, js/)
a1.goetheprep.com       → sites/a1/ (+ shared css/js)
a2.goetheprep.com       → sites/a2/
b1.goetheprep.com       → sites/b1/
...
```

Each level folder contains a `CNAME` file (e.g. `b1.goetheprep.com`).

## Option A — GitHub Pages (recommended: one repo, seven deployments)

GitHub Pages supports **one custom domain per repository**. For seven subdomains you have two common patterns:

### Pattern 1: Separate repos (simplest)

1. Create repos: `prepgoethe`, `prepgoethe-a1`, … `prepgoethe-c2`
2. Bundle each site with the script:

   ```bash
   ./scripts/bundle-site.sh main   # → dist/main/
   ./scripts/bundle-site.sh b1    # → dist/b1/
   ```

3. Push `dist/main/` contents to `prepgoethe` repo → enable Pages → custom domain `goetheprep.com`
4. Push `dist/b1/` to `prepgoethe-b1` → custom domain `b1.goetheprep.com`
5. Repeat for a1, a2, b2, c1, c2

### Pattern 2: Monorepo + GitHub Actions

Use a workflow that deploys each `sites/{level}/` folder to a separate `gh-pages` branch or external host (Cloudflare Pages, Netlify) with per-subdomain projects.

## DNS setup

At your registrar (for each subdomain):

| Type  | Name | Value                |
|-------|------|----------------------|
| A     | @    | GitHub Pages IPs*    |
| CNAME | a1   | your-username.github.io |
| CNAME | b1   | your-username.github.io |
| …     | …    | …                    |

\* Or CNAME `www` / apex to GitHub — see [GitHub Pages custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).

Each deployment repo needs a `CNAME` file in the published root matching that subdomain.

## Bundle script

```bash
chmod +x scripts/bundle-site.sh
./scripts/bundle-site.sh main    # goetheprep.com
./scripts/bundle-site.sh b1      # b1.goetheprep.com
```

Output in `dist/{name}/` — ready to push to hosting.

## After content changes

1. Edit main site / blog / `site.config.json`
2. Regenerate level sites: `python3 scripts/generate-level-sites.py`
3. Re-bundle and redeploy each changed site

## Local preview

- Main: open `index.html`
- B1 site: open `sites/b1/index.html`
- Paths use `../../css/` so assets load from the monorepo root
