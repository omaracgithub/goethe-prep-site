#!/usr/bin/env bash
# Bundle a site for deployment. Usage: ./scripts/bundle-site.sh [main|a1|a2|b1|b2|c1|c2]
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="${1:-main}"
OUT="$ROOT/dist/$TARGET"

rm -rf "$OUT"
mkdir -p "$OUT"

cp -R "$ROOT/css" "$ROOT/js" "$OUT/"

if [[ "$TARGET" == "main" ]]; then
  cp "$ROOT/index.html" "$OUT/"
  cp -R "$ROOT/blog" "$OUT/"
  cp "$ROOT/CNAME" "$OUT/" 2>/dev/null || true
  cp "$ROOT/robots.txt" "$ROOT/sitemap.xml" "$ROOT/llms.txt" "$OUT/" 2>/dev/null || true
else
  cp -R "$ROOT/sites/$TARGET/"* "$OUT/"
  cp "$ROOT/robots.txt" "$OUT/" 2>/dev/null || true
  # Rewrite monorepo-relative paths → deployment root
  while IFS= read -r -d '' f; do
    sed -i '' \
      -e 's|../../css/|css/|g' \
      -e 's|../../../css/|css/|g' \
      -e 's|../../js/|js/|g' \
      -e 's|../../../js/|js/|g' \
      "$f"
  done < <(find "$OUT" -name '*.html' -print0)
fi

echo "Bundled $TARGET → dist/$TARGET/"
echo "Deploy the contents of dist/$TARGET/ to your host."
