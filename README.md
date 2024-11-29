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
