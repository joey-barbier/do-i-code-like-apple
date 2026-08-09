---
axis: 2
id: foreach-identity
title: "ForEach identity — stable ids"
severity: high
patterns:
  - "id:\\s*\\\\\\.self"
  - "ForEach\\([^)]*\\.indices"
  - "ForEach\\(0\\s*\\.\\.<"
  - "\\.enumerated\\(\\)"
reference: "Apple, ForEach: identity must be stable and unique over time; indices and transient values break diffing and animations."
link: "https://developer.apple.com/documentation/swiftui/foreach"
---

# ForEach identity

## The concept

`ForEach` identifies each row by an id. If the id is not **stable** (the same
element keeps the same id over time) and **unique**, SwiftUI cannot match rows
across two renders: it destroys and recreates rows, loses per-row local state
(`@State`), breaks insert/delete animations, and re-renders more than needed.

- `id: \.self`: identity IS the value → editing an element reads as
  "delete + insert" to SwiftUI. Two equal values = potential uniqueness crash.
- indices (`0..<items.count`, `.indices`, `.enumerated()`): inserting at the
  head shifts every id → everything re-renders and per-row state slides from
  one row to the next.

## What Apple says

> The id must remain stable for the lifetime of the data it identifies.
> Conform your data to `Identifiable` with an id that survives edits.

## Detection (scan)

- Patterns above, in view files.
- **Ambiguous case (judgment)**: `id: \.self` on a collection of immutable,
  guaranteed-unique values (e.g. a `CaseIterable` enum of tabs) is acceptable —
  flag as minor, not as a finding.

## 5-minute fix

Before:

```swift
ForEach(projects, id: \.self) { project in ProjectRow(project) }
ForEach(0..<items.count) { i in ItemRow(items[i]) }
```

After:

```swift
struct Project: Identifiable { let id: UUID; var name: String }

ForEach(projects) { project in ProjectRow(project) }   // stable id, for free
```
