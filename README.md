**English** · [Français](README.fr.md) · [Español](README.es.md) · [Deutsch](README.de.md)

# 🐙 do-i-code-like-apple

> **Do I code like Apple?**
> Self-assessment for iOS/SwiftUI developers of any level — quiz + scan of
> your real project, an HTML report that never shames. Powered by Claude
> Code. Works in your language (en, fr, es, de… any language, really).

```
🐙 do-i-code-like-apple v0.3.0
   « Do I code like Apple? »
   a LibTracker octopus — https://libtracker.io
```

![Demo](docs/demo.gif) <!-- GIF coming soon -->

## Run it

```bash
npx do-i-code-like-apple            # language auto-detected from your env
npx do-i-code-like-apple --lang es  # or pick one (any language code works)
npx dev-comme-apple                 # friendly alias for the French audience
```

Requirement: [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
installed (`claude` on the PATH). That's it — zero npm dependencies.

## What happens

1. **A level question** — junior / seasoned / senior. It never affects the
   verdict, only how the report teaches.
2. **A quiz** (~12–15 questions from a 25-question bank) with code snippets:
   "which of these two versions would you write?".
3. **A scan of your real project** (optional): you give the path to an
   Xcode/SwiftUI project, and the tool confronts **what you THINK you do**
   (your answers) with **what your code SHOWS** (the scan), axis by axis.
   Free-form context supported ("Features/Checkout is my current level,
   Legacy/ dates from my beginnings") — the score is computed ONLY on
   today's code, and the legacy is used to measure **your progress**.
   Scan-only mode available if you'd rather skip the quiz.
4. **A self-contained HTML report** opens: overall score, per-axis octopus
   grades 🐙, the declared-vs-observed face-off (the tool's gold), your
   progress, and the top 3 "5-minute fixes" with before/after and Apple doc
   links.

## The 16 axes

| # | Axis | # | Axis |
|---|---|---|---|
| 1 | Invalidation boundaries | 9 | Guard-first imperative code |
| 2 | ForEach identity | 10 | Conditional modifiers (`.if`) |
| 3 | Derived data in the body | 11 | View init hygiene |
| 4 | @Observable granularity | 12 | List rows fast path |
| 5 | Bindings | 13 | Environment discipline |
| 6 | Localization | 14 | SDK 27 readiness |
| 7 | Soft-deprecated APIs (16 families) | 15 | Structural Groups |
| 8 | Testing (Swift Testing, determinism) | 16 | Animations |

**Coverage: 100% of Apple's checkable SwiftUI guidance.** We inventoried 378
discrete recommendations from Apple's public guidance; 369 are implemented as
scanner sub-rules, anti-false-positive guards, or quiz questions — the other
9 are assistant-process rules that don't apply to a consented audit. The full
per-recommendation traceability matrix lives in **[COVERAGE.md](COVERAGE.md)**
— every checkable recommendation has a line there; a missing one is a bug,
issues welcome.

What separates this from a naive linter: every axis ships a **Do NOT flag**
section — the ~25 blessed patterns that a grep-only checker would over-flag
(`Group { if/else }`, `.enumerated()` for display, framework action types,
XCUITest files, stable environment defaults…). Guarded hits are reported as
proof of good habits, never as findings.

## Multilingual by design

The content (quiz, rules, report) is written once, in English — and the
Claude session **translates it live** into the session language. No
per-language copies to maintain, and it works for any language, not just the
four shipped in the CLI (`en`, `fr`, `es`, `de` for the CLI's own messages).
Language resolution: `--lang` flag > `LANG`/`LC_ALL` environment > Claude
asks at the start.

## Philosophy: never shaming

- We don't judge, we show. Every finding = **concept + Apple doc reference +
  5-minute fix** (before/after snippet).
- Nobody gets graded on code they wrote 3 years ago. Declared legacy is
  excluded from the score — and turned into an asset: axes where your recent
  code beats the old one become **proven wins** ✓.
- Divergences work in both directions: sometimes your code is better than
  your answers. We tell you that too.
- Axes with nothing to grade (no tests, no custom environment keys…) are
  excluded from the mean — never scored 1/5 for absence.
- Nothing is sent anywhere: everything runs locally in your Claude Code
  session.

## Contributing a rule

The 16 axes live in [`rules/`](rules/) — one Markdown file per axis:
frontmatter (`axis`, `id`, `title`, `severity`, `patterns` grep regexes),
then **Concept · Sub-rules (numbered, each with severity + GREP/JUDGMENT
detection) · Do NOT flag (mandatory) · 5-minute fix · Reference** (public
developer.apple.com links only). The session reads every file in `rules/`:
adding a rule = opening a PR with one file + a line in COVERAGE.md. See
[CONTRIBUTING.md](CONTRIBUTING.md).

## Structure

```
bin/cli.mjs        # zero-dependency CLI: checks claude, prepares, launches
skill/SKILL.md     # the protocol the Claude session follows (staged scan)
skill/quiz.md      # the 25-question bank (canonical English)
rules/*.md         # the 16 axes — contributable via PR
COVERAGE.md        # per-recommendation traceability matrix (378 items)
template/          # neo-brutalist report (CSS + skeleton)
examples/          # anti-pattern fixture + sample report
scripts/           # gate: every axis must trigger on the fixture
```

## Try it without Claude

```bash
node bin/cli.mjs --help        # the help (and the 🐙)
node bin/cli.mjs --dry-run     # shows what would run, without launching claude
node scripts/gate-fixture.mjs  # prove every axis triggers on the fixture
open examples/report-example.html   # what a report looks like
```

---

🐙 By the developer of [LibTracker](https://libtracker.io) — the octopus runs
in the family. Built in public on
[Horka_TV](https://www.twitch.tv/horka_tv) · powered by Claude Code ·
[MIT](LICENSE) license.
