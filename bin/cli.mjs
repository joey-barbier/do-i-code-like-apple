#!/usr/bin/env node
// do-i-code-like-apple — Do I code like Apple?
// Zero-dependency CLI: checks Claude Code, prepares the session, launches claude.
// Created by Orka — https://libtracker.io

import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, existsSync, accessSync, constants, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, delimiter, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const VERSION = "0.2.0";
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// ---------------------------------------------------------------------------
// i18n — CLI messages. Session content is translated live by Claude, so the
// session works in ANY language; this dictionary only covers the CLI itself.
// Fallback: en. Add a language = add an entry here (PRs welcome).
// ---------------------------------------------------------------------------

const TITLES = {
  en: "Do I code like Apple?",
  fr: "Est-ce que je dev comme Apple ?",
  es: "¿Programo como Apple?",
  de: "Programmiere ich wie Apple?",
};

const STRINGS = {
  en: {
    tagline: "a LibTracker octopus",
    intro:
      "Self-assessment for iOS/SwiftUI devs — quiz + scan of your real project,\nan HTML report that never shames. Powered by Claude Code.",
    usage: "USAGE",
    usageLine: "npx do-i-code-like-apple [options]   (alias: npx dev-comme-apple)",
    options: "OPTIONS",
    optHelp: "Show this help",
    optVersion: "Show the version",
    optLang: "Session language (en, fr, es, de, … any language)",
    optDryRun: "Prepare the session and show what would run,\n               without launching claude",
    flow: "WHAT HAPPENS",
    flowSteps:
      "  1. Checks that Claude Code (claude) is installed\n" +
      "  2. Copies the assessment protocol into a temp folder\n" +
      "  3. Launches a claude session that runs:\n" +
      "     - a level question (junior / seasoned / senior)\n" +
      "     - a ~15-question quiz with code snippets\n" +
      "     - optionally, a SCAN of your real Xcode/SwiftUI project\n" +
      "  4. Generates report.html and opens it in your browser",
    credits:
      "Built in public on https://www.twitch.tv/horka_tv\nBy the developer of LibTracker — https://libtracker.io",
    claudeMissing:
      "Claude Code (claude) was not found in your PATH.\n\nTo install it:\n  npm install -g @anthropic-ai/claude-code\nor\n  curl -fsSL https://claude.ai/install.sh | bash\n\nThen run again: npx do-i-code-like-apple",
    claudeFound: "Claude Code found:",
    sessionReady: "Session prepared:",
    corrupt: "Corrupted package: missing folder",
    unknownOption: "Unknown option:",
    tryHelp: "Try: npx do-i-code-like-apple --help",
    dryRunHeader: "--dry-run: here is what would run (claude is NOT launched):",
    dryRunCwd: "cwd",
    dryRunCmd: "command",
    dryRunPrompt: "prompt",
    dryRunContents: "Session contents:",
    launching: "Starting the assessment session… (Ctrl+C to quit)",
    langDetected: "Session language:",
    langAsk: "Session language: not detected — Claude will ask you at the start.",
  },
  fr: {
    tagline: "un poulpi de LibTracker",
    intro:
      "Auto-évaluation SwiftUI pour devs iOS — QCM + scan de ton vrai projet,\nrapport HTML jamais culpabilisant. Propulsé par Claude Code.",
    usage: "USAGE",
    usageLine: "npx do-i-code-like-apple [options]   (alias : npx dev-comme-apple)",
    options: "OPTIONS",
    optHelp: "Affiche cette aide",
    optVersion: "Affiche la version",
    optLang: "Langue de la session (en, fr, es, de, … n'importe laquelle)",
    optDryRun: "Prépare la session et montre ce qui serait lancé,\n               sans lancer claude",
    flow: "DÉROULÉ",
    flowSteps:
      "  1. Vérifie que Claude Code (claude) est installé\n" +
      "  2. Copie le protocole d'évaluation dans un dossier temporaire\n" +
      "  3. Lance une session claude qui te fait passer :\n" +
      "     - une question de niveau (junior / confirmé / senior)\n" +
      "     - un QCM de ~15 questions avec snippets de code\n" +
      "     - en option, un SCAN de ton vrai projet Xcode/SwiftUI\n" +
      "  4. Génère report.html et l'ouvre dans ton navigateur",
    credits:
      "Réalisé en BuildInPublic sur https://www.twitch.tv/horka_tv\nPar le développeur de LibTracker — https://libtracker.io",
    claudeMissing:
      "Claude Code (claude) est introuvable dans ton PATH.\n\nPour l'installer :\n  npm install -g @anthropic-ai/claude-code\nou\n  curl -fsSL https://claude.ai/install.sh | bash\n\nPuis relance : npx do-i-code-like-apple",
    claudeFound: "Claude Code trouvé :",
    sessionReady: "Session préparée :",
    corrupt: "Paquet corrompu : dossier manquant",
    unknownOption: "Option inconnue :",
    tryHelp: "Essaie : npx do-i-code-like-apple --help",
    dryRunHeader: "--dry-run : voici ce qui serait lancé (claude n'est PAS lancé) :",
    dryRunCwd: "cwd",
    dryRunCmd: "commande",
    dryRunPrompt: "prompt",
    dryRunContents: "Contenu de la session :",
    launching: "Lancement de la session d'évaluation… (Ctrl+C pour quitter)",
    langDetected: "Langue de la session :",
    langAsk: "Langue de la session : non détectée — Claude te la demandera au début.",
  },
  es: {
    tagline: "un pulpito de LibTracker",
    intro:
      "Autoevaluación SwiftUI para devs iOS — quiz + escaneo de tu proyecto real,\nun informe HTML que nunca culpabiliza. Impulsado por Claude Code.",
    usage: "USO",
    usageLine: "npx do-i-code-like-apple [opciones]   (alias: npx dev-comme-apple)",
    options: "OPCIONES",
    optHelp: "Muestra esta ayuda",
    optVersion: "Muestra la versión",
    optLang: "Idioma de la sesión (en, fr, es, de, … cualquiera)",
    optDryRun: "Prepara la sesión y muestra lo que se lanzaría,\n               sin lanzar claude",
    flow: "QUÉ PASA",
    flowSteps:
      "  1. Comprueba que Claude Code (claude) está instalado\n" +
      "  2. Copia el protocolo de evaluación a una carpeta temporal\n" +
      "  3. Lanza una sesión de claude que ejecuta:\n" +
      "     - una pregunta de nivel (junior / intermedio / senior)\n" +
      "     - un quiz de ~15 preguntas con snippets de código\n" +
      "     - opcionalmente, un ESCANEO de tu proyecto Xcode/SwiftUI real\n" +
      "  4. Genera report.html y lo abre en tu navegador",
    credits:
      "Construido en público en https://www.twitch.tv/horka_tv\nPor el desarrollador de LibTracker — https://libtracker.io",
    claudeMissing:
      "Claude Code (claude) no se encuentra en tu PATH.\n\nPara instalarlo:\n  npm install -g @anthropic-ai/claude-code\no\n  curl -fsSL https://claude.ai/install.sh | bash\n\nLuego vuelve a ejecutar: npx do-i-code-like-apple",
    claudeFound: "Claude Code encontrado:",
    sessionReady: "Sesión preparada:",
    corrupt: "Paquete corrupto: falta la carpeta",
    unknownOption: "Opción desconocida:",
    tryHelp: "Prueba: npx do-i-code-like-apple --help",
    dryRunHeader: "--dry-run: esto es lo que se lanzaría (claude NO se lanza):",
    dryRunCwd: "cwd",
    dryRunCmd: "comando",
    dryRunPrompt: "prompt",
    dryRunContents: "Contenido de la sesión:",
    launching: "Iniciando la sesión de evaluación… (Ctrl+C para salir)",
    langDetected: "Idioma de la sesión:",
    langAsk: "Idioma de la sesión: no detectado — Claude te lo preguntará al inicio.",
  },
  de: {
    tagline: "ein Oktopus von LibTracker",
    intro:
      "Selbsteinschätzung für iOS/SwiftUI-Devs — Quiz + Scan deines echten Projekts,\nein HTML-Report, der niemals beschämt. Angetrieben von Claude Code.",
    usage: "VERWENDUNG",
    usageLine: "npx do-i-code-like-apple [Optionen]   (Alias: npx dev-comme-apple)",
    options: "OPTIONEN",
    optHelp: "Zeigt diese Hilfe",
    optVersion: "Zeigt die Version",
    optLang: "Sitzungssprache (en, fr, es, de, … beliebig)",
    optDryRun: "Bereitet die Sitzung vor und zeigt, was gestartet würde,\n               ohne claude zu starten",
    flow: "ABLAUF",
    flowSteps:
      "  1. Prüft, ob Claude Code (claude) installiert ist\n" +
      "  2. Kopiert das Bewertungsprotokoll in einen temporären Ordner\n" +
      "  3. Startet eine claude-Sitzung mit:\n" +
      "     - einer Einstufungsfrage (Junior / Fortgeschritten / Senior)\n" +
      "     - einem Quiz mit ~15 Fragen und Code-Snippets\n" +
      "     - optional einem SCAN deines echten Xcode/SwiftUI-Projekts\n" +
      "  4. Erzeugt report.html und öffnet ihn im Browser",
    credits:
      "Build in Public auf https://www.twitch.tv/horka_tv\nVom Entwickler von LibTracker — https://libtracker.io",
    claudeMissing:
      "Claude Code (claude) wurde nicht in deinem PATH gefunden.\n\nInstallation:\n  npm install -g @anthropic-ai/claude-code\noder\n  curl -fsSL https://claude.ai/install.sh | bash\n\nDann erneut ausführen: npx do-i-code-like-apple",
    claudeFound: "Claude Code gefunden:",
    sessionReady: "Sitzung vorbereitet:",
    corrupt: "Beschädigtes Paket: fehlender Ordner",
    unknownOption: "Unbekannte Option:",
    tryHelp: "Versuche: npx do-i-code-like-apple --help",
    dryRunHeader: "--dry-run: das würde gestartet (claude wird NICHT gestartet):",
    dryRunCwd: "cwd",
    dryRunCmd: "Befehl",
    dryRunPrompt: "Prompt",
    dryRunContents: "Sitzungsinhalt:",
    launching: "Starte die Bewertungssitzung… (Ctrl+C zum Beenden)",
    langDetected: "Sitzungssprache:",
    langAsk: "Sitzungssprache: nicht erkannt — Claude fragt dich zu Beginn.",
  },
};

// ---------------------------------------------------------------------------
// Language resolution: --lang flag > LC_ALL/LC_MESSAGES/LANG > ask in session.
// The session accepts ANY language; the CLI dictionary falls back to English.
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = { flags: new Set(), lang: null, unknown: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--lang") {
      args.lang = argv[++i]?.toLowerCase() ?? null;
    } else if (a.startsWith("--lang=")) {
      args.lang = a.slice(7).toLowerCase() || null;
    } else if (["--help", "-h", "--version", "-v", "--dry-run"].includes(a)) {
      args.flags.add(a);
    } else {
      args.unknown.push(a);
    }
  }
  return args;
}

function envLanguage() {
  for (const key of ["LC_ALL", "LC_MESSAGES", "LANG"]) {
    const raw = process.env[key];
    if (!raw || raw === "C" || raw.startsWith("C.") || raw === "POSIX") continue;
    const m = /^([a-z]{2,3})([_-]|$)/i.exec(raw);
    if (m) return m[1].toLowerCase();
  }
  return null;
}

const cliArgs = parseArgs(process.argv.slice(2));
const sessionLang = cliArgs.lang ?? envLanguage(); // null → Claude asks
const uiLang = sessionLang && STRINGS[sessionLang] ? sessionLang : "en";
const t = STRINGS[uiLang];
const title = TITLES[uiLang] ?? TITLES.en;

const OCTOPUS = String.raw`
        .-""-.
       ( o  o )       do-i-code-like-apple v${VERSION}
      (   u    )      « ${title} »
       ` + "`" + String.raw`-.__.-'
      _/(_)(_)\_      ${t.tagline}
     ( )( )( )( )     https://libtracker.io
      ~  ~  ~  ~
`;

const HELP = `${OCTOPUS}
${t.intro}

${t.usage}
  ${t.usageLine}

${t.options}
  --help       ${t.optHelp}
  --version    ${t.optVersion}
  --lang xx    ${t.optLang}
  --dry-run    ${t.optDryRun}

${t.flow}
${t.flowSteps}

${t.credits}
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
        /* not here, keep looking */
      }
    }
  }
  return null;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (cliArgs.flags.has("--help") || cliArgs.flags.has("-h")) {
  console.log(HELP);
  process.exit(0);
}
if (cliArgs.flags.has("--version") || cliArgs.flags.has("-v")) {
  console.log(VERSION);
  process.exit(0);
}
if (cliArgs.unknown.length > 0) {
  fail(`${t.unknownOption} ${cliArgs.unknown.join(", ")}\n${t.tryHelp}`);
}
const dryRun = cliArgs.flags.has("--dry-run");

console.log(OCTOPUS);

// 1. Is Claude Code installed?
const claudeBin = claudeOnPath();
if (!claudeBin) fail(t.claudeMissing);
console.log(`✓ ${t.claudeFound} ${claudeBin}`);

// 2. Prepare the session folder (skill + rules + template, self-contained).
const sessionDir = mkdtempSync(join(tmpdir(), "do-i-code-like-apple-"));
for (const part of ["skill", "rules", "template"]) {
  const src = join(packageRoot, part);
  if (!existsSync(src)) fail(`${t.corrupt} ${src}`);
  cpSync(src, join(sessionDir, part), { recursive: true });
}
console.log(`✓ ${t.sessionReady} ${sessionDir}`);
console.log(sessionLang ? `✓ ${t.langDetected} ${sessionLang}` : `✓ ${t.langAsk}`);

// 3. Launch claude on the protocol, from the dev's current directory
//    (report.html is written here; an optional scan starts from here too).
const langDirective = sessionLang
  ? `Session language: "${sessionLang}". Conduct the ENTIRE session in that language.`
  : `Session language: not specified. FIRST ask the user which language they prefer, then conduct the entire session in it.`;

const prompt =
  `Read the file ${join(sessionDir, "skill", "SKILL.md")} and follow its protocol exactly. ` +
  `The evaluation rules are in ${join(sessionDir, "rules")} ` +
  `and the report template in ${join(sessionDir, "template")}. ` +
  `${langDirective} ` +
  `Write the final report to ${join(process.cwd(), "report.html")}.`;

if (dryRun) {
  console.log(`\n${t.dryRunHeader}\n`);
  console.log(`  ${t.dryRunCwd}      : ${process.cwd()}`);
  console.log(`  ${t.dryRunCmd}   : claude "<prompt>"`);
  console.log(`  ${t.dryRunPrompt}   :\n\n${prompt}\n`);
  console.log(`${t.dryRunContents} ${sessionDir}`);
  const ls = spawnSync("find", [sessionDir, "-type", "f"], { encoding: "utf8" });
  if (ls.status === 0) console.log(ls.stdout.trim());
  process.exit(0);
}

console.log(`\n${t.launching}\n`);
const res = spawnSync(claudeBin, [prompt], { stdio: "inherit", cwd: process.cwd() });
process.exit(res.status ?? 0);
