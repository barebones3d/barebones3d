#!/usr/bin/env bash
# scripts/sync-r2-stls.sh
# Scans ./cad_staging/*.stl and uploads verified models to Cloudflare R2: barebones3d-assets/parts/
set -euo pipefail

STAGING_DIR="./cad_staging"
R2_BUCKET="barebones3d-assets"
R2_PREFIX="parts"

echo "=== Barebones 3D R2 STL Upload Pipeline ==="
echo "Scanning staging directory: ${STAGING_DIR}"

if [ ! -d "${STAGING_DIR}" ]; then
  echo "Error: Directory ${STAGING_DIR} does not exist."
  exit 1
fi

shopt -s nullglob
files=("${STAGING_DIR}"/*.stl)
shopt -u nullglob

if [ ${#files[@]} -eq 0 ]; then
  echo "No .stl files found in ${STAGING_DIR}. Exiting cleanly."
  exit 0
fi

uploaded=0
skipped=0

for filepath in "${files[@]}"; do
  filename=$(basename "${filepath}")
  
  # Check if file exists and is not empty (size > 0 bytes)
  if [ ! -f "${filepath}" ]; then
    echo "Skipping non-regular file: ${filename}"
    skipped=$((skipped + 1))
    continue
  fi

  filesize=$(wc -c < "${filepath}" | tr -d ' ')
  if [ "${filesize}" -le 84 ]; then
    echo "Skipping empty or degenerate file (< 84 bytes): ${filename} (${filesize} bytes)"
    skipped=$((skipped + 1))
    continue
  fi

  echo "Uploading ${filename} (${filesize} bytes) -> ${R2_BUCKET}/${R2_PREFIX}/${filename}..."
  if npx wrangler r2 object put "${R2_BUCKET}/${R2_PREFIX}/${filename}" --file="${filepath}"; then
    echo "✓ Successfully uploaded ${filename}"
    uploaded=$((uploaded + 1))
  else
    echo "✗ Failed to upload ${filename}"
  fi
done

echo "-------------------------------------------"
echo "Pipeline complete. Uploaded: ${uploaded}, Skipped: ${skipped}."
