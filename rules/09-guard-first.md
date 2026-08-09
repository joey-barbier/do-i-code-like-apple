---
axis: 9
id: guard-first
title: "Guard-first — early exit in imperative code"
severity: low
patterns:
  - "if\\s+let\\s[^{]*\\{\\s*if\\s"
  - "^\\s{16,}if[\\s(]"
reference: "Swift, The Swift Programming Language (Early Exit): guard expresses preconditions at the top of a function and keeps the happy path flat, unindented."
link: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/controlflow#Early-Exit"
---

# Guard-first

## The concept

In **imperative** code (functions, actions, interactors), preconditions belong
at the top with `guard`: every early exit is explicit, and the happy path
stays flat at indentation level zero. Nested `if let` pyramids bury the
business logic deep in indentation and scatter the failure cases.

Important nuance: this rule applies to imperative code. Inside a
`@ViewBuilder` (body), conditional-display `if let`s are the right tool —
`guard` is not even available there.

## Detection (scan)

- Two coarse grep patterns, both needing **mandatory judgment**:
  - `if let … { if …` on ONE line — reliable but **single-line only**: it
    misses the common multi-line pyramid (grep works line by line). Treat it
    as a bonus catch, not the main detector.
  - `^\s{16,}if[\s(]` — deep-indentation heuristic (an `if` starting at ≥ 16
    spaces suggests 3+ nesting levels). Read the surrounding function: confirm
    it is imperative code, NOT a SwiftUI `@ViewBuilder` body (display `if`s
    there are fine and often deeply indented), and that the depth comes from
    nested conditionals rather than a closure chain.
- **Never flag `guard … else { return }`** — that IS the recommended pattern.
  A previous version of this rule grepped `else\s*\{\s*return` and flagged its
  own fix; don't reintroduce it.
- Severity scales with depth (2 levels = minor, 4 = finding).

## 5-minute fix

Before:

```swift
func openRelease(id: String) {
    if let project = store.selectedProject {
        if let release = project.releases.first(where: { $0.id == id }) {
            if release.isPublished {
                path.append(Route.release(release))
            }
        }
    }
}
```

After:

```swift
func openRelease(id: String) {
    guard let project = store.selectedProject,
          let release = project.releases.first(where: { $0.id == id }),
          release.isPublished else { return }
    path.append(Route.release(release))      // flat happy path
}
```
