---
axis: 14
id: sdk27-readiness
title: "SDK 27 readiness — one live bug, nine future breaks"
severity: high
patterns:
  - "@State\\s+(private\\s+)?var\\s+\\w+(\\s*:\\s*[^=\\n]+)?\\s*=\\s*"
  - "@State\\s+@\\w+|@\\w+\\s+@State"
  - "self\\.init\\("
  - "\\.(overlay|background)\\(\\s*(Color|Gradient|Material|\\.\\w+)[^)]*\\.(opacity|blendMode)\\("
  - "TupleView<"
  - "Group\\s*\\{\\s*\\}"
  - "\\.statusBarHidden\\("
  - "public\\s+struct\\s+(Color|Text|Image|Font|Label|Group|Section)\\b"
---

# SDK 27 readiness

## Concept

SwiftUI's SDK 27 turns `@State` into a macro and view builders into
`@ContentBuilder` — most code compiles unchanged, but a small set of shapes
break, and **one of them is a live correctness bug on today's SDKs**, not a
future problem. This axis checks what is checkable NOW; it deliberately does
NOT reward adopting 27-only APIs (see Do NOT flag).

## Sub-rules

- **14.1 THE live bug: assigning an initialized @State in init** (high,
  GREP cross-ref). `@State var counter = 0` plus `init { self.counter = 42 }`
  **silently renders 0 today** on SDK ≤ 26 — the body sees the declaration
  value, the init assignment is lost. This is a current correctness bug in
  shipping code, the single most valuable check of the axis. Detection:
  `@State … = expr` whose enclosing type's init also assigns `self.<name> =`.
- **14.2 The same shape breaks compilation on 27** (high, same GREP). Under
  the macro it becomes "used before initialized" when the @State is assigned
  before other stored properties. Fix for both: drop the declaration
  initializer and assign ONLY in init — reordering is NOT the fix.
- **14.3 Stacked wrappers on @State** (high, GREP). `@State @Wrapped var …`
  → "invalid redeclaration of synthesized property" under the macro.
- **14.4 Extension inits delegating to the memberwise init** (med, GREP +
  JUDGMENT). `extension SomeView { init(…) { self.init(…) } }` relying on
  the synthesized memberwise init of a View WITH @State — not synthesized
  under the macro.
- **14.5 ShapeStyle modifiers as direct overlay/background arguments** (high,
  GREP). `.overlay(Color.red.opacity(0.4))`, `.background(.thinMaterial
  .blendMode(…))` → "ambiguous use" under `@ContentBuilder`. Fix: the
  trailing-closure form `.overlay { Color.red.opacity(0.4) }`. The most
  common idiom, the most-hit break.
- **14.6 Types shadowing SwiftUI names** (med-high, GREP). A first-party
  module declaring public `Color` / `Text` / `Image` / `Font` / `Label` /
  `Group` / `Section` … creates builder ambiguity once builders are generic
  over content.
- **14.7 Hardcoded `TupleView<` constraints** (med, GREP). Builders return
  `TupleContent` on 27 — generic code constrained to `TupleView` breaks.
- **14.8 Empty builders with MapKit in the module graph** (med, GREP +
  project-wide check). `Group { }` or `#if` without `#else` inside a nested
  builder breaks when the module graph includes MapKit — the FILE does not
  need to import it (transitive visibility).
- **14.9 Deeply branching Chart closures** (med, GREP + count). ≥ 8-10
  inline cases inside `Chart { }` with deployment target < 27 → type-check
  timeout. Affects back-deployed projects, i.e. the majority.
- **14.10 `.statusBarHidden` on visionOS** (low, GREP scoped). The only HARD
  deprecation in SDK 27.0 — a no-op there; delete in visionOS
  targets/regions.

## Do NOT flag

- **Absence of 27-only opt-in APIs is NOT a finding** — never flag code for
  not using: `reorderable()` / reorder containers, `AsyncImage(request:)`
  (nuance: its default HTTP caching is a 27-runtime behavior change —
  mention-only), constrained-space toolbar APIs (`visibilityPriority`,
  overflow menus, pinned placements, minimize behaviors, content margins,
  ForEach in toolbars), `alert/confirmationDialog(item:)`,
  `swipeActionsContainer()` / `onPresentationChanged`.
- **`FileDocument` is CORRECT below target 27** — the
  Readable/WritableDocument family is the 27+ path; flagging FileDocument on
  earlier targets is a false positive.
- **`@ContentBuilder` adoption itself** is not checkable — only its fallout
  (14.5–14.9) is.
- The `@State` initializer pattern alone (declaration initializer, never
  reassigned in init) is completely fine — the finding requires BOTH the
  initializer and the init assignment.

## 5-minute fix

Before:

```swift
struct Counter: View {
    @State private var count = 0
    init(start: Int) { count = start }     // body renders 0 TODAY — silently
    var body: some View { Text("\(count)") }
}
```

After:

```swift
struct Counter: View {
    @State private var count: Int          // no declaration initializer…
    init(start: Int) { _count = State(initialValue: start) }  // …assign only in init
    var body: some View { Text("\(count)") }
}
```

## Reference

- https://developer.apple.com/documentation/swiftui/state
- https://developer.apple.com/documentation/swiftui/migrating-to-new-navigation-types
