#!/usr/bin/env node
// verify-build.mjs <dir|manifest.json> --kind store|unpacked|dev — checks a built extension before it
// is zipped, released or signed. Dependency-free, so the release jobs can run it without installing.
//
//   store     the Chrome Web Store package: no "key" in the manifest (developers report the store
//             refusing one), no sourcemaps, no development reload client.
//   unpacked  the production build as built, for Load unpacked: "key" present and deriving to the
//             extension id the content scripts connect to (dmExtId), no sourcemaps, no reload client.
//   dev       the development build: "key" present and deriving to dmExtId; sourcemaps and the reload
//             client are expected.
//
// Every kind checks the manifest version and the privilege lock. A bare manifest.json instead of a
// directory runs the manifest checks only. All failures are collected and printed together.
//
// Exit codes: 0 ok, 1 checks failed, 2 usage.

import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const SOURCE_MANIFEST = join(ROOT, 'apps/dmarket-chrome-extension/src/manifest.json');
export const CONSTANTS = join(
  ROOT,
  'libs/dmarket-chrome-extension/shared/constants/src/lib/extension.constants.ts',
);
export const KINDS = ['store', 'unpacked', 'dev'];

// The privilege lock. Any change here is a change to what users are asked to grant, so it must be a
// deliberate edit of this file, reviewed as such.
export const LOCK = {
  permissions: ['storage', 'scripting', 'activeTab'],
  optional_host_permissions: ['*://*/*'],
  contentScriptMatches: ['https://dmarket.com/*', 'https://steamcommunity.com/*'],
  webAccessibleMatches: ['https://steamcommunity.com/*'],
};

/** Chrome's extension id for a manifest "key": sha256 of the SPKI, first 16 bytes, hex 0-f -> a-p. */
export function idFromKey(key) {
  const hex = createHash('sha256').update(Buffer.from(key, 'base64')).digest('hex').slice(0, 32);
  return [...hex].map((c) => String.fromCharCode(97 + parseInt(c, 16))).join('');
}

/** The hard-coded `dmExtId` the content scripts pass to chrome.runtime.connect. */
export function readExtId(text) {
  const m = /export const dmExtId = '([a-p]{32})'/.exec(text);
  return m ? m[1] : null;
}

/** Failures for a Chrome manifest version: 1-4 dot-separated integers, no leading zeros, each <= 65535. */
export function checkVersion(version) {
  if (typeof version !== 'string' || !/^(0|[1-9]\d*)(\.(0|[1-9]\d*)){0,3}$/.test(version)) {
    return [`version "${version}" is not 1-4 dot-separated integers without leading zeros`];
  }
  return version
    .split('.')
    .filter((part) => Number(part) > 65535)
    .map((part) => `version "${version}": part ${part} is greater than 65535`);
}

function compareSet(label, actual, expected) {
  const have = new Set(actual);
  const want = new Set(expected);
  const failures = [];
  for (const x of have) if (!want.has(x)) failures.push(`${label}: unexpected "${x}"`);
  for (const x of want) if (!have.has(x)) failures.push(`${label}: missing "${x}"`);
  return failures;
}

/** Failures for a parsed manifest. `extId` is the expected id for kinds that keep the "key". */
export function checkManifest(manifest, { kind, sourceVersion, extId }) {
  const failures = [];
  if (manifest.manifest_version !== 3) {
    failures.push(`manifest_version is ${manifest.manifest_version}, expected 3`);
  }
  failures.push(...checkVersion(manifest.version));
  if (sourceVersion !== undefined && manifest.version !== sourceVersion) {
    failures.push(
      `version ${manifest.version} differs from the source manifest's ${sourceVersion}`,
    );
  }

  failures.push(...compareSet('permissions', manifest.permissions ?? [], LOCK.permissions));
  for (const field of ['host_permissions', 'optional_permissions']) {
    const value = manifest[field];
    if (value !== undefined && !(Array.isArray(value) && value.length === 0)) {
      failures.push(`${field} must be absent or an empty array, got ${JSON.stringify(value)}`);
    }
  }
  if ('externally_connectable' in manifest) {
    failures.push('externally_connectable must be absent');
  }
  (manifest.web_accessible_resources ?? []).forEach((w, i) => {
    if (w && typeof w === 'object' && 'extension_ids' in w) {
      failures.push(`web_accessible_resources[${i}] must not have extension_ids`);
    }
  });
  failures.push(
    ...compareSet(
      'optional_host_permissions',
      manifest.optional_host_permissions ?? [],
      LOCK.optional_host_permissions,
    ),
  );
  failures.push(
    ...compareSet(
      'content_scripts matches',
      (manifest.content_scripts ?? []).flatMap((c) => c.matches ?? []),
      LOCK.contentScriptMatches,
    ),
  );
  failures.push(
    ...compareSet(
      'web_accessible_resources matches',
      (manifest.web_accessible_resources ?? []).flatMap((w) => w.matches ?? []),
      LOCK.webAccessibleMatches,
    ),
  );

  if (kind === 'store') {
    if ('key' in manifest) failures.push('"key" must not be in the store package manifest');
  } else if (!manifest.key) {
    failures.push(`"key" is missing; a ${kind} build needs it to keep the extension id`);
  } else if (idFromKey(manifest.key) !== extId) {
    failures.push(`"key" derives to id ${idFromKey(manifest.key)}, but dmExtId is ${extId}`);
  }
  return failures;
}

function listFiles(dir) {
  return readdirSync(dir, { recursive: true }).filter((f) => statSync(join(dir, f)).isFile());
}

/** Failures for the built files (not the manifest). */
export function checkTree(dir, kind) {
  if (kind === 'dev') return [];
  const failures = [];
  const files = listFiles(dir);
  for (const f of files.filter((f) => f.endsWith('.map'))) failures.push(`sourcemap present: ${f}`);
  for (const f of files.filter((f) => f.endsWith('.js'))) {
    if (readFileSync(join(dir, f), 'utf8').includes('ws://localhost')) {
      failures.push(`development reload client (ws://localhost) in ${f}`);
    }
  }
  return failures;
}

function main(argv) {
  const usage =
    'usage: node scripts/ci/verify-build.mjs <dir|manifest.json> --kind store|unpacked|dev';
  const [target, flag, kind] = argv;
  if (!target || flag !== '--kind' || !KINDS.includes(kind) || argv.length !== 3) {
    console.error(usage);
    return 2;
  }
  let isDir;
  try {
    isDir = statSync(target).isDirectory();
  } catch {
    console.error(`ERROR: ${target} does not exist.\n${usage}`);
    return 2;
  }

  const manifestPath = isDir ? join(target, 'manifest.json') : target;
  const failures = [];
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch (e) {
    failures.push(`cannot read ${manifestPath}: ${e instanceof Error ? e.message : String(e)}`);
  }
  if (manifest) {
    const sourceVersion = JSON.parse(readFileSync(SOURCE_MANIFEST, 'utf8')).version;
    const extId = readExtId(readFileSync(CONSTANTS, 'utf8'));
    if (!extId) failures.push(`cannot find dmExtId in ${CONSTANTS}`);
    failures.push(...checkManifest(manifest, { kind, sourceVersion, extId }));
  }
  if (isDir) failures.push(...checkTree(target, kind));

  if (failures.length > 0) {
    console.error(`verify-build: ${target} (${kind}) FAILED:\n  - ${failures.join('\n  - ')}`);
    return 1;
  }
  console.log(`verify-build: ${target} (${kind}) OK, version ${manifest.version}`);
  return 0;
}

// Compared through realpath: Node runs the module from its real path, so an unresolved argv[1] that goes
// through a symlink (/tmp on macOS) would never match and the CLI would exit 0 having checked nothing.
// argv[1] may not be a path at all (`node -` reading stdin); importing must not throw then.
const isMain = (() => {
  try {
    return fileURLToPath(import.meta.url) === realpathSync(process.argv[1]);
  } catch {
    return false;
  }
})();
if (isMain) {
  process.exitCode = main(process.argv.slice(2));
}
