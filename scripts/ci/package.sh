#!/usr/bin/env bash
#
# package.sh <production|development> — zips the nx build in dist/ into artifacts/ for the `build`
# job, after checking it with verify-build.mjs.
#
#   production   artifacts/<store zip>        the Chrome Web Store package: the build with the manifest
#                                             "key" removed (developers report the store refusing it;
#                                             a store item's id never comes from it)
#                artifacts/<unpacked zip>     the same build as-is, for Load unpacked with the right
#                                             extension id
#                artifacts/manifest.chrome.json  the store package's manifest, read by release.sh
#   development  artifacts/<dev zip>          sourcemaps and the localhost reload client included
#
# Names come from scripts/ci/lib.sh. Zips list their files in sorted order, without extra attributes.
set -euo pipefail

# shellcheck source=scripts/ci/lib.sh
. "$(dirname "$0")/lib.sh"

MODE="${1:-}"
case "$MODE" in
  production | development) ;;
  *)
    echo "usage: bash scripts/ci/package.sh <production|development>" >&2
    exit 2
    ;;
esac

if [ ! -d "$DIST_DIR" ]; then
  echo "ERROR: $DIST_DIR does not exist — run: pnpm nx run dmarket-chrome-extension:build:$MODE" >&2
  exit 1
fi
if ! command -v zip > /dev/null; then
  echo "ERROR: zip is not installed in this executor image." >&2
  exit 1
fi

VERSION="$(manifest_version)"
built="$(manifest_version "$DIST_DIR/manifest.json")"
if [ "$built" != "$VERSION" ]; then
  echo "ERROR: the build in $DIST_DIR is version $built, but $SOURCE_MANIFEST says $VERSION." >&2
  exit 1
fi

OUT="$PWD/artifacts"
mkdir -p "$OUT"

# zip_dir <dir> <name>
zip_dir() {
  rm -f "$OUT/$2"
  (cd "$1" && find . -type f | LC_ALL=C sort | zip -X -q -@ "$OUT/$2")
}

if [ "$MODE" = production ]; then
  store="$(store_zip_name "$VERSION")"
  unpacked="$(unpacked_zip_name "$VERSION")"

  stage="$(mktemp -d)"
  trap 'rm -rf "$stage"' EXIT
  cp -Rp "$DIST_DIR/." "$stage/"
  node -e '
    const fs = require("fs");
    const p = process.argv[1];
    const m = JSON.parse(fs.readFileSync(p, "utf8"));
    delete m.key;
    fs.writeFileSync(p, JSON.stringify(m, null, 2) + "\n");
  ' "$stage/manifest.json"
  # The rewrite gave the staged manifest a new mtime, which zip records; restoring the build's makes two
  # package runs over the same build produce a byte-identical store zip.
  touch -r "$DIST_DIR/manifest.json" "$stage/manifest.json"

  node scripts/ci/verify-build.mjs "$stage" --kind store
  zip_dir "$stage" "$store"
  node scripts/ci/verify-build.mjs "$DIST_DIR" --kind unpacked
  zip_dir "$DIST_DIR" "$unpacked"
  cp "$stage/manifest.json" "$OUT/$MANIFEST_COPY"
  (cd "$OUT" && sha256sum "$store" "$unpacked")
else
  dev="$(dev_zip_name "$VERSION")"
  node scripts/ci/verify-build.mjs "$DIST_DIR" --kind dev
  zip_dir "$DIST_DIR" "$dev"
  (cd "$OUT" && sha256sum "$dev")
fi
