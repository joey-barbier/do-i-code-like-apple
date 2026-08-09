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
  - "ForEach\\([^)]*\\.(sorted|filter|grouped|reduce)\\b"
  - "\\.(first|filter|map|contains|count)\\(where:"
---

# Derived data in the body

## Concept

Sorting, filtering, grouping or otherwise deriving collections **in the body**
— directly, in the ForEach collection expression, or in a computed property
the body reads — redoes the work on **every** re-evaluation, including ones
triggered by unrelated state (dismissing an alert, switching tabs). Worse:
the result is a fresh array every time, so `ForEach` re-diffs every row.
Invisible with 6 mock items; a scroll freeze with 200 real ones.

The subtle variant: moving the computation into a computed property on the
view or the model does NOT fix it — computed properties establish
dependencies **transitively** on the stored properties they touch, and still
recompute per read. Only *storing* the derived value does.

## Sub-rules

- **3.1 No non-trivial transforms in body or ForEach expressions** (high,
  GREP). `sorted` / `filter` / element-rebuilding `map` / grouping / dedup in
  the collection expression re-evaluates on every enclosing body run.
- **3.2 Computed properties are the attempted fix that doesn't work** (high,
  JUDGMENT). A computed property over stored inputs recomputes per read AND
  keeps the transitive dependency — the shape *looks* fixed but isn't.
- **3.3 Cache on the model, sync where data changes** (high, GREP positive).
  Store the derived value as its own stored property, maintained via `didSet`
  on the inputs (or in the model's mutating entry points), exposed
  `private(set)`.
- **3.4 View-local derivations: @State + onChange** (med, JUDGMENT). When the
  derived collection is genuinely view-local, cache it in `@State` and update
  it in `onChange(of:)` — never recompute in body.
- **3.5 No collection reach-through in body** (high, GREP). Body expressions
  like `state.users.first(where: { $0.id == id })` or
  `model.items.filter { … }.count` walk (and depend on) the entire
  collection on every evaluation — derive once on the model instead.

## Do NOT flag

- **Cheap inline transforms**: a small fixed slice, `prefix(n)`, a trivial
  map over an already-prepared array — fine, no finding.
- **`sorted` / `filter` in a model or engine layer** (outside any SwiftUI
  body): that is exactly where the work belongs.
- A `.filter` over 3 items in a leaf view is not a hot path; prioritize main
  lists, dashboards, and counters read by containers (TabView badge).

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

## Reference

- https://developer.apple.com/documentation/swiftui/managing-model-data-in-your-app
- https://developer.apple.com/documentation/swiftui/foreach
