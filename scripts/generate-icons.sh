#!/usr/bin/env bash
# Generate full PNG icon set from public/icons/icon-source.svg
# Requires ImageMagick (magick) or rsvg-convert.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${ROOT}/frontend/public/icons/icon-source.svg"
MASKABLE="${ROOT}/frontend/public/icons/icon-maskable-source.svg"
OUT="${ROOT}/frontend/public/icons"
mkdir -p "$OUT"

if ! [[ -f "$SRC" ]]; then echo "missing $SRC"; exit 1; fi

if command -v magick >/dev/null 2>&1; then
  CONVERT="magick"
elif command -v rsvg-convert >/dev/null 2>&1; then
  CONVERT="rsvg"
else
  echo "install ImageMagick (brew install imagemagick) or librsvg (brew install librsvg)"
  exit 1
fi

render() {
  local in="$1" out="$2" size="$3"
  if [[ "$CONVERT" == "magick" ]]; then
    magick -background none -density 600 "$in" -resize "${size}x${size}" "$out"
  else
    rsvg-convert -w "$size" -h "$size" "$in" -o "$out"
  fi
  echo "  wrote $out (${size}x${size})"
}

# Standard
render "$SRC" "${OUT}/favicon-16.png"        16
render "$SRC" "${OUT}/favicon-32.png"        32
render "$SRC" "${OUT}/apple-touch-icon.png" 180
render "$SRC" "${OUT}/icon-192.png"         192
render "$SRC" "${OUT}/icon-512.png"         512

# Maskable
render "$MASKABLE" "${OUT}/icon-maskable-192.png" 192
render "$MASKABLE" "${OUT}/icon-maskable-512.png" 512

# OG default → public root
if [[ -f "${ROOT}/frontend/public/og-default.svg" ]]; then
  if [[ "$CONVERT" == "magick" ]]; then
    magick -background "#0A0A0F" -density 200 \
      "${ROOT}/frontend/public/og-default.svg" -resize 1200x630 \
      "${ROOT}/frontend/public/og-default.jpg"
  else
    rsvg-convert -w 1200 -h 630 "${ROOT}/frontend/public/og-default.svg" \
      -o "${ROOT}/frontend/public/og-default.png"
  fi
  echo "  wrote og-default"
fi

echo "done"
