---
axis: 3
id: derived-data-in-body
title: "Derived data recomputed in the body"
severity: high
patterns:
  - "\\.sorted\\("
  - "\\.sorted\\s*\\{"
  - "\\.filter\\s*[({]"
  - "Dictionary\\(grouping:"
reference: "Apple, data flow: « computed properties still establish dependencies transitively… cache the derived value as its own stored property » ; ForEach: « don't sort or filter inline »."
link: "https://developer.apple.com/documentation/swiftui/managing-model-data-in-your-app"
---

# Derived data in the body

## The concept

Sorting, filtering or grouping **in the body** (or in a computed var the body
reads) redoes the work on **every** re-evaluation — including when the state
change is unrelated (dismissing an alert, switching tabs). Worse: the result is
a **fresh array** every time, so `ForEach` re-diffs every row.

Invisible with 6 mock items; a scroll freeze with 200 real ones.

## What Apple says

> Computed properties still establish dependencies transitively. The fix is to
> cache the derived value as its own stored property and keep it in sync.

> Don't sort or filter inline in ForEach. Cache the derived collection on the
> model — recompute in a `didSet`.

## Detection (scan)

- `sorted`/`filter`/`Dictionary(grouping:)` patterns in view files.
- **Ambiguous case (judgment)**: a `.filter` over 3 items in a leaf view is not
  a hot path. Prioritize: main lists, dashboards, counters read by containers
  (TabView badge). A `sorted` in a model or engine (outside SwiftUI) is not a
  finding — that is where it belongs.

## 5-minute fix

Before:

```swift
var body: some View {
    List(store.projects.sorted { $0.criticality > $1.criticality }) { … }
}
```

After:

```swift
@Observable final class Store {
    private(set) var sortedProjects: [Project] = []
    var projects: [Project] = [] {
        didSet { sortedProjects = projects.sorted { $0.criticality > $1.criticality } }
    }   // sorted ONCE, when the data changes — not on every render
}

var body: some View { List(store.sortedProjects) { … } }
```
