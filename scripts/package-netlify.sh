#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/netlify-upload"
ZIP="$ROOT/netlify-upload.zip"

cd "$ROOT"
rm -rf "$OUT" "$ZIP"
mkdir -p "$OUT"

# On Netlify's build servers LOVABLE_SANDBOX is not set, so the netlify preset is used.
# Inside the Lovable preview sandbox this line will still produce a cloudflare bundle,
# so use this script mainly to collect source/config files for Git/CLI deploy.
if [[ "${LOVABLE_SANDBOX:-}" == "1" || -n "${DEV_SERVER__PROJECT_PATH:-}" ]]; then
  env -u LOVABLE_SANDBOX -u DEV_SERVER__PROJECT_PATH bun run build:netlify || true
else
  bun run build:netlify
fi

# If the build succeeded outside the sandbox, package the Netlify output.
if [[ -d "$ROOT/dist" ]]; then
  cp -R "$ROOT/dist" "$OUT/dist"
fi
if [[ -d "$ROOT/.netlify" ]]; then
  cp -R "$ROOT/.netlify" "$OUT/.netlify"
fi

cp package.json "$OUT/package.json"
cp netlify.toml "$OUT/netlify.toml"
cp vite.netlify.config.ts "$OUT/vite.netlify.config.ts"
cp NETLIFY-DEPLOYMENT.md "$OUT/NETLIFY-DEPLOYMENT.md"

python3 - <<'PY'
from pathlib import Path
import zipfile

root = Path.cwd()
source = root / "netlify-upload"
target = root / "netlify-upload.zip"
with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as archive:
    for path in source.rglob("*"):
        if path.is_file():
            archive.write(path, path.relative_to(source))
print(target)
PY
