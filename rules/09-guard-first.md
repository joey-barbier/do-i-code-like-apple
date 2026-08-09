---
axis: 9
id: guard-first
title: "Guard-first — early exit in imperative code"
severity: low
patterns:
  - "if let [^{]+\\{[^}]*if let"
  - "else\\s*\\{\\s*return"
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

- Coarse grep pattern (two nested `if let`) + **mandatory judgment**: read the
  function, count the depth, confirm it is not a SwiftUI body. Severity scales
  with depth (2 levels = minor, 4 = finding).

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
