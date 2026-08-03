#!/usr/bin/env node
// Structural validation for the career-ops-alljobs plugin.
//
//   node scripts/validate-plugin.mjs
//
// Exits non-zero on any error. Warnings do not fail the run unless --strict.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const STRICT = process.argv.includes('--strict');

const errors = [];
const warnings = [];

const err = (file, msg) => errors.push(`${file}: ${msg}`);
const warn = (file, msg) => warnings.push(`${file}: ${msg}`);

const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const has = (p) => existsSync(join(ROOT, p));

const walk = (dir) => {
  const out = [];
  const abs = join(ROOT, dir);
  if (!existsSync(abs)) return out;
  for (const entry of readdirSync(abs)) {
    const rel = join(dir, entry);
    if (statSync(join(ROOT, rel)).isDirectory()) out.push(...walk(rel));
    else out.push(rel);
  }
  return out;
};

// ── Front matter ────────────────────────────────────────────────────────────
// Deliberately minimal: enough to catch a missing delimiter or a key that
// silently stops a skill from loading. Not a general YAML parser.
function parseFrontMatter(text, file) {
  if (!text.startsWith('---\n')) {
    err(file, 'missing YAML front matter (file must start with ---)');
    return null;
  }
  const end = text.indexOf('\n---', 3);
  if (end === -1) {
    err(file, 'front matter is never closed (no terminating ---)');
    return null;
  }
  const body = text.slice(4, end);
  const fields = {};
  let currentKey = null;
  let blockIndent = null; // set while consuming a `key: |` block scalar

  for (const line of body.split('\n')) {
    if (blockIndent !== null) {
      const indent = line.match(/^(\s*)/)[1].length;
      if (line.trim() === '' || indent >= blockIndent) {
        fields[currentKey] += (fields[currentKey] ? '\n' : '') + line.trim();
        continue;
      }
      blockIndent = null; // dedented — the block ended
    }
    if (/^\s*#/.test(line) || line.trim() === '') continue;

    const top = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (top) {
      currentKey = top[1];
      const value = top[2].trim();
      if (value === '|' || value === '>' || value === '|-' || value === '>-') {
        fields[currentKey] = '';
        blockIndent = 1; // any indented line belongs to the block
      } else {
        fields[currentKey] = value;
      }
      continue;
    }
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item && currentKey) {
      if (!Array.isArray(fields[currentKey])) fields[currentKey] = [];
      fields[currentKey].push(item[1].trim());
    }
  }
  return fields;
}

// ── Manifests ───────────────────────────────────────────────────────────────
let pluginName = null;

if (!has('.claude-plugin/plugin.json')) {
  err('.claude-plugin/plugin.json', 'missing');
} else {
  let manifest;
  try {
    manifest = JSON.parse(read('.claude-plugin/plugin.json'));
  } catch (e) {
    err('.claude-plugin/plugin.json', `invalid JSON: ${e.message}`);
  }
  if (manifest) {
    pluginName = manifest.name;
    if (!manifest.name) err('.claude-plugin/plugin.json', 'missing required field "name"');
    else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(manifest.name)) {
      err('.claude-plugin/plugin.json', `name "${manifest.name}" is not kebab-case`);
    }
    if (manifest.keywords && !Array.isArray(manifest.keywords)) {
      err('.claude-plugin/plugin.json', 'keywords must be an array');
    }
    if (!manifest.version) warn('.claude-plugin/plugin.json', 'no version — installs will be pinned to the commit SHA');
    for (const field of ['description', 'author', 'license', 'repository']) {
      if (!manifest[field]) warn('.claude-plugin/plugin.json', `no "${field}"`);
    }
  }
}

if (!has('.claude-plugin/marketplace.json')) {
  warn('.claude-plugin/marketplace.json', 'missing — the repo cannot be added as a marketplace');
} else {
  let market;
  try {
    market = JSON.parse(read('.claude-plugin/marketplace.json'));
  } catch (e) {
    err('.claude-plugin/marketplace.json', `invalid JSON: ${e.message}`);
  }
  if (market) {
    if (!market.name) err('.claude-plugin/marketplace.json', 'missing required field "name"');
    if (!market.owner?.name) err('.claude-plugin/marketplace.json', 'missing required field "owner.name"');
    if (!Array.isArray(market.plugins) || market.plugins.length === 0) {
      err('.claude-plugin/marketplace.json', 'missing required field "plugins" (non-empty array)');
    } else {
      for (const [i, entry] of market.plugins.entries()) {
        const at = `.claude-plugin/marketplace.json [plugins[${i}]]`;
        if (!entry.name) err(at, 'missing required field "name"');
        if (!entry.source) err(at, 'missing required field "source"');
        if (typeof entry.source === 'string' && entry.source !== './' && !entry.source.startsWith('./')) {
          err(at, `relative source "${entry.source}" must start with ./`);
        }
        if (typeof entry.source === 'string' && entry.source.includes('..')) {
          err(at, 'source must not escape the marketplace root with ../');
        }
        if (entry.name && pluginName && entry.name !== pluginName) {
          warn(at, `entry name "${entry.name}" differs from plugin.json name "${pluginName}" — the marketplace entry wins for install and enablement`);
        }
      }
    }
  }
}

// ── Skills, commands, agents ────────────────────────────────────────────────
const skillFiles = walk('skills').filter((f) => f.endsWith('SKILL.md'));
const commandFiles = walk('commands').filter((f) => f.endsWith('.md'));
const agentFiles = walk('agents').filter((f) => f.endsWith('.md'));

if (skillFiles.length === 0) err('skills/', 'no SKILL.md files found');

const seenNames = new Map();

for (const file of [...skillFiles, ...commandFiles, ...agentFiles]) {
  const text = read(file);
  const fm = parseFrontMatter(text, file);
  if (!fm) continue;

  if (!fm.name) {
    err(file, 'front matter has no "name"');
  } else {
    const name = fm.name.replace(/^["']|["']$/g, '');
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) err(file, `name "${name}" is not kebab-case`);
    if (seenNames.has(name)) err(file, `name "${name}" already used by ${seenNames.get(name)}`);
    else seenNames.set(name, file);

    // A skill's directory name is what users see; a mismatch is confusing.
    if (file.startsWith('skills/')) {
      const dir = file.split('/')[1];
      if (dir !== name) err(file, `directory "skills/${dir}" does not match skill name "${name}"`);
    }
  }

  if (!fm.description) err(file, 'front matter has no "description"');
  else if (fm.description.replace(/^["']|["']$/g, '').length < 40) {
    warn(file, 'description is very short — Claude uses it to decide when to invoke the skill');
  }
}

// ── Referenced files must exist ─────────────────────────────────────────────
// This is the check that matters most: a ${CLAUDE_PLUGIN_ROOT} path pointing at
// a file that was renamed or deleted fails silently at runtime.
const allDocs = [...skillFiles, ...commandFiles, ...agentFiles, ...walk('references')].filter((f) =>
  f.endsWith('.md'),
);

const PLUGIN_REF = /\$\{CLAUDE_PLUGIN_ROOT\}\/([A-Za-z0-9._\/-]+)/g;

for (const file of allDocs) {
  const text = read(file);
  for (const [, target] of text.matchAll(PLUGIN_REF)) {
    // Template placeholders like lenses/{primary}.md are resolved at runtime.
    if (target.includes('{')) continue;
    if (!has(target)) err(file, `references a file that does not exist: ${target}`);
  }
}

// Bare `references/foo.md` mentions resolve against the user's working
// directory at runtime, not the plugin — the exact bug this validator exists
// to prevent from coming back.
const BARE_REF = /(?<!\$\{CLAUDE_PLUGIN_ROOT\}\/)(?<![\w./-])(references|templates|lenses)\/[A-Za-z0-9._-]+\.(md|html|yml)/g;

for (const file of [...skillFiles, ...commandFiles, ...agentFiles]) {
  const text = read(file);
  for (const match of text.matchAll(BARE_REF)) {
    err(
      file,
      `"${match[0]}" has no \${CLAUDE_PLUGIN_ROOT} prefix — it would resolve against the user's project directory, not the plugin`,
    );
  }
}

// Every lens named in the archetypes table must exist, and vice versa.
if (has('references/archetypes.md')) {
  const text = read('references/archetypes.md');
  const named = new Set([...text.matchAll(/lenses\/([a-z0-9-]+)\.md/g)].map((m) => m[1]));
  const onDisk = new Set(
    walk('references/lenses')
      .filter((f) => f.endsWith('.md'))
      .map((f) => f.split('/').pop().replace(/\.md$/, '')),
  );
  for (const lens of named) {
    if (!onDisk.has(lens)) err('references/archetypes.md', `names lens "${lens}" but references/lenses/${lens}.md is missing`);
  }
  for (const lens of onDisk) {
    if (!named.has(lens)) warn(`references/lenses/${lens}.md`, 'exists but no archetype row points to it — it will never be read');
  }
}

// ── Report ──────────────────────────────────────────────────────────────────
const skillNames = skillFiles.length;
console.log(
  `Checked ${skillNames} skills, ${commandFiles.length} commands, ${agentFiles.length} agents, ${walk('references').length} reference files.`,
);

for (const w of warnings) console.log(`  warn   ${w}`);
for (const e of errors) console.log(`  ERROR  ${e}`);

if (errors.length) {
  console.log(`\n${errors.length} error(s), ${warnings.length} warning(s).`);
  process.exit(1);
}
if (STRICT && warnings.length) {
  console.log(`\n0 errors, ${warnings.length} warning(s) — failing because --strict.`);
  process.exit(1);
}
console.log(`\nOK — 0 errors, ${warnings.length} warning(s).`);
