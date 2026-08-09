# Contributing

Thanks! The most useful contributions: **an evaluation sub-rule** or **an
anti-false-positive guard** (the Do NOT flag entries are as valuable as the
positive rules — they are what separates this tool from a naive linter).

Canonical content language is **English** (rules, quiz, protocol) — the
Claude session translates it live into the user's language, so one file
serves every language. CLI messages have a small per-language dictionary in
`bin/cli.mjs` (`en`, `fr`, `es`, `de`) — adding a CLI language = adding one
entry there.

## Adding or improving a rule

1. One file = one axis, in `rules/`, named `NN-slug.md` (English slug).
2. Mandatory frontmatter: `axis`, `id`, `title`, `severity`
   (high/medium/low), `patterns` (ERE grep regexes — no lookaheads, they
   must run under `grep -E`). Optional `scope` (e.g. "test files only").
3. Body in five sections: **Concept** · **Sub-rules** (numbered `N.n`, each
   with a one-line statement + severity + detection mode GREP/JUDGMENT) ·
   **Do NOT flag** (MANDATORY — list the blessed patterns your rule must not
   over-flag) · **5-minute fix** (before/after) · **Reference** (public
   developer.apple.com links only — never internal file/line references).
4. The tone: never shaming. Explain the mechanism, don't judge the person.
   Every finding must leave with an immediate fix.
5. Add a triggering example to `examples/DemoAntiPatterns.swift` (annotated
   with the axis.sub-rule) and, if your rule has a guard, guard material in
   the NEGATIVE section.
6. Add a line to **COVERAGE.md** for each recommendation your sub-rule
   covers (or a new id if it's a new recommendation).

## Check before the PR

```bash
node bin/cli.mjs --help          # the CLI responds
node bin/cli.mjs --dry-run       # the session prepares (your rule gets copied)
node scripts/gate-fixture.mjs    # every axis must trigger; negatives stay clean
```

Ideally: run `npx do-i-code-like-apple` against `examples/` and confirm your
rule triggers (and that its guards hold).

## Commits

Format: `add/update/fix(scope) - description` — e.g.
`add(rules) - axis 17: detached tasks in views`. No emojis in commit
messages.

## Quiz

Questions live in `skill/quiz.md` (a 25-question bank; the session asks
~12–15). A new rule may come with 1-2 matching questions (A/B snippets,
correct answer shuffled between A and B, explanation kept for the report,
inventory ids in an HTML comment for COVERAGE traceability).
