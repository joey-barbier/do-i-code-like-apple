# Contributing

Thanks! The most useful contribution: **an evaluation rule**.

Canonical content language is **English** (rules, quiz, protocol) — the
Claude session translates it live into the user's language, so one file
serves every language. CLI messages have a small per-language dictionary in
`bin/cli.mjs` (`en`, `fr`, `es`, `de`) — adding a CLI language = adding one
entry there.

## Adding or improving a rule

1. One file = one axis, in `rules/`, named `NN-slug.md` (English slug).
2. Mandatory frontmatter: `axis`, `id`, `title`, `severity`
   (high/medium/low), `patterns` (grep regexes), `reference`, `link`
   (official Apple docs only). Optional `scope` (e.g. "test files only").
3. Body in four sections: **The concept** · **What Apple says** ·
   **Detection** (with the ambiguous cases left to the session's judgment) ·
   **5-minute fix** (before/after).
4. The tone: never shaming. Explain the mechanism, don't judge the person.
   Every finding must leave with an immediate fix.
5. If the pattern is grep-able, add a triggering example to
   `examples/DemoAntiPatterns.swift` (annotated with the axis number).

## Check before the PR

```bash
node bin/cli.mjs --help       # the CLI responds
node bin/cli.mjs --dry-run    # the session prepares (your rule gets copied)
```

Ideally: run `npx do-i-code-like-apple` against `examples/` and confirm your
rule triggers.

## Commits

Format: `add/update/fix(scope) - description` — e.g.
`add(rules) - axis 11: detached tasks in views`. No emojis in commit
messages.

## Quiz

Questions live in `skill/quiz.md`. A new rule may come with 1-2 matching
questions (A/B snippets, correct answer shuffled between A and B,
explanation kept for the report).
