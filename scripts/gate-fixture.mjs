#!/usr/bin/env node
// gate-fixture.mjs — Created by Orka
// Gate: every axis's frontmatter patterns must trigger >= 1 hit on the
// fixture (examples/), and the NEGATIVE section must yield 0 axis-9 hits.
// Run: node scripts/gate-fixture.mjs

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const rulesDir = join(root, "rules");
const appFixture = readFileSync(join(root, "examples/DemoAntiPatterns.swift"), "utf8");
const testFixture = readFileSync(join(root, "examples/DemoAntiPatternsTests.swift"), "utf8");

function frontmatter(md) {
  const m = /^---\n([\s\S]*?)\n---/.exec(md);
  if (!m) return null;
  const axis = /axis:\s*(\d+)/.exec(m[1])?.[1];
  const scope = /scope:\s*"?tests?/i.test(m[1]);
  const patterns = [...m[1].matchAll(/^\s*-\s*"(.+)"\s*$/gm)].map((x) =>
    // YAML double-escapes backslashes: "\\." in the file means regex \.
    x[1].replace(/\\\\/g, "\\"),
  );
  return { axis: Number(axis), scope, patterns };
}

function countHits(pattern, text) {
  let re;
  try {
    re = new RegExp(pattern, "m");
  } catch {
    return { hits: -1 }; // invalid regex
  }
  let hits = 0;
  for (const line of text.split("\n")) if (re.test(line)) hits++;
  return { hits };
}

let failed = false;
const perAxis = {};

for (const file of readdirSync(rulesDir).sort()) {
  const fm = frontmatter(readFileSync(join(rulesDir, file), "utf8"));
  if (!fm) { console.error(`FAIL ${file}: no frontmatter`); failed = true; continue; }
  const corpus = fm.scope ? testFixture : appFixture + "\n" + testFixture;
  let axisHits = 0;
  let matchedPatterns = 0;
  for (const p of fm.patterns) {
    const { hits } = countHits(p, corpus);
    if (hits === -1) { console.error(`FAIL axis ${fm.axis}: invalid regex ${p}`); failed = true; continue; }
    if (hits > 0) matchedPatterns++;
    axisHits += hits;
  }
  perAxis[fm.axis] = { file, axisHits, matchedPatterns, total: fm.patterns.length };
}

console.log("axis | rule file                        | patterns hit | line hits");
for (const axis of Object.keys(perAxis).sort((a, b) => a - b)) {
  const { file, axisHits, matchedPatterns, total } = perAxis[axis];
  const ok = axisHits >= 1;
  if (!ok) failed = true;
  console.log(
    `${String(axis).padStart(4)} | ${file.padEnd(32)} | ${String(matchedPatterns).padStart(4)}/${String(total).padEnd(7)} | ${String(axisHits).padStart(4)} ${ok ? "OK" : "<-- FAIL: no trigger"}`,
  );
}

// Negative gate: the NEGATIVE section must not trigger axis 9 patterns
// (for axis 9, the raw hit IS the finding — unlike sweep-then-judge axes).
const negStart = appFixture.indexOf("MARK: - NEGATIVE");
const negative = appFixture.slice(negStart) + "\n" +
  appFixture.slice(appFixture.indexOf("closeProject"), appFixture.indexOf("// MARK: - NEGATIVE"));
const axis9 = frontmatter(readFileSync(join(rulesDir, "09-guard-first.md"), "utf8"));
let negHits = 0;
for (const p of axis9.patterns) negHits += Math.max(0, countHits(p, negative).hits);
console.log(`\nnegative section vs axis-9 patterns: ${negHits} hits ${negHits === 0 ? "OK" : "<-- FAIL"}`);
if (negHits > 0) failed = true;

// Judgment-phase guards: these sweep hits MUST exist in the negative section
// (they prove the Do-NOT-flag guards have material to guard).
for (const [label, re] of [
  ["Group{if/else} (axis 15 guard)", /Group\s*\{\s*\n\s*if /],
  [".enumerated() + element id (axis 2 guard)", /\.enumerated\(\)\),?\s*id:\s*\\\.element/],
  ["framework action type (axis 13 guard)", /@Environment\(\\\.dismiss\)/],
  ["static let formatter (axis 11 guard)", /static let \w+: NumberFormatter/],
]) {
  const present = re.test(appFixture);
  console.log(`guard material present — ${label}: ${present ? "OK" : "<-- FAIL"}`);
  if (!present) failed = true;
}

process.exit(failed ? 1 : 0);
