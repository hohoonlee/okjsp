#!/bin/bash
cd "$(dirname "$0")/.."

VERSION=$(grep '"version"' manifest.json | head -1 | sed 's/.*"\([0-9.]*\)".*/\1/')
OUTPUT="output/okjsp.${VERSION}.zip"

mkdir -p output

rm -f "$OUTPUT"

zip -r "$OUTPUT" \
  manifest.json \
  background.js \
  content-script.js \
  data/popup.html \
  data/popup.js \
  data/icon.png \
  data/16.png \
  data/32.png \
  data/64.png \
  data/128.png \
  data/256.png \
  data/512.png \
  lib/jquery/jquery.js

echo "Built: $OUTPUT"
