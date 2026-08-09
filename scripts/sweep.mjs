#!/usr/bin/env node
// sweep.mjs — Created by Orka
// Phase-1 sweep runner: reads every rule frontmatter and greps its patterns
// over the given paths WITHOUT any shell interpolation of the patterns.
// Why it exists: patterns containing a bare `!` (axis 8: `try!`, `\)!`) are
// SILENTLY eaten by zsh/bash history expansion when inlined in a command —
// a validation run missed 15 real hits that way. Patterns therefore always
// travel through files (`grep -E -f`), never through the command line.
//
// Usage:
//   node scripts/sweep.mjs <path> [<path>…]      # run the full sweep
//   node scripts/sweep.mjs --emit-patterns <dir> # (re)generate pattern files
//
// Output: one block per axis — axis id, hit count, then file:line:text hits
// (capped per axis) ready for the phase-2 judgment pass.

import { readFileSync, readdirSync, writeFileSync, mkdirSync, mkdtempSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const rulesDir = join(root, "rules");
const HIT_CAP = 200;

export function parseRules() {
  const rules = [];
  for (const file of readdirSync(rulesDir).sort()) {
    if (!file.endsWith(".md")) continue;
    const md = readFileSync(join(rulesDir, file), "utf8");
    const m = /^---\n([\s\S]*?)\n---/.exec(md);
    if (!m) continue;
    const axis = Number(/axis:\s*(\d+)/.exec(m[1])?.[1]);
    const id = /id:\s*(\S+)/.exec(m[1])?.[1] ?? file;
    const testScope = /scope:\s*"?tests?/i.test(m[1]);
    const patterns = [...m[1].matchAll(/^\s*-\s*"(.+)"\s*$/gm)].map((x) =>
      x[1].replace(/\\\\/g, "\\"),
    );
    rules.push({ file, axis, id, testScope, patterns });
  }
  return rules;
}

function emitPatterns(dir) {
  mkdirSync(dir, { recursive: true });
  for (const r of parseRules()) {
    const name = `${String(r.axis).padStart(2, "0")}-${r.id}.txt`;
    writeFileSync(join(dir, name), r.patterns.join("\n") + "\n");
    console.log(`wrote ${join(dir, name)} (${r.patterns.length} patterns)`);
  }
}

function sweep(paths) {
  const tmp = mkdtempSync(join(tmpdir(), "sweep-patterns-"));
  for (const r of parseRules()) {
    const pf = join(tmp, `${r.axis}.txt`);
    writeFileSync(pf, r.patterns.join("\n") + "\n");
    // Patterns reach grep via -f: immune to shell history expansion (`!`),
    // quoting bugs, and argv length limits.
    const args = ["-rnE", "-f", pf, "--include=*.swift"];
    if (r.testScope) {
      // Axis scoped to test files: SwiftPM Tests/ dirs and *Tests.swift —
      // but NOT Xcode UI-test targets (*UITests/), excluded per rule 08.
      args.push("--include=*Tests.swift");
    }
    args.push(...paths);
    const res = spawnSync("grep", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    let lines = (res.stdout || "").split("\n").filter(Boolean);
    if (r.testScope) {
      lines = lines.filter((l) => /(^|\/)(\w*Tests\.swift|Tests\/)/.test(l) && !/UITests\//.test(l));
    }
    console.log(`\n=== axis ${r.axis} (${r.id}) — ${lines.length} raw hit(s) ===`);
    for (const l of lines.slice(0, HIT_CAP)) console.log(l);
    if (lines.length > HIT_CAP) console.log(`… ${lines.length - HIT_CAP} more (judge by file)`);
  }
}

const argv = process.argv.slice(2);
if (argv[0] === "--emit-patterns") {
  emitPatterns(argv[1] ?? join(root, "scripts", "patterns"));
} else if (argv.length > 0) {
  sweep(argv);
} else {
  console.error("usage: node scripts/sweep.mjs <path>… | --emit-patterns [dir]");
  process.exit(2);
}
