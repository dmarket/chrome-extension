#!/usr/bin/env bash
#
# pack-crx.sh <verify|pack|attach> — the three steps of the CircleCI `pack_crx` job.
#
# Signs the store zip that `build-prod` produced IN THIS PIPELINE (taken from the workspace, never
# re-downloaded) into a CRX3 with the Verified-CRX-Uploads key, and attaches the .crx to the GitHub
# Release `release` just published. The signed file is handed to `upload_to_store` through the
# workspace (artifacts/store/).
#
# Integrity: `verify` downloads the store zip and SHA256SUMS the Release carries, checks the zip
# against that SHA256SUMS, and refuses to continue unless the zip's sha256 also equals the workspace
# zip's. What gets signed is therefore byte-for-byte what was built, verified and published. Nothing
# is re-zipped. `attach` extends only a SHA256SUMS that passed that check.
#
# Called as `bash scripts/ci/pack-crx.sh <step>` from .circleci/config.yml, one CircleCI step per
# subcommand. Each step re-runs this file from scratch, so the version is recomputed every time; the
# downloads in $WORK survive between steps of the same job.
#
# Environment:
#   REPO_SLUG            owner/repo (set by the executor in .circleci/config.yml)
#   GITHUB_TOKEN         contents:write — read the Release, attach the .crx (context org-global)
#   CRX_SIGNING_KEY_B64  base64 of the RSA private key PEM registered under Package -> Verified CRX
#                        Uploads (a CircleCI project environment variable). Never printed.
set -euo pipefail

# shellcheck source=scripts/ci/lib.sh
. "$(dirname "$0")/lib.sh"

CMD="${1:-}"
: "${REPO_SLUG:?REPO_SLUG must be set (the CircleCI executor sets it)}"

API="https://api.github.com/repos/${REPO_SLUG}"
AUTH="Authorization: Bearer ${GITHUB_TOKEN:-}"
# Downloads and the unpacked tree; outside the checkout so nothing lands in the repository.
WORK="${WORK:-/tmp/deploy}"
# Staged for `store_artifacts` and `persist_to_workspace`; relative, because the workspace root is `.`.
STORE_DIR="artifacts/store"

VERSION="$(manifest_version)"
TAG="v$VERSION"
ZIP="$(store_zip_name "$VERSION")"
CRX="$(crx_name "$VERSION")"

# ── verify ────────────────────────────────────────────────────────────────────────────────────────
verify() {
  : "${GITHUB_TOKEN:?GITHUB_TOKEN must be set (org-wide context org-global)}"

  # Checked by name only; the value is never printed anywhere in this file.
  if [ -z "${CRX_SIGNING_KEY_B64:-}" ]; then
    echo "ERROR: missing environment: CRX_SIGNING_KEY_B64 — set it in CircleCI Project Settings ->" >&2
    echo "       Environment Variables (see the header of .circleci/config.yml)." >&2
    return 1
  fi
  if [ ! -f "artifacts/$ZIP" ]; then
    echo "ERROR: artifacts/$ZIP is missing — the build-prod workspace was not attached." >&2
    return 1
  fi
  if ! command -v unzip > /dev/null; then
    echo "ERROR: unzip is not installed in this executor image — needed to check the package before signing." >&2
    return 1
  fi

  rm -rf "$WORK"
  mkdir -p "$WORK" "$STORE_DIR"

  curl -sSf -H "$AUTH" "$API/releases/tags/$TAG" > "$WORK/release.json"
  # The zip (to compare) and SHA256SUMS (which `attach` extends), by asset id. Named explicitly so a
  # file that appears on the Release for any other reason cannot be pulled in.
  node -e '
    const r = require(process.argv[1]);
    const lines = [];
    for (const name of [process.argv[2], "SHA256SUMS"]) {
      const a = (r.assets ?? []).find((x) => x.name === name);
      if (!a) {
        console.error(`ERROR: release ${r.tag_name} has no asset "${name}".`);
        process.exit(1);
      }
      lines.push(`${a.id} ${a.name}`);
    }
    require("fs").writeFileSync(process.argv[3], lines.join("\n") + "\n");
  ' "$WORK/release.json" "$ZIP" "$WORK/assets.txt"

  while read -r ID NAME; do
    curl -sSfL -H "$AUTH" -H "Accept: application/octet-stream" "$API/releases/assets/$ID" -o "$WORK/$NAME"
  done < "$WORK/assets.txt"

  # The Release's own checksums, before anything on it is trusted. --ignore-missing: only the zip is
  # downloaded, and sha256sum still fails when none of the listed files is present.
  if ! (cd "$WORK" && sha256sum -c --ignore-missing SHA256SUMS); then
    echo "ERROR: the $ZIP on Release $TAG does not match the Release's own SHA256SUMS. Refusing to" >&2
    echo "       sign it." >&2
    return 1
  fi

  local released built
  released="$(sha256sum "$WORK/$ZIP" | cut -d' ' -f1)"
  built="$(sha256sum "artifacts/$ZIP" | cut -d' ' -f1)"
  if [ "$released" != "$built" ]; then
    echo "ERROR: the $ZIP on Release $TAG (sha256 $released) is not the one this pipeline built" >&2
    echo "       (sha256 $built). Refusing to sign it." >&2
    echo "       The Release was published by another workflow's build. Rerun THAT workflow with" >&2
    echo "       \"Rerun workflow from failed\": only its build matches. Rerunning this one cannot." >&2
    return 1
  fi
  echo "Release $TAG carries the zip this pipeline built (sha256 $built)."

  rm -rf "$WORK/unpacked"
  unzip -q "artifacts/$ZIP" -d "$WORK/unpacked"
  node scripts/ci/verify-build.mjs "$WORK/unpacked" --kind store

  # upload-to-store.sh reads both; with no prerelease suffix in a Chrome version they are the same.
  printf '%s\n' "$VERSION" > "$STORE_DIR/VERSION"
  printf '%s\n' "$VERSION" > "$STORE_DIR/RELEASE_VERSION"
  # Marks this run's download as checked; `attach` extends no SHA256SUMS without it.
  touch "$WORK/SHA256SUMS.checked"
  echo "Package verified. Version $VERSION (tag $TAG)."
}

# ── pack ──────────────────────────────────────────────────────────────────────────────────────────
pack() {
  mkdir -p "$STORE_DIR"
  node scripts/ci/pack-crx.mjs pack "artifacts/$ZIP" "$STORE_DIR/$CRX"
  node scripts/ci/pack-crx.mjs verify "$STORE_DIR/$CRX"
  # Checksums over what the upload job will send, so the two jobs can be compared in their logs.
  (cd "$STORE_DIR" && sha256sum "$CRX" VERSION RELEASE_VERSION > SHA256SUMS)
  cat "$STORE_DIR/SHA256SUMS"
}

# ── attach ────────────────────────────────────────────────────────────────────────────────────────
attach() {
  : "${GITHUB_TOKEN:?GITHUB_TOKEN must be set (org-wide context org-global)}"

  # Nothing is attached, and no SHA256SUMS extended, unless `verify` succeeded in this job.
  if [ ! -f "$WORK/SHA256SUMS.checked" ]; then
    echo "ERROR: $WORK/SHA256SUMS was not checked by a successful \`verify\` in this job." >&2
    return 1
  fi

  # The release id, whether the .crx is already there, and the SHA256SUMS asset id — one pass over the
  # payload `verify` downloaded. The two writes below are INDEPENDENTLY idempotent, so a run that
  # attached the .crx and then died still fixes the checksums when it is re-run.
  node -e '
    const r = require(process.argv[1]);
    const assets = r.assets ?? [];
    const sums = assets.find((a) => a.name === "SHA256SUMS");
    process.stdout.write(
      `${r.id ?? ""}\n${assets.some((a) => a.name === process.argv[2]) ? "yes" : "no"}\n${sums?.id ?? ""}\n`,
    );
  ' "$WORK/release.json" "$CRX" > "$WORK/attach.txt"
  local release_id crx_attached sums_id
  release_id="$(sed -n 1p "$WORK/attach.txt")"
  crx_attached="$(sed -n 2p "$WORK/attach.txt")"
  sums_id="$(sed -n 3p "$WORK/attach.txt")"

  if [ -z "$release_id" ]; then
    echo "ERROR: could not read the release id from $WORK/release.json." >&2
    return 1
  fi

  if [ "$crx_attached" = "yes" ]; then
    echo "$CRX is already attached to $TAG — leaving it alone."
  else
    echo "Uploading ${CRX}…"
    curl -sSf -X POST -H "$AUTH" -H "Content-Type: application/octet-stream" \
      --data-binary @"$STORE_DIR/$CRX" \
      "https://uploads.github.com/repos/${REPO_SLUG}/releases/${release_id}/assets?name=${CRX}" \
      -o /dev/null
    echo "Attached $CRX to https://github.com/${REPO_SLUG}/releases/tag/${TAG}"
  fi

  cover_crx_in_checksums "$release_id" "$sums_id"
}

# The Release's SHA256SUMS is written by release.sh before this job runs, so it cannot cover the .crx.
# GitHub cannot append to an asset, so the old one is deleted and a new one uploaded under the same
# name. A partial run leaves the Release without SHA256SUMS, which makes `verify` fail loudly on the
# next run rather than quietly producing a release nobody can verify.
cover_crx_in_checksums() {
  local release_id="$1" sums_id="$2"

  if [ -z "$sums_id" ]; then
    # Unreachable in practice — `verify` requires SHA256SUMS — so this is a guard, not a path.
    echo "WARNING: $TAG has no SHA256SUMS asset; leaving checksums alone." >&2
    return 0
  fi

  # $WORK/SHA256SUMS is the Release's own file as downloaded by `verify` this run, so on a re-run it
  # already carries the line and this is the whole idempotency check.
  if grep -qF -- "  $CRX" "$WORK/SHA256SUMS"; then
    echo "SHA256SUMS already covers $CRX — leaving it alone."
    return 0
  fi

  # Computed from the uploaded file, not copied from $STORE_DIR/SHA256SUMS: that one also covers
  # VERSION and RELEASE_VERSION, which are workspace plumbing, not Release assets.
  cp "$WORK/SHA256SUMS" "$WORK/SHA256SUMS.new"
  (cd "$STORE_DIR" && sha256sum "$CRX") >> "$WORK/SHA256SUMS.new"

  curl -sSf -X DELETE -H "$AUTH" "$API/releases/assets/$sums_id" -o /dev/null
  curl -sSf -X POST -H "$AUTH" -H "Content-Type: application/octet-stream" \
    --data-binary @"$WORK/SHA256SUMS.new" \
    "https://uploads.github.com/repos/${REPO_SLUG}/releases/${release_id}/assets?name=SHA256SUMS" \
    -o /dev/null
  echo "SHA256SUMS updated to cover $CRX:"
  sed 's/^/  /' "$WORK/SHA256SUMS.new"
}

case "$CMD" in
  verify) verify ;;
  pack) pack ;;
  attach) attach ;;
  *)
    echo "usage: bash scripts/ci/pack-crx.sh <verify|pack|attach>" >&2
    exit 2
    ;;
esac
