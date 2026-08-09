---
axis: 13
id: environment-discipline
title: "Environment discipline — no closures, stable defaults, low frequency"
severity: high
patterns:
  - "@Entry\\s+var\\s+\\w+\\s*:\\s*\\(.*\\)\\s*->"
  - "@Entry\\s+var\\s+\\w+\\s*=\\s*\\w+\\("
  - "@Entry\\s+var\\s+\\w+\\s*=\\s*(Date|UUID)\\(\\)"
  - "struct\\s+\\w+Key\\s*:\\s*EnvironmentKey"
  - "static\\s+var\\s+defaultValue"
  - "\\.environment\\(\\\\\\."
  - "@Environment\\(\\\\\\.\\w+\\)"
  - "onScrollGeometryChange|scrollPosition"
  - "GeometryReader|onGeometryChange"
  - "DragGesture\\(\\)\\.onChanged|TimelineView|CADisplayLink|Timer\\.publish"
---

# Environment discipline

## Concept

The environment is a broadcast medium: **every write to a key propagates to
the whole subtree**, and every reader of ANY key re-reads its own keys when
an ancestor writes. Three consequences: values that can't be compared
(closures) make every re-read look like a change; defaults that re-evaluate
differently per read (fresh allocations, `Date()`) turn fallback reads into
invalidations; and high-frequency values (scroll offset, drag position) turn
the subtree into a per-frame render storm. Struct values compare
field-by-field (Equatable is a fast path, not a prerequisite); class
references compare by pointer — a fresh allocation is never equal.

## Sub-rules

**Closures in the environment**

- **13.1 Never store closures/function values in custom environment keys**
  (high, GREP). Function values can't be compared — every re-read counts as
  changed, and the whole reading subtree invalidates. Applies unconditionally
  (even non-capturing closures) and equally to FocusedValues. NOT fixes:
  wrapping the closure in a struct (still contains a closure, rebuilt per
  pass), or hoisting it to a stored property on the View (structs
  re-instantiate freely).
- **13.2 Defunctionalize** (high→med, JUDGMENT). The real fix eliminates the
  closure: data as properties, behavior as a method or `callAsFunction`.
  Fix A — a struct with `callAsFunction` (captured values become stored
  properties, constructed at the injection site); choose it for stateless,
  self-contained, open-ended actions. Fix B — an `@Observable` model holding
  the action (captured `@State` moves INTO the model), injected via
  `.environment(model)`, read via `@Environment(Type.self)`; choose it when
  the action coordinates with shared state or the handler set is closed.
  Per-site implementations → a protocol as the entry type with concrete
  conforming structs.

**High-frequency values**

- **13.3 Keep high-frequency values out of the environment** (high, GREP +
  JUDGMENT). Near any `.environment(\.…)` write, flag these sources:
  `scrollPosition` / `onScrollGeometryChange`, `GeometryReader` /
  `onGeometryChange`, `DragGesture().onChanged`, `TimelineView` /
  `CADisplayLink`, `Timer.publish`, hover/pointer location. Store them in an
  `@Observable` instead — and note that migrating to `@Observable` while
  rows still read the RAW value fixes nothing: the invalidation count is
  unchanged. The work happens at the model.
- **13.4 Coarsen what views read** (high, GREP positive + JUDGMENT). The
  discriminating question is the granularity of the value the view READS:
  prefer coarsened booleans (`isWide = width > 600`, maintained in a
  `didSet`) over point-precise values. Per-item scroll state → each item its
  own `@Observable` tracking only that item (a row then invalidates at most
  twice: enter/leave); a shared `Set<Int>` of visible indices is better than
  raw offsets but still invalidates every reader on any change. Purely
  visual scroll effects belong in `scrollTransition` / `visualEffect(in:)`
  (renderer-side, no body re-evaluation) — but those don't replace coarsened
  models when scroll state drives non-rendering logic.

**Default-value stability**

- **13.5 Defaults must be stable** (high, GREP). A key's default expression
  re-evaluates on EVERY fallback read — `@Entry` always wraps its initializer
  in a computed getter, so `@Entry var model = Model()` allocates per read;
  manual keys with `static var defaultValue: T { … }` (computed) are the
  same bug. Red flags: any constructor call producing a fresh reference,
  `Date()`, `UUID()`, random values — anything answering YES to the
  operative test: *"does this expression return a different result between
  calls?"* (NOT "is it Equatable?", NOT "does it contain a class?"). An
  ancestor write to any key then hands fallback readers a different value
  each time = invalidation. Distinguish LIVE vs LATENT (all readers covered
  by an upstream `.environment` write = latent; same fix, calmer framing).
  NOT a fix: a degenerate `==` — the expression still re-evaluates and two
  fallback readers still get different instances.
- **13.6 The three fixes, chosen by what readers do** (high, GREP positive +
  JUDGMENT). Sentinel checks in readers (`isEmpty`, `== .none`, magic
  values) → **C**: `@Entry` with Optional type and no initializer (defaults
  nil), readers rewritten to `if let`. Otherwise **A**: back the default
  with a `private static let` referenced from the `@Entry` initializer
  (short defaults, keeps `@Entry` syntax) or **B**: manual EnvironmentKey
  with a STORED `static let defaultValue` (complex defaults, multiple use
  sites) — within B, never a computed `static var`. Fixing invalidation
  while keeping a sentinel is a worse design half-fixed — make the call from
  the readers, don't list options.
- **13.7 Prefer @Entry over manual keys** (high/med, GREP). Manual
  `EnvironmentKey` conformances with get/set computed properties → `@Entry`
  (one line, applies to Environment/Transaction/ContainerValues/
  FocusedValues; FocusedValues entries can't have custom defaults — they
  MUST be Optional). This refactor is a top-line finding, recommended
  without availability hedging (one-line caveat at most) — but show the
  diff, don't perform sweeping rewrites unprompted.

**Dead reads**

- **13.8 Unused @Environment(\.keyPath) reads** (high, GREP + JUDGMENT).
  Declaring `@Environment(\.key)` subscribes the view even if body never
  uses it — pure overhead on every ancestor write; same for `@FocusedValue`.
  Check usage including the projected `_name` form and computed
  properties/methods the body calls, then delete. Removal is an ACTIVE perf
  fix. The type-based form `@Environment(Model.self)` is different:
  declared-but-unused registers NO dependency (property-level tracking) —
  removing it is dead-code cleanup, not perf; don't oversell it (its only
  live cost is an unstable default on its entry).

## Do NOT flag

- **Framework action types** — `OpenURLAction`, `DismissAction`,
  `RefreshAction` and their keys are DESIGNED to wrap closures; never
  propose defunctionalizing them.
- **Already-stable defaults**: literals, enum cases without associated
  values, `nil`, references to a stable instance (`static let`, module-level
  `let`, a DI'd singleton) — a struct field holding a reference is NOT a red
  flag when the source is stable (same pointer every call), and a struct
  built inline from deterministic arguments is stable without being
  Equatable. Don't add memoization or Equatable "for safety" to a default
  that is already stable — defensive refactors are noise.
- **Entry optionality is per-context** — no blanket "make it optional";
  Optional is fix C's tool, chosen by the sentinel diagnostic.
- **`@Environment(Model.self)` declared-but-unused** — no dependency
  registered; report as cleanup, never as a perf finding.
- **@MainActor on defunctionalization models** is a defensive default — may
  be omitted when the model is only touched from bodies; don't flag its
  absence as a race (contrast with axis 4.2, where background writes exist).

## 5-minute fix

Before:

```swift
extension EnvironmentValues {
    @Entry var onItemTap: (Item) -> Void = { _ in }   // closure key: subtree invalidates per pass
    @Entry var theme = Theme()                        // fresh instance per fallback read
}
```

After:

```swift
struct ItemTapAction {                                 // defunctionalized: comparable data
    let coordinator: Coordinator
    func callAsFunction(_ item: Item) { coordinator.open(item) }
}
extension EnvironmentValues {
    @Entry var itemTap: ItemTapAction? = nil           // fix C: optional, no sentinel
    private static let defaultTheme = Theme()
    @Entry var theme = Self.defaultTheme               // fix A: stable stored default
}
```

## Reference

- https://developer.apple.com/documentation/swiftui/environmentvalues
- https://developer.apple.com/documentation/swiftui/entry()
- https://developer.apple.com/documentation/swiftui/environment
