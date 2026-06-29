#!/usr/bin/env node
// fe-fidelity-kit — repository self-check (zero-dependency).
//
// What `fidelity-adopt --verify` does for a project that ADOPTED the kit,
// this does for the kit REPOSITORY itself: it asserts the structure, the
// cross-references, the profile field contract, and bilingual symmetry that
// the methodology promises. CI-friendly: exits non-zero on any failure.
//
//   node scripts/verify-kit.mjs
//
// Checks:
//   1. requires_dirs in kit-manifest.json all exist
//   2. every components.* file in the manifest exists
//   3. cross_refs resolve FROM their own location (drop-in safety)
//   4. profile field contract: every `profile.<path>` referenced by
//      rules/skills/commands/references is defined in the profile template
//   5. profile context backend enums are valid in the template/examples
//   6. README.md and README.zh.md are heading-symmetric (bilingual drift)
//   7. shipped profile examples contain no unfilled `FILL:` placeholders

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const exists = (p) => fs.existsSync(path.join(ROOT, p));

let checks = 0;
let fails = 0;
const ok = (m) => { checks++; console.log("  \x1b[32mok\x1b[0m   " + m); };
const bad = (m) => { checks++; fails++; console.log("  \x1b[31mFAIL\x1b[0m " + m); };
const section = (m) => console.log("\n• " + m);

const manifest = JSON.parse(read("kit-manifest.json"));
const exDir = "profile/examples";
const yamlScalar = (s, key) => {
  const m = s.match(new RegExp(`^\\s*${key}:\\s*["']?([^"'#\\n]+)`, "m"));
  return m ? m[1].trim() : undefined;
};

// 1. required dirs
section("required dirs exist");
for (const d of manifest.requires_dirs)
  exists(d) ? ok(d + "/") : bad("missing dir: " + d);

// 2. component files
section("component files exist");
for (const [group, val] of Object.entries(manifest.components))
  for (const f of Array.isArray(val) ? val : [val])
    exists(f) ? ok(f) : bad(`missing component (${group}): ${f}`);

// 3. cross-references resolve from their own location (catches a partial drop-in)
section("cross-references resolve (drop-in safety)");
for (const { from, to } of manifest.cross_refs) {
  const resolved = path.normalize(path.join(path.dirname(from), to));
  exists(resolved)
    ? ok(`${from} → ${to}`)
    : bad(`broken xref: ${from} → ${to} (= ${resolved})`);
}

// gather methodology markdown (the files that cite profile.* at runtime)
const mdFiles = [];
for (const dir of ["rules", "skills", "commands", "references"]) {
  if (!exists(dir)) continue;
  const walk = (d) => {
    for (const e of fs.readdirSync(path.join(ROOT, d), { withFileTypes: true })) {
      const rel = path.join(d, e.name);
      if (e.isDirectory()) walk(rel);
      else if (e.name.endsWith(".md")) mdFiles.push(rel);
    }
  };
  walk(dir);
}

// 4. profile field contract: referenced ⊆ template
section("profile field contract (referenced ⊆ template)");
const tpl = read(manifest.components.profile_template);
const NOISE = new Set(["md", "review.md", "template.md", "X"]); // file-name noise, not fields
const refs = new Set();
for (const f of mdFiles)
  for (const m of read(f).matchAll(/profile\.([A-Za-z_][\w.]*)/g)) {
    const p = m[1].replace(/\.+$/, "");
    if (NOISE.has(p) || p.endsWith(".md")) continue;
    refs.add(p);
  }
const undefined_refs = [];
for (const p of [...refs].sort()) {
  const leaf = p.split(".").pop();
  // present if the full dotted path appears, or the leaf appears as a YAML key
  const present = tpl.includes(p) || new RegExp(`(^|[\\s.])${leaf}:`, "m").test(tpl);
  if (!present) undefined_refs.push(p);
}
if (undefined_refs.length)
  for (const p of undefined_refs) bad(`profile.${p} referenced but not defined in template`);
else ok(`${refs.size} referenced profile.* fields all defined in the template`);

// 5. context backend enums
section("profile context backend enums");
const allowedMemory = new Set(["none", "claude-mem", "codex-memory", "repo-harness", "custom"]);
const allowedHarness = new Set(["none", "repo-harness"]);
const profileDocs = [[manifest.components.profile_template, tpl]];
if (exists(exDir))
  for (const e of fs.readdirSync(path.join(ROOT, exDir)))
    if (e.endsWith(".md")) profileDocs.push([path.join(exDir, e), read(path.join(exDir, e))]);
for (const [rel, doc] of profileDocs) {
  const memoryBackend = yamlScalar(doc, "memory_backend");
  const harnessBackend = yamlScalar(doc, "harness_backend");
  const reuseLimit = yamlScalar(doc, "reuse_packet_limit");
  allowedMemory.has(memoryBackend)
    ? ok(`${rel} memory_backend=${memoryBackend}`)
    : bad(`${rel} has invalid memory_backend: ${memoryBackend || "(missing)"}`);
  allowedHarness.has(harnessBackend)
    ? ok(`${rel} harness_backend=${harnessBackend}`)
    : bad(`${rel} has invalid harness_backend: ${harnessBackend || "(missing)"}`);
  Number.isInteger(Number(reuseLimit)) && Number(reuseLimit) > 0
    ? ok(`${rel} reuse_packet_limit=${reuseLimit}`)
    : bad(`${rel} has invalid reuse_packet_limit: ${reuseLimit || "(missing)"}`);
}

// 6. bilingual README heading symmetry
section("bilingual README symmetry");
const headings = (s) => (s.match(/^#{1,4} /gm) || []).length;
const en = headings(read("README.md"));
const zh = headings(read("README.zh.md"));
en === zh
  ? ok(`README.md and README.zh.md both have ${en} headings`)
  : bad(`heading drift: README.md=${en} vs README.zh.md=${zh}`);

// 7. examples fully filled
section("examples contain no unfilled FILL: placeholders");
if (exists(exDir))
  for (const e of fs.readdirSync(path.join(ROOT, exDir))) {
    if (!e.endsWith(".md")) continue;
    const rel = path.join(exDir, e);
    /FILL:/.test(read(rel)) ? bad(`${rel} still contains FILL:`) : ok(rel);
  }

// 7. template fields ⊆ each example (no example silently dropped a field)
section("examples define every template field");
const yamlKeys = (s) => {
  const block = s.match(/```yaml\n([\s\S]*?)```/);
  const keys = new Set();
  if (block)
    for (const line of block[1].split("\n")) {
      const km = line.match(/^\s*([A-Za-z_][\w]*):/);
      if (km) keys.add(km[1]);
    }
  return keys;
};
const tplKeys = yamlKeys(tpl);
if (exists(exDir))
  for (const e of fs.readdirSync(path.join(ROOT, exDir))) {
    if (!e.endsWith(".md")) continue;
    const rel = path.join(exDir, e);
    const missing = [...tplKeys].filter((k) => !yamlKeys(read(rel)).has(k));
    missing.length
      ? bad(`${rel} missing template field(s): ${missing.join(", ")}`)
      : ok(`${rel} (${tplKeys.size} fields)`);
  }

console.log(
  `\n${fails ? "\x1b[31m✗" : "\x1b[32m✓"} ${checks - fails}/${checks} checks passed` +
    (fails ? `, ${fails} FAILED` : "") + "\x1b[0m"
);
process.exit(fails ? 1 : 0);
