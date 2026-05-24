#!/usr/bin/env bash
# Chrome ve Firefox için yüklemeye hazır .zip paketleri üretir → dist/
# Kullanım: ./build.sh
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p dist

# Pakete girecek ortak runtime dosyaları (docs/svg/.git HARİÇ)
SHARED=(auth.js background.js content.js options.html options.css options.js)
PNGS=(icons/icon16.png icons/icon32.png icons/icon48.png icons/icon128.png)

build() {
  local name="$1"
  local manifest="$2"
  local out="dist/yt2sheets-$name.zip"
  rm -f "$out"
  local stage; stage="$(mktemp -d)"
  mkdir -p "$stage/icons"
  cp "${SHARED[@]}" "$stage/"
  cp "${PNGS[@]}" "$stage/icons/"
  cp "$manifest" "$stage/manifest.json"
  (cd "$stage" && zip -qr - .) > "$out"
  rm -rf "$stage"
  echo "Built $out"
}

build chrome  manifest.json
build firefox manifest.firefox.json
