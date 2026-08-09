---
axis: 2
id: foreach-identity
title: "ForEach identity — stable, unique, cheap ids"
severity: high
patterns:
  - "id:\\s*\\\\\\.self"
  - "ForEach\\([^)]*\\.indices"
  - "ForEach\\(0\\s*\\.\\.<"
  - "id:\\s*\\\\\\.offset"
  - "ForEach\\(\\s*Array\\("
  - "\\.enumerated\\(\\)"
  - "ForEach\\([^)]*\\.map\\s*\\{"
  - "var\\s+id\\s*:\\s*Self\\s*\\{"
  - "List\\([^)]*,\\s*id:"
  - "OutlineGroup\\("
---

# ForEach identity

## Concept

Every data-driven container identifies elements by an id. That id must be
**stable** (the same element keeps the same id across body evaluations, even
if its position changes), **unique** (no two elements share one), and
**cheap** (hashing cost is paid on every diff). Get it wrong and SwiftUI
cannot match rows across renders: per-row `@State` resets, focus, selection
and scroll positions are lost, insertions animate as full replacements, and
far more re-rendering happens than needed.

Rule of thumb: whenever an API takes a collection, the per-element id must be
stable, unique, independent of position AND of mutable content.

## Sub-rules

- **2.1 Stable and unique** (high, JUDGMENT). Identity travels with the
  element, not with its position or its editable content. Watch keypaths like
  `\.title` / `\.name` — two elements can collide.
- **2.2 Never indices as identity** (high, GREP). `ForEach(items.indices,
  id: \.self)`, `ForEach(0..<items.count)` — indices are positions: inserting
  at the head shifts every id. Indexing back into the array from the loop
  variable (`items[index]`) additionally couples every row to the whole
  collection (see axis 4).
- **2.3 enumerated discipline** (high/med, GREP). Never `id: \.offset`. With
  `.enumerated()`, use `id: \.element.id` and treat the index as ordinary row
  data. On Swift 6.1+ pass `items.enumerated()` directly — an `Array(…)`
  wrapper eagerly copies the collection every body evaluation.
- **2.4 Never mint values (or ids) inside body** (high, GREP + JUDGMENT).
  Mapping to freshly constructed Identifiable values in the collection
  expression hands every element a brand-new default `UUID()` id per pass —
  the whole list re-identifies each render. `let id = UUID()` as a default is
  fine in itself; the bug is constructing the value somewhere it doesn't
  outlive the body. Tie ids to something that persists (`@State`, an
  `@Observable` model, a database row); synthesize ids once, in the model
  layer; prefer natural keys (database id, server id, file URL).
- **2.5 Never derive id from mutable content** (high, GREP). `var id: String
  { title }` over a `var title` means editing the element destroys and
  recreates its row mid-edit. Operative test: "if I edit this element in
  place, does its id change?" — yes = wrong. Derive identity from an
  immutable (`let`) property; the id changes only when it is genuinely a
  different element.
- **2.6 `id: \.self` and whole-value hashing** (high, GREP). `id: \.self` on
  a multi-field Hashable struct hashes every field of every element on every
  enclosing body evaluation (cost = collection size × field count) — and
  editing an element reads as delete+insert. Same for `var id: Self { self }`.
  Prefer small primitive ids: UUID, Int, short String, URL.
- **2.7 Prefer Identifiable conformance** (med, GREP + JUDGMENT). One
  conformance beats repeating `id:` keypaths at every call site, and unlocks
  `List`, `sheet(item:)`, `confirmationDialog(presenting:)` and navigation
  values for free.
- **2.8 Applies to every collection API** (high→med, GREP). The same identity
  rules govern `List(_:id:)` and row-content inits, selection-aware List
  overloads, `Table` (with or without selection), `OutlineGroup` /
  `List(children:)`, `Picker` with an inner ForEach, and `DisclosureGroup`
  content.

## Do NOT flag

- **`.enumerated()` itself** — displaying a position number is legitimate;
  the finding is only using the offset as *identity*.
- **`Array(items.enumerated())` on toolchains before Swift 6.1** — the
  wrapper was required there; check the toolchain before flagging.
- **Explicit `id:` keypath instead of Identifiable** when the type isn't
  yours or the natural id lives elsewhere — acceptable, not a finding.
- **`id: \.self` on small immutable, guaranteed-unique values** — enum cases
  of a `CaseIterable`, a fixed set of tab descriptors. Minor note at most.
- **Don't attack the Hashable conformance** when the id choice is the
  problem — the conformance may serve selection sets or navigation; fix the
  ID, keep the conformance.
- **Don't force Identifiable onto types without a meaningful identity** — an
  explicit keypath is the honest choice there.

## 5-minute fix

Before:

```swift
ForEach(tags, id: \.self) { tag in TagChip(tag) }          // value = identity
ForEach(0..<items.count) { i in ItemRow(items[i]) }        // position = identity
```

After:

```swift
struct Tag: Identifiable { let id: UUID; var label: String }

ForEach(tags) { tag in TagChip(tag) }                      // stable id, for free
ForEach(items) { item in ItemRow(item) }
```

## Reference

- https://developer.apple.com/documentation/swiftui/foreach
- https://developer.apple.com/documentation/swift/identifiable
