#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/hostinger-upload"
ZIP="$ROOT/hostinger-upload.zip"

cd "$ROOT"
rm -rf "$OUT" "$ZIP"
mkdir -p "$OUT"

# The Lovable preview sandbox forces its own Cloudflare target. Hostinger and
# normal local machines are not sandboxed, so this produces the Node preset.
if [[ "${LOVABLE_SANDBOX:-}" == "1" || -n "${DEV_SERVER__PROJECT_PATH:-}" ]]; then
  env -u LOVABLE_SANDBOX -u DEV_SERVER__PROJECT_PATH bun run build
else
  bun run build
fi

cp -R .output "$OUT/.output"
cp package.json "$OUT/package.json"
cp HOSTINGER-DEPLOYMENT.md "$OUT/HOSTINGER-DEPLOYMENT.md"

python3 - <<'PY'
from pathlib import Path
import zipfile

root = Path.cwd()
source = root / "hostinger-upload"
target = root / "hostinger-upload.zip"
with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as archive:
    for path in source.rglob("*"):
        if path.is_file():
            archive.write(path, path.relative_to(source))
print(target)
PY