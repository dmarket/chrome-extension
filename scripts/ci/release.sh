#!/usr/bin/env bash
#
# release.sh <resolve|guard|tag|publish> — the four steps of the CircleCI `release` job.
#
# Called as `bash scripts/ci/release.sh <step>` from .circleci/config.yml, one CircleCI step per
# subcommand so each shows up separately in the UI. The logic lives here rather than inline in the
# YAML because CircleCI caps a single config expression at 2048 characters, a YAML block scalar
# re-indents heredocs and hides quoting bugs that only surface at run time, and a real file can be
# executed and reviewed as shell — `bash scripts/ci/release.sh guard` runs standalone.
#
# CONTRACT: every step exits 0 when there is simply nothing to release, and non-zero only for a
# real mistake. `resolve` decides which case this is and exports RELEASE=true|false through
# $BASH_ENV; the other three no-op when it is false. $BASH_ENV is per job, so `resolve` also writes
# the decision to artifacts/release/RELEASE, which the job persists to the workspace; every later job
# in the workflow starts with `halt_unless_releasing`, so a skip leaves the whole workflow green and a
# branch whose push released nothing is kept.
#
# RESUMING: a tag that already exists on THIS commit means an earlier run tagged it and then failed
# before its GitHub Release was complete. `resolve` then releases again, `tag` does nothing, and
# `publish` reuses the existing Release and uploads only the assets it does not carry yet — after
# checking that every asset already there is byte-identical to this workflow's build. A rebuilt
# workspace (Rerun from start, a new push) never matches, so that check fails before any upload.
#
# Environment:
#   REPO_SLUG      owner/repo (set by the executor in .circleci/config.yml)
#   GITHUB_TOKEN   contents:write — needed by `tag` and `publish` only (context org-global)
#   CIRCLE_BRANCH  the release branch; must be exactly release/v<manifest version>
#   BASH_ENV       CircleCI's per-job env file, sourced before every step
set -euo pipefail

# shellcheck source=scripts/ci/lib.sh
. "$(dirname "$0")/lib.sh"

CMD="${1:-}"
: "${REPO_SLUG:?REPO_SLUG must be set (the CircleCI executor sets it)}"
: "${BASH_ENV:=/tmp/bash_env}"

API="https://api.github.com/repos/${REPO_SLUG}"

# True when `resolve` decided this push is a release. Anything else is a clean no-op.
releasing() { [ "${RELEASE:-false}" = "true" ]; }
skip() { echo "Not releasing — skipped."; }

# The decision file the later jobs read (see CONTRACT above).
DECISION_FILE="artifacts/release/RELEASE"
# Where get_release stores the last Release it fetched.
RELEASE_JSON="/tmp/release-get.json"

# has_line <lines> <line> — true when <line> is one of the newline-separated <lines>.
has_line() {
  case $'\n'"$1"$'\n' in *$'\n'"$2"$'\n'*) return 0 ;; esac
  return 1
}

# remote_tag_commit <tag> — the commit the remote tag points at, peeled for an annotated tag; empty
# when the tag does not exist. Fails when the remote cannot be asked, so that is never read as "absent".
remote_tag_commit() {
  local sha
  sha="$(git ls-remote origin "refs/tags/$1^{}")" || return 1
  [ -n "$sha" ] || sha="$(git ls-remote origin "refs/tags/$1")" || return 1
  printf '%s' "${sha%%[[:space:]]*}"
}

# get_release <tag> — GET the Release for <tag> into $RELEASE_JSON; echoes the HTTP status (000 when
# GitHub was unreachable).
get_release() {
  local code
  code="$(curl -sS -o "$RELEASE_JSON" -w '%{http_code}' -H "$AUTH" "$API/releases/tags/$1" || true)"
  printf '%s' "${code:-000}"
}

# release_summary — the id of the Release in $RELEASE_JSON on the first line, then its asset names.
release_summary() {
  node -e '
    const r = require(process.argv[1]);
    process.stdout.write([r.id ?? "", ...(r.assets ?? []).map((a) => a.name)].join("\n") + "\n");
  ' "$RELEASE_JSON"
}

# release_state <tag> <version> — echoes "complete" or "incomplete" (no Release, or an asset missing).
release_state() {
  local code names name
  code="$(get_release "$1")"
  case "$code" in
    404)
      echo incomplete
      return 0
      ;;
    200) ;;
    *)
      echo "ERROR: could not read the GitHub Release for $1 (HTTP $code)." >&2
      return 1
      ;;
  esac
  # Only fully uploaded assets count; `publish` reports any other state as an error to clean up.
  names="$(node -e '
    const r = require(process.argv[1]);
    const up = (r.assets ?? []).filter((a) => a.state === "uploaded");
    process.stdout.write(up.map((a) => a.name).join("\n"));
  ' "$RELEASE_JSON")" || return 1
  # The assets `publish` uploads; the .crx pack-crx.sh adds later is not part of it.
  for name in "$(store_zip_name "$2")" "$MANIFEST_COPY" SHA256SUMS; do
    has_line "$names" "$name" || {
      echo incomplete
      return 0
    }
  done
  echo complete
}

# ── resolve ───────────────────────────────────────────────────────────────────────────────────────
resolve() {
  local version tag release messages
  version="$(manifest_version)"
  tag="v$version"
  release=true

  # The branch name is the human-visible declaration of what is being released; the manifest is what
  # drives the tag and the zip names. If they disagree, one of the two is a mistake. A HARD failure,
  # unlike the skips below: this is an error to fix, not a "nothing to release" state.
  if [ "${CIRCLE_BRANCH:-}" != "release/v$version" ]; then
    echo "ERROR: branch '${CIRCLE_BRANCH:-}' is not release/v$version, the version in $SOURCE_MANIFEST." >&2
    echo "       Rename the branch or fix \"version\" in the manifest — they must be the same." >&2
    return 1
  fi

  # Opt-out: "[skip release]" in the commit message. A true merge commit's own message is
  # boilerplate ("Merge pull request #12 ..."), so the flag lives on the commits merged in.
  messages="$(git log -1 --pretty=%B HEAD)"
  if git rev-parse --verify -q 'HEAD^2' > /dev/null 2>&1; then
    messages="$messages
$(git log --pretty=%B 'HEAD^1..HEAD^2')"
  fi
  if printf '%s' "$messages" |
    grep -Eiq '\[[[:space:]]*(skip[[:space:]_-]*release|release[[:space:]_-]*skip)[[:space:]]*\]'; then
    echo "Skipping: commit message contains [skip release]."
    release=false
  fi

  # Idempotency / "the version was not bumped": ask the remote, not the local ref store, so a lost
  # race with a parallel pipeline is also caught. A tag on THIS commit is an earlier run of this
  # release; it resumes when that run died before its GitHub Release was complete.
  local tag_commit state
  if [ "$release" = "true" ]; then
    tag_commit="$(remote_tag_commit "$tag")" || {
      echo "ERROR: could not ask the remote whether $tag exists." >&2
      return 1
    }
    if [ -n "$tag_commit" ] && [ "$tag_commit" != "$(git rev-parse HEAD)" ]; then
      echo "Nothing to release: $tag already exists. Bump \"version\" in $SOURCE_MANIFEST to cut a release."
      release=false
    elif [ -n "$tag_commit" ]; then
      : "${GITHUB_TOKEN:?GITHUB_TOKEN must be set (org-wide context org-global)}"
      state="$(release_state "$tag" "$version")" || return 1
      if [ "$state" = "incomplete" ]; then
        echo "Resuming $tag: the tag is on this commit but its GitHub Release is incomplete."
      else
        echo "Nothing to release: $tag is on this commit and its GitHub Release is complete. A failed"
        echo "store step is retried with CircleCI's \"Rerun workflow from failed\" on that pipeline."
        release=false
      fi
    fi
  fi

  mkdir -p "$(dirname "$DECISION_FILE")"
  printf '%s\n' "$release" > "$DECISION_FILE"
  {
    echo "export VERSION='$version'"
    echo "export TAG='$tag'"
    echo "export RELEASE='$release'"
  } >> "$BASH_ENV"
  echo "version=$version tag=$tag release=$release"
}

# ── guard ─────────────────────────────────────────────────────────────────────────────────────────
guard() {
  releasing || { skip; return 0; }

  # A release without notes is a release nobody can read later. Dots escaped: 1.0.4 must not match 1x0x4.
  local v_re="${VERSION//./\\.}"
  if ! grep -qE "^## \[$v_re\]" CHANGELOG.md; then
    echo "ERROR: CHANGELOG.md has no '## [$VERSION]' section for this release." >&2
    return 1
  fi

  local name
  for name in "$(store_zip_name "$VERSION")" "$MANIFEST_COPY"; do
    if [ ! -f "artifacts/$name" ]; then
      echo "ERROR: artifacts/$name is missing — the build-prod workspace was not attached." >&2
      return 1
    fi
  done

  # The privilege lock, no "key", and a version equal to the source manifest's, i.e. to $VERSION.
  node scripts/ci/verify-build.mjs "artifacts/$MANIFEST_COPY" --kind store
  echo "Releasing $VERSION."
}

# ── tag ───────────────────────────────────────────────────────────────────────────────────────────

# Turn a bare `403` from git into a cause. GitHub answers 401 for a token it does not recognise and
# 403 for one it recognises but will not let through, so a 403 on the push is an authorisation
# question, never "the variable is missing" (the `:?` above already covers that). Only runs when the
# push has already failed.
diagnose_push_denied() {
  local code perms
  code="$(curl -sS -o /tmp/repo-probe.json -w '%{http_code}' -H "$AUTH" "$API" || echo 000)"
  echo "       diagnosis — GET $API answered HTTP $code:" >&2
  case "$code" in
    200)
      perms="$(node -e '
        const r = require("/tmp/repo-probe.json");
        process.stdout.write(JSON.stringify(r.permissions ?? {}));' 2> /dev/null || echo '{}')"
      echo "       the token CAN read this repository; its permissions are $perms." >&2
      echo "       \"push\": false means it lacks Contents: write — the one permission a tag needs." >&2
      echo "       \"push\": true means a ruleset on refs/tags/v* refused it." >&2
      ;;
    401) echo "       the token was not recognised at all: wrong value, or expired." >&2 ;;
    403)
      echo "       the API refuses it too. Typical causes: a fine-grained token whose organization" >&2
      echo "       approval is still pending, or SSO not authorised for this token." >&2
      ;;
    404)
      echo "       the token cannot even see this repository. A fine-grained token needs Resource" >&2
      echo "       owner = ${REPO_SLUG%%/*} AND ${REPO_SLUG#*/} in its repository selection." >&2
      ;;
    *) echo "       could not reach the API to say more." >&2 ;;
  esac
}

tag() {
  releasing || { skip; return 0; }
  : "${GITHUB_TOKEN:?GITHUB_TOKEN must be set (org-wide context org-global)}"

  # A value pasted into a CI form can arrive with a trailing newline, which lands inside the push URL
  # and is rejected as a bad credential — a 403 with no hint. Tokens never contain whitespace, so
  # trimming is safe; it is announced rather than silent so the stored value gets fixed.
  local trimmed
  trimmed="$(printf '%s' "$GITHUB_TOKEN" | tr -d '[:space:]')"
  if [ "$trimmed" != "$GITHUB_TOKEN" ]; then
    echo "WARNING: GITHUB_TOKEN had surrounding whitespace — trimming it for this run, but fix the" >&2
    echo "         value stored in the org-global context." >&2
    GITHUB_TOKEN="$trimmed"
    AUTH="Authorization: Bearer ${GITHUB_TOKEN}"
  fi

  git config user.name "circleci-bot"
  git config user.email "ci@dmarket.com"
  # Resuming: the tag is already on the remote at this commit, which is the end state of this step.
  local remote_commit
  remote_commit="$(remote_tag_commit "$TAG")" || {
    echo "ERROR: could not ask the remote whether $TAG exists." >&2
    return 1
  }
  if [ "$remote_commit" = "$(git rev-parse HEAD)" ]; then
    echo "$TAG is already on the remote at this commit — nothing to tag."
    return 0
  fi

  # Creating the tag is idempotent so a re-run of this job (or an SSH rerun, where the working
  # directory survives) fails on the push guard below rather than on `tag: already exists`, which
  # says nothing about whether the remote has it.
  if ! git rev-parse -q --verify "refs/tags/$TAG" > /dev/null; then
    git tag -a "$TAG" -m "Release $TAG"
  fi
  # Tolerate losing a race to a parallel pipeline of this commit: the tag on this commit is the
  # desired end state. A tag on another commit is not, and publishing on top of it would be wrong.
  if ! git push "https://x-access-token:${GITHUB_TOKEN}@github.com/${REPO_SLUG}.git" "$TAG"; then
    remote_commit="$(remote_tag_commit "$TAG" || true)"
    if [ "$remote_commit" = "$(git rev-parse HEAD)" ]; then
      echo "$TAG already on the remote at this commit — another pipeline won the race."
    elif [ -n "$remote_commit" ]; then
      echo "ERROR: $TAG appeared on the remote at $remote_commit, not at this commit." >&2
      return 1
    else
      echo "ERROR: pushing $TAG failed." >&2
      diagnose_push_denied
      return 1
    fi
  fi
  echo "Tagged $TAG."
}

# ── publish ───────────────────────────────────────────────────────────────────────────────────────

# The release notes: this version's CHANGELOG section, plus how to use the attachments. Leading blank
# lines of the section are dropped; dots in the version are escaped so they match only a dot.
write_notes() {
  local v_re="${VERSION//./\\.}"
  awk "/^## \[$v_re\]/{f=1;next} /^## \[/{f=0} /^\[[^]]*\]:/{f=0} f&&!s&&/^[[:space:]]*\$/{next} f{s=1;print}" \
    CHANGELOG.md > /tmp/notes.md
  cat >> /tmp/notes.md << NOTES

---

### Attachments

\`$(store_zip_name "$VERSION")\` is the Chrome Web Store package: the production build with the
manifest \`key\` removed. Loaded unpacked it gets a random extension id, and the content scripts,
which connect to a fixed id, will not reach it.

To run the production build with the right extension id, use the \`-unpacked\` zip from the
\`build-prod\` job's Artifacts tab in CircleCI: unzip it, open \`chrome://extensions\`, turn on
**Developer mode**, then **Load unpacked** and select the folder.

The \`.crx\` is the store package wrapped in our signature, the exact bytes uploaded to the Chrome Web
Store, published so anyone can verify what shipped. It is not for installing: Chrome accepts a CRX
only when the store itself signed it. \`SHA256SUMS\` covers every attachment.
NOTES
  # printf, not echo: the backticks must stay literal.
  printf '\n### Build\n\n`%s`\n' "$(git rev-parse --short HEAD)" >> /tmp/notes.md
}

# Create the release, or adopt an existing one for this tag (re-run safe). Echoes its id on the first
# line and the names of the assets it already carries on the following ones.
resolve_release_id() {
  local id code
  code="$(get_release "$TAG")"
  case "$code" in
    200)
      id="$(release_summary | head -n 1)"
      echo "Release for $TAG already exists (id $id) — reusing it." >&2
      release_summary
      return 0
      ;;
    404) ;;
    *)
      echo "ERROR: could not read the GitHub Release for $TAG (HTTP $code)." >&2
      return 1
      ;;
  esac
  write_notes
  # Marked "Pre-release" on GitHub for a 0.x only — a version that was never released at all.
  node -e '
    const fs = require("fs");
    const v = process.env.VERSION;
    process.stdout.write(JSON.stringify({
      tag_name: process.env.TAG,
      name: process.env.TAG,
      body: fs.readFileSync("/tmp/notes.md", "utf8"),
      draft: false,
      prerelease: v.startsWith("0."),
    }));' > /tmp/release.json
  id="$(curl -sSf -X POST -H "$AUTH" -H "Accept: application/vnd.github+json" \
    "$API/releases" -d @/tmp/release.json | node -e '
      let s = ""; process.stdin.on("data", (d) => (s += d)).on("end", () => {
        process.stdout.write(String(JSON.parse(s).id));
      });')"
  echo "Created release $TAG (id $id)." >&2
  printf '%s' "$id"
}

# asset_info <name> — "<id> <state> <sha256 or ->" for the asset <name> in $RELEASE_JSON.
asset_info() {
  node -e '
    const r = require(process.argv[1]);
    const a = (r.assets ?? []).find((x) => x.name === process.argv[2]);
    if (a) process.stdout.write(`${a.id} ${a.state} ${(a.digest ?? "").replace(/^sha256:/, "") || "-"}`);
  ' "$RELEASE_JSON" "$1"
}

# fetch_asset <name> <out> — download the asset <name> of the Release in $RELEASE_JSON.
fetch_asset() {
  local id
  read -r id _ <<< "$(asset_info "$1")"
  curl -sSfL -H "$AUTH" -H "Accept: application/octet-stream" "$API/releases/assets/$id" -o "$2"
}

# stale_release <reason> — explain why the existing Release cannot be completed from this build, fail.
stale_release() {
  echo "ERROR: $1" >&2
  echo "       This Release was started by another workflow's build. Rerun THAT workflow with" >&2
  echo "       \"Rerun workflow from failed\", or delete the Release's assets on GitHub and rerun this one." >&2
  return 1
}

# check_attached <names> — every asset the Release already carries must be exactly this workflow's
# build: resuming on top of another build's files would publish a SHA256SUMS that does not match the
# zip next to it. Runs before anything is uploaded.
check_attached() {
  local name id state remote here
  for name in $1; do
    read -r id state remote <<< "$(asset_info "$name")"
    [ "$state" = "uploaded" ] ||
      stale_release "$name on $TAG is in state '$state', not uploaded." || return 1
    if [ "$name" = SHA256SUMS ]; then
      # pack-crx.sh adds the .crx line later, so check the lines for our files, not the whole file.
      fetch_asset SHA256SUMS /tmp/release-sums || return 1
      (cd artifacts && sha256sum -c --ignore-missing /tmp/release-sums) > /dev/null ||
        stale_release "SHA256SUMS on $TAG does not match this build." || return 1
      continue
    fi
    if [ "$remote" = "-" ]; then
      fetch_asset "$name" /tmp/release-asset || return 1
      remote="$(sha256sum /tmp/release-asset)"
      remote="${remote%% *}"
    fi
    here="$(sha256sum "artifacts/$name")"
    here="${here%% *}"
    [ "$remote" = "$here" ] ||
      stale_release "$name on $TAG (sha256 $remote) is not this build (sha256 $here)." || return 1
  done
}

publish() {
  releasing || { skip; return 0; }
  : "${GITHUB_TOKEN:?GITHUB_TOKEN must be set (org-wide context org-global)}"

  # Named explicitly rather than globbing artifacts/*: the asset set is then the same on every release,
  # and a file that appears in the workspace for any other reason (the -unpacked zip, for one) cannot
  # be published by accident.
  local store
  store="$(store_zip_name "$VERSION")"
  local assets="$store $MANIFEST_COPY"

  # Checksums over exactly those. The names expand before the redirect creates the file, so
  # SHA256SUMS never lists itself. pack-crx.sh adds the .crx to it later.
  # shellcheck disable=SC2086 -- deliberate word splitting: $assets is a space-separated list.
  (cd artifacts && sha256sum $assets > SHA256SUMS)
  cat artifacts/SHA256SUMS

  local summary release_id existing
  summary="$(resolve_release_id)"
  release_id="$(printf '%s\n' "$summary" | head -n 1)"
  existing="$(printf '%s\n' "$summary" | tail -n +2)"

  local name attached=""
  for name in $assets SHA256SUMS; do
    if has_line "$existing" "$name"; then attached="$attached $name"; fi
  done
  check_attached "$attached" || return 1

  for name in $assets SHA256SUMS; do
    if has_line "$existing" "$name"; then
      echo "${name} is already attached to $TAG and matches this build — leaving it alone."
      continue
    fi
    # Braces, not a bare $name: bash folds a following multibyte character into the parameter name,
    # and `set -u` then kills the job on an "unbound variable" that is really a punctuation mark.
    echo "Uploading ${name}…"
    curl -sSf -X POST -H "$AUTH" -H "Content-Type: application/octet-stream" \
      --data-binary @"artifacts/$name" \
      "https://uploads.github.com/repos/${REPO_SLUG}/releases/${release_id}/assets?name=${name}" \
      -o /dev/null
  done
  echo "Release $TAG published: https://github.com/${REPO_SLUG}/releases/tag/${TAG}"
}

AUTH="Authorization: Bearer ${GITHUB_TOKEN:-}"

case "$CMD" in
  resolve) resolve ;;
  guard) guard ;;
  tag) tag ;;
  publish) publish ;;
  *)
    echo "usage: bash scripts/ci/release.sh <resolve|guard|tag|publish>" >&2
    exit 2
    ;;
esac
