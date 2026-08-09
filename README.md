**English** · [Français](README.fr.md) · [Español](README.es.md) · [Deutsch](README.de.md)

# 🐙 do-i-code-like-apple

> **Do I code like Apple?**
> Self-assessment for iOS/SwiftUI developers of any level — quiz + scan of
> your real project, an HTML report that never shames. Powered by Claude Code.
> Works in your language (en, fr, es, de… any language, really).

```
🐙 do-i-code-like-apple v0.2.0
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
2. **A ~15-question quiz** with code snippets: "which of these two versions
   would you write?". Invalidation boundaries, ForEach identity, derived data
   in the body, @Observable, bindings, localization, deprecated APIs,
   testing, guard-first, conditional modifiers.
3. **A scan of your real project** (optional): you give the path to an
   Xcode/SwiftUI project, and the tool confronts **what you THINK you do**
   (your answers) with **what your code SHOWS** (the scan), axis by axis.
   You can add free-form context: "Features/Checkout is my current level,
   Legacy/ dates from my beginnings" — the score is computed ONLY on today's
   code, and the legacy is used to measure **your progress**.
4. **A self-contained HTML report** opens: overall score, per-axis octopus
   grades 🐙, the declared-vs-observed face-off (the tool's gold), your
   progress, and the top 3 "5-minute fixes" with before/after and Apple doc
   links.

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
- Nothing is sent anywhere: everything runs locally in your Claude Code
  session.

## Contributing a rule

The 10 evaluation axes live in [`rules/`](rules/) — one Markdown file per
axis, with a structured frontmatter:

```yaml
---
axis: 2
id: foreach-identity
title: "ForEach identity — stable ids"
severity: high             # high | medium | low
patterns:                  # grep-able regexes
  - "id:\\s*\\\\\\.self"
reference: "Summary of what the Apple doc says"
link: "https://developer.apple.com/documentation/swiftui/foreach"
---
```

followed by four sections: **The concept**, **What Apple says**, **Detection**
(patterns + ambiguous cases left to Claude's judgment), **5-minute fix**
(before/after). The session reads every file in `rules/`: adding a rule =
opening a PR with one file. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Structure

```
bin/cli.mjs        # zero-dependency CLI: checks claude, prepares, launches
skill/SKILL.md     # the protocol the Claude session follows
skill/quiz.md      # the 15 quiz questions (canonical English)
rules/*.md         # the 10 axes — contributable via PR
template/          # neo-brutalist report (CSS + skeleton)
examples/          # anti-pattern fixture + sample report
```

## Try it without Claude

```bash
node bin/cli.mjs --help        # the help (and the 🐙)
node bin/cli.mjs --dry-run     # shows what would run, without launching claude
open examples/report-example.html   # what a report looks like
```

---

🐙 By the developer of [LibTracker](https://libtracker.io) — the octopus runs
in the family. Built in public on
[Horka_TV](https://www.twitch.tv/horka_tv) · powered by Claude Code ·
[MIT](LICENSE) license.
