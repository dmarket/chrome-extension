# Dmarket Trust Shield Chrome Extension

## Install

### nvm

> curl -o- <https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh> | bash

### Node.js

> nvm install

### pnpm

> npm install -g pnpm

#### Setup Home Path

> pnpm setup

Restart terminal

### nx

Install NX Globally

> pnpm install nx@latest -g

Install Local Dependencies

> pnpm install

Install Nx Console IDE extension


### Development

> nx run dmarket-chrome-extension:serve:development

### Build extension

> nx run dmarket-chrome-extension:build:production

### Upgrade Storybook

> npx storybook@latest upgrade --config-dir libs/dmarket-chrome-extension/ui-explorer/storybook/.storybook

## Releases

CI runs on CircleCI (`.circleci/config.yml`). To cut a release:

1. On `main`, through a pull request: bump `"version"` in `apps/dmarket-chrome-extension/src/manifest.json`
   and add a `## [<version>]` section to `CHANGELOG.md`.
2. Push a branch `release/v<version>` from `main`, with the same version.
3. In CircleCI, approve `hold_release` on that branch's pipeline.

Everything after the approval runs unattended: the tag `v<version>` and a GitHub Release, a signed CRX
attached to it, a read-only rehearsal against the Chrome Web Store, the upload and submission for
review, and deletion of the release branch.

Every store release needs a strictly greater manifest version than the one published; the store
refuses anything else, and the pipeline refuses it before uploading.

Build artifacts, on every push:

- `build-prod` job artifacts: `dmarket-trust-shield-<version>-chrome.zip` (the store package, without
  the manifest `key`) and `dmarket-trust-shield-<version>-chrome-unpacked.zip` (for Load unpacked with
  the right extension id).
- `build-debug` job artifacts: `dmarket-trust-shield-<version>-chrome-dev.zip` (sourcemaps and a reload
  client that connects to `ws://localhost:4201`).

Secrets: the project environment variables `CRX_SIGNING_KEY_B64` and
`CHROME_SERVICE_ACCOUNT_PRIVATE_KEY`, and `GITHUB_TOKEN` from the `org-global` context.
