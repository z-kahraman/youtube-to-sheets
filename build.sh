#!/usr/bin/env bash
# Chrome ve Firefox için yüklemeye hazır .zip paketleri üretir → dist/
#   yt2sheets-chrome.zip       Chrome Web Store / Load unpacked
#   yt2sheets-firefox.zip      AMO (addons.mozilla.org) için: Fx 140+ / Android 142+
#                              → data_collection_permissions uyarısı çıkmaz
#   yt2sheets-firefox-dev.zip  Lokal "Load Temporary Add-on" için: strict_min_version=115
#                              (eski Firefox sürümlerinde de yüklenir; AMO kabul etmez)
# Kullanım: ./build.sh
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p dist

# Pakete girecek ortak runtime dosyaları (docs/svg/.git HARİÇ)
SHARED=(auth.js strings.js background.js content.js options.html options.css options.js)
PNGS=(icons/icon16.png icons/icon32.png icons/icon48.png icons/icon128.png)

build() {
  local name="$1"
  local manifest="$2"
  local variant="${3:-prod}"   # prod | dev (yalnız firefox-dev için)
  local out="dist/yt2sheets-$name.zip"
  rm -f "$out"
  local stage; stage="$(mktemp -d)"
  mkdir -p "$stage/icons"
  cp "${SHARED[@]}" "$stage/"
  cp "${PNGS[@]}" "$stage/icons/"
  cp "$manifest" "$stage/manifest.json"
  if [[ "$variant" == "dev" ]]; then
    # AMO-uyumlu manifest (Fx 140 / Android 142) lokal `about:debugging` için
    # eski Firefox'lara da uysun diye strict_min_version'ı 115'e indir, gecko_android'i
    # kaldır. data_collection_permissions Fx 140+'ta etkindir; eski sürüm sessizce yok sayar.
    python3 - "$stage/manifest.json" <<'PY'
import json, sys
p = sys.argv[1]
m = json.load(open(p))
m["browser_specific_settings"]["gecko"]["strict_min_version"] = "115.0"
m["browser_specific_settings"].pop("gecko_android", None)
with open(p, "w") as f:
    json.dump(m, f, indent=2)
    f.write("\n")
PY
  fi
  (cd "$stage" && zip -qr - .) > "$out"
  rm -rf "$stage"
  echo "Built $out"
}

build chrome      manifest.json
build firefox     manifest.firefox.json
build firefox-dev manifest.firefox.json dev
