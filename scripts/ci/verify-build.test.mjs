import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  checkManifest,
  checkVersion,
  CONSTANTS,
  idFromKey,
  readExtId,
  SOURCE_MANIFEST,
} from './verify-build.mjs';

const source = JSON.parse(readFileSync(SOURCE_MANIFEST, 'utf8'));
const extId = readExtId(readFileSync(CONSTANTS, 'utf8'));
const opts = (kind) => ({ kind, sourceVersion: source.version, extId });

test('the manifest key derives to dmExtId', () => {
  assert.equal(idFromKey(source.key), extId);
});

test('version format', () => {
  assert.deepEqual(checkVersion('1.0.4.5'), []);
  for (const bad of ['1.0.05', '1.0.4.5.6', '65536', '1.0.5-beta']) {
    assert.notDeepEqual(checkVersion(bad), [], bad);
  }
});

test('the source manifest passes as unpacked and fails as store', () => {
  assert.deepEqual(checkManifest(source, opts('unpacked')), []);
  assert.match(checkManifest(source, opts('store')).join('\n'), /"key" must not be/);
});

test('an unpacked manifest without "key" fails', () => {
  const { key: _key, ...noKey } = source;
  assert.deepEqual(checkManifest(noKey, opts('store')), []);
  assert.match(checkManifest(noKey, opts('unpacked')).join('\n'), /"key" is missing/);
});

test('an extra permission fails and is named', () => {
  const extra = { ...source, permissions: [...source.permissions, 'tabs'] };
  assert.deepEqual(checkManifest(extra, opts('unpacked')), ['permissions: unexpected "tabs"']);
});

test('privilege fields outside the lock fail and are named', () => {
  const cases = {
    optional_permissions: { optional_permissions: ['tabs'] },
    externally_connectable: { externally_connectable: { matches: ['https://dmarket.com/*'] } },
    extension_ids: {
      web_accessible_resources: source.web_accessible_resources.map((w) => ({
        ...w,
        extension_ids: ['*'],
      })),
    },
    host_permissions: { host_permissions: 'https://dmarket.com/*' },
  };
  for (const [field, extra] of Object.entries(cases)) {
    const failures = checkManifest({ ...source, ...extra }, opts('unpacked'));
    assert.equal(failures.length, 1, field);
    assert.match(failures[0], new RegExp(field), field);
  }
});

test('the CLI fails a bad build when run through a symlink', () => {
  const dir = mkdtempSync(join(tmpdir(), 'verify-build-'));
  try {
    writeFileSync(join(dir, 'manifest.json'), '{"manifest_version":2}');
    mkdirSync(join(dir, 'bin'));
    const scriptPath = join(dir, 'bin', 'verify-build.mjs');
    symlinkSync(fileURLToPath(new URL('./verify-build.mjs', import.meta.url)), scriptPath);
    const run = spawnSync(process.execPath, [scriptPath, dir, '--kind', 'store']);
    assert.equal(run.status, 1, run.stderr.toString());
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
