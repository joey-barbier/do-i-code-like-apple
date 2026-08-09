#!/usr/bin/env node
// dev-comme-apple — Est-ce que je dev comme Apple ?
// CLI zéro dépendance : vérifie Claude Code, prépare la session, lance claude.
// Créé par Orka — https://libtracker.io

import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, existsSync, accessSync, constants, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, delimiter, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const VERSION = "0.1.0";
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const POULPE = String.raw`
        ,---.
       ( o o )        dev-comme-apple v${VERSION}
        \ = /         « Est-ce que je dev comme Apple ? »
      .-'---'-.
     / | | | | \      un poulpi de LibTracker
    (  | | | |  )     https://libtracker.io
     '-'-'-'-'-'
`;

const HELP = `${POULPE}
Auto-évaluation SwiftUI pour devs iOS — QCM + scan de ton vrai projet,
rapport HTML jamais culpabilisant. Propulsé par Claude Code.

USAGE
  npx dev-comme-apple [options]

OPTIONS
  --help       Affiche cette aide
  --version    Affiche la version
  --dry-run    Prépare la session et montre ce qui serait lancé,
               sans lancer claude

DÉROULÉ
  1. Vérifie que Claude Code (claude) est installé
  2. Copie le protocole d'évaluation dans un dossier temporaire
  3. Lance une session claude qui te fait passer :
     · une question de niveau (junior / confirmé / senior)
     · un QCM de ~15 questions avec snippets de code
     · en option, un SCAN de ton vrai projet Xcode/SwiftUI
  4. Génère rapport.html et l'ouvre dans ton navigateur

Réalisé en BuildInPublic sur https://www.twitch.tv/horka_tv
Par le développeur de LibTracker — https://libtracker.io
`;

function claudeOnPath() {
  const exts = process.platform === "win32" ? [".cmd", ".exe", ".bat", ""] : [""];
  for (const dir of (process.env.PATH ?? "").split(delimiter)) {
    if (!dir) continue;
    for (const ext of exts) {
      const candidate = join(dir, `claude${ext}`);
      try {
        accessSync(candidate, constants.X_OK);
        if (statSync(candidate).isFile() || statSync(candidate).isSymbolicLink()) return candidate;
      } catch {
        /* pas ici, on continue */
      }
    }
  }
  return null;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(HELP);
  process.exit(0);
}
if (args.includes("--version") || args.includes("-v")) {
  console.log(VERSION);
  process.exit(0);
}
const dryRun = args.includes("--dry-run");
const unknown = args.filter((a) => !["--dry-run"].includes(a));
if (unknown.length > 0) {
  fail(`Option inconnue : ${unknown.join(", ")}\nEssaie : npx dev-comme-apple --help`);
}

console.log(POULPE);

// 1. Claude Code installé ?
const claudeBin = claudeOnPath();
if (!claudeBin) {
  fail(
    [
      "Claude Code (claude) est introuvable dans ton PATH.",
      "",
      "Pour l'installer :",
      "  npm install -g @anthropic-ai/claude-code",
      "ou",
      "  curl -fsSL https://claude.ai/install.sh | bash",
      "",
      "Puis relance : npx dev-comme-apple",
    ].join("\n"),
  );
}
console.log(`✓ Claude Code trouvé : ${claudeBin}`);

// 2. Prépare le dossier de session (skill + rules + template, auto-portants).
const sessionDir = mkdtempSync(join(tmpdir(), "dev-comme-apple-"));
for (const part of ["skill", "rules", "template"]) {
  const src = join(packageRoot, part);
  if (!existsSync(src)) fail(`Paquet corrompu : dossier manquant ${src}`);
  cpSync(src, join(sessionDir, part), { recursive: true });
}
console.log(`✓ Session préparée : ${sessionDir}`);

// 3. Lance claude sur le protocole, depuis le dossier courant du dev
//    (le rapport.html sera écrit ici, et un éventuel scan partira d'ici).
const prompt =
  `Lis le fichier ${join(sessionDir, "skill", "SKILL.md")} et suis exactement son protocole, ` +
  `en français. Les règles d'évaluation sont dans ${join(sessionDir, "rules")} ` +
  `et le template du rapport dans ${join(sessionDir, "template")}. ` +
  `Écris le rapport final dans ${join(process.cwd(), "rapport.html")}.`;

if (dryRun) {
  console.log("\n--dry-run : voici ce qui serait lancé (claude n'est PAS lancé) :\n");
  console.log(`  cwd      : ${process.cwd()}`);
  console.log(`  commande : claude "<prompt>"`);
  console.log(`  prompt   :\n\n${prompt}\n`);
  console.log(`Contenu de la session : ${sessionDir}`);
  const ls = spawnSync("find", [sessionDir, "-type", "f"], { encoding: "utf8" });
  if (ls.status === 0) console.log(ls.stdout.trim());
  process.exit(0);
}

console.log("\nLancement de la session d'évaluation… (quitte avec Ctrl+C si besoin)\n");
const res = spawnSync(claudeBin, [prompt], { stdio: "inherit", cwd: process.cwd() });
process.exit(res.status ?? 0);
