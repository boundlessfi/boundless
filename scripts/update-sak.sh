#!/usr/bin/env bash
#
# Rebuild + re-vendor smart-account-kit + smart-account-kit-bindings.
#
# Run this whenever you want to pick up new commits from the SAK upstream.
# Assumes the SAK repo is cloned as a sibling: ../smart-account-kit
#
# Why this exists: smart-account-kit is consumed as a vendored tgz committed
# under ./vendor/ so production deploys (Railway, CI, anywhere) have no need
# for a sibling-repo checkout. See ./vendor/README.md.
#
# Usage:
#   ./scripts/update-sak.sh           # pulls latest main from upstream, rebuilds, vendors
#   ./scripts/update-sak.sh --no-pull # skip git pull (use whatever's checked out locally)

set -euo pipefail

THIS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BOUNDLESS_ROOT="$(cd "$THIS_DIR/.." && pwd)"
SAK_ROOT="$(cd "$BOUNDLESS_ROOT/../smart-account-kit" && pwd)"
VENDOR_DIR="$BOUNDLESS_ROOT/vendor"

NO_PULL=false
for arg in "$@"; do
  case "$arg" in
    --no-pull) NO_PULL=true ;;
    *) echo "Unknown arg: $arg" >&2; exit 1 ;;
  esac
done

if [ ! -d "$SAK_ROOT" ]; then
  echo "ERROR: SAK repo not found at $SAK_ROOT" >&2
  echo "       Clone it as a sibling: git clone <url> ../smart-account-kit" >&2
  exit 1
fi

echo "▸ SAK source:     $SAK_ROOT"
echo "▸ Boundless root: $BOUNDLESS_ROOT"
echo "▸ Vendor dir:     $VENDOR_DIR"
echo

cd "$SAK_ROOT"

if [ "$NO_PULL" = false ]; then
  echo "▸ Pulling latest main from SAK upstream"
  git checkout main
  git pull --ff-only
fi

echo "▸ Installing SAK dependencies"
pnpm install --frozen-lockfile

echo "▸ Building SAK + bindings"
pnpm build

echo "▸ Packing SAK (uses pnpm pack to resolve workspace: refs)"
rm -f smart-account-kit-*.tgz
pnpm pack >/dev/null

echo "▸ Packing bindings"
cd packages/smart-account-kit-bindings
rm -f smart-account-kit-bindings-*.tgz
pnpm pack >/dev/null
cd "$SAK_ROOT"

SAK_TGZ=$(ls smart-account-kit-*.tgz | head -1)
BINDINGS_TGZ="packages/smart-account-kit-bindings/$(ls packages/smart-account-kit-bindings/smart-account-kit-bindings-*.tgz | head -1 | xargs basename)"

if [ -z "$SAK_TGZ" ] || [ -z "$BINDINGS_TGZ" ]; then
  echo "ERROR: pack failed to produce tgz files" >&2
  exit 1
fi

mkdir -p "$VENDOR_DIR"

echo "▸ Copying tgz files into vendor/"
rm -f "$VENDOR_DIR"/smart-account-kit-*.tgz \
      "$VENDOR_DIR"/smart-account-kit-bindings-*.tgz
cp "$SAK_TGZ" "$VENDOR_DIR/"
cp "$BINDINGS_TGZ" "$VENDOR_DIR/"

NEW_SAK_NAME=$(basename "$SAK_TGZ")
NEW_BINDINGS_NAME=$(basename "$BINDINGS_TGZ")

echo "▸ Updating package.json references (if version changed)"
cd "$BOUNDLESS_ROOT"
# Use node to do a safe in-place edit (preserves formatting)
node -e "
  const fs = require('fs');
  const path = 'package.json';
  const pkg = JSON.parse(fs.readFileSync(path, 'utf8'));
  pkg.dependencies['smart-account-kit'] = 'file:./vendor/$NEW_SAK_NAME';
  pkg.dependencies['smart-account-kit-bindings'] = 'file:./vendor/$NEW_BINDINGS_NAME';
  fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + '\n');
"

echo "▸ Reinstalling in boundless"
rm -rf node_modules/smart-account-kit node_modules/smart-account-kit-bindings \
       node_modules/.cache .next
npm install

echo
echo "✓ Done. Vendored:"
ls -lh "$VENDOR_DIR"/*.tgz
echo
echo "Next steps:"
echo "  git add vendor/ package.json package-lock.json"
echo "  git commit -m 'chore: bump vendored smart-account-kit'"
echo "  npm run dev   # verify locally"
