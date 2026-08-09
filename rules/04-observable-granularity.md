---
axis: 4
id: observable-granularity
title: "@Observable — granularity, Equatable, narrow inputs"
severity: high
patterns:
  - "@Observable"
  - ":\\s*ObservableObject"
  - "@Published"
  - "@StateObject"
  - "@ObservedObject"
  - "@EnvironmentObject"
  - "@State\\s+var\\s"
  - "let\\s+index\\s*:\\s*Int"
  - "\\.onChange\\(of:"
---

# @Observable: granularity, Equatable, narrow inputs

## Concept

How a view receives data determines how often it re-renders. Value-type
inputs are compared field by field — the input's shape IS the invalidation
surface. Reference types compare by pointer identity, and `@Observable`
tracks reads **per property of the class**: reading `model.title` depends on
`title` only, but the granularity stops at the property — a struct-, Array-,
Dictionary- or Set-typed property is one dependency on the entire value.
Most granularity bugs are one read pulling too much, not too many reads.

## Sub-rules

- **4.1 @Observable over ObservableObject** (high, GREP).
  `ObservableObject` / `@Published` / `@StateObject` / `@ObservedObject` /
  `@EnvironmentObject` invalidate coarsely through `objectWillChange`;
  `@Observable` tracks per property. Migrate.
- **4.2 @MainActor on observable models** (high, GREP + build settings).
  Unless the project sets default MainActor isolation
  (`SWIFT_DEFAULT_ACTOR_ISOLATION`), an `@Observable` class written from
  background tasks races main-actor body reads — a data-race bug, not a perf
  nicety; Swift 6 strict concurrency flags it. Note: `@Observable` is not
  supported on actor types.
- **4.3 Equatable property types** (med, GREP + JUDGMENT). The generated
  setter can only skip invalidation (`new == current`) when the property type
  is Equatable. Biggest win for properties written frequently with the same
  value (polling, streaming, timers). Collections too: a non-Equatable
  *element* type makes every collection assignment invalidate. Applies on
  every OS release that has `@Observable` — no availability hedging needed.
- **4.4 Flatten hot structs** (high, GREP two-level access). A single stored
  struct on the model (`session.user`) makes `session.user.name` a dependency
  on ALL of `user`. Flatten hot fields into individual properties; if the
  struct must round-trip (API payloads), keep both — the struct for
  round-tripping plus individual properties synced via `didSet`.
- **4.5 Narrow value inputs** (high, JUDGMENT). Pass views only the data they
  read — the field, not the whole struct; applies to top-level screens too.
  Large value payloads are walked field-by-field on every parent body pass:
  keep payloads in the model layer, break them into per-view structs, or
  hold them in an `@Observable` model and pass the model — but then beware
  compound properties (sub-rule 4.4) and collection reads (axis 3.5).
- **4.6 Rows never reach back into the collection** (high, GREP). A row view
  taking the model + an index/key (`state.items[index]`) depends on the whole
  collection — every row re-renders on any element change. Single-field rows:
  pass the field. Multi-field rows: a per-element `@Observable` class, pass
  the instance.
- **4.7 Per-element models must be persisted** (high, GREP). Vending fresh
  per-element instances from a computed `var items: [RowModel] { data.map {
  RowModel($0) } }` hands every row a new reference each pass — total defeat.
  The parent must own and persist the instances.
- **4.8 @State is private** (med, GREP). `@State var` without `private` is a
  smell — it invites external writes that fight the framework's ownership.
  If access is deliberately non-private, recommend, don't auto-change.
- **4.9 Side-effect-only dependencies move to a ViewModifier** (high, GREP +
  JUDGMENT). A dependency read ONLY to feed `.onChange(of:)` still
  invalidates the whole body. Extract the onChange AND its observed
  dependency into a dedicated ViewModifier + View extension — several side
  effects can share one modifier.

## Do NOT flag

- **Reference-type inputs**: the narrow-inputs rule largely does NOT apply to
  a view taking a whole `@Observable` class — per-property tracking already
  narrows it. Don't flag that.
- **Forwarding counts as reading**: a parent taking 5 fields and forwarding
  each to the right subview is correctly factored — not over-subscription.
- **Several narrow reads from one model** in one view is NOT
  over-subscription; don't propose splitting into per-property subviews.
- **The list view itself** legitimately depends on the whole collection it
  iterates — that dependency is the point.
- **The onChange extraction (4.9)** applies only when (a) the dependency is
  read solely for the side effect AND (b) the parent body is non-trivial.
  If the value is also rendered, or the body is already tiny, leave it.
- **Deliberately non-private @State with a comment** — recommend, never
  auto-change.

## 5-minute fix

Before:

```swift
struct DetailState { var isLoading = false; var items: [Item] = []; var page = 0 }
@Observable final class Store { var detailState = DetailState() }
// "Load more" (page += 1) ALSO re-renders the view that only reads isLoading
```

After:

```swift
@Observable final class Store {
    var isLoadingDetail = false            // fine-grained, per-field dependencies
    var detailItems: [Item] = []
    var detailPage = 0
}
// struct kept only if it must round-trip — then sync via didSet
```

## Reference

- https://developer.apple.com/documentation/observation
- https://developer.apple.com/documentation/swiftui/migrating-from-the-observable-object-protocol-to-the-observable-macro
