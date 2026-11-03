# shellcheck shell=bash
#
# lib.sh — sourced by every scripts/ci/*.sh. The only place that knows where the version lives and
# what the build artifacts are called. Paths are relative to the repository root, which is where
# every CI step runs.
#
# The version lives ONLY in the extension manifest. The root package.json "version" (0.0.1) is not
# used by the build and is deliberately never read here.

SOURCE_MANIFEST="apps/dmarket-chrome-extension/src/manifest.json"
DIST_DIR="dist/apps/dmarket-chrome-extension"
MANIFEST_COPY="manifest.chrome.json"

# manifest_version [manifest.json] — the "version" field; defaults to the source manifest.
manifest_version() {
  node -p 'require(require("path").resolve(process.argv[1])).version' "${1:-$SOURCE_MANIFEST}"
}

# Artifact names, each taking the version.
store_zip_name() { printf 'dmarket-trust-shield-%s-chrome.zip' "$1"; }
unpacked_zip_name() { printf 'dmarket-trust-shield-%s-chrome-unpacked.zip' "$1"; }
dev_zip_name() { printf 'dmarket-trust-shield-%s-chrome-dev.zip' "$1"; }
crx_name() { printf 'dmarket-trust-shield-%s-chrome.crx' "$1"; }
