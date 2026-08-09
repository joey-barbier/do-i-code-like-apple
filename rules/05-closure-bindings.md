---
axis: 5
id: closure-bindings
title: "Bindings — projections over closures"
severity: medium
patterns:
  - "Binding\\(get:"
  - "Binding\\($"
  - "Binding<[^>]*>\\("
  - "@Bindable"
---

# Bindings: projections over closures

## Concept

`Binding(get:set:)` builds a binding out of **two closures heap-allocated on
every body evaluation**. Beyond the cost, closure bindings are opaque: SwiftUI
cannot compare two closures, so it can never conclude "nothing changed".
Bindings derived by projection (`$store.field`, `$item.name`), by KeyPath or
by subscript are lightweight, comparable structures — always prefer them.

## Sub-rules

- **5.1 No Binding(get:set:)** (high, GREP). Replace with a projected
  binding. Patterns: `Binding(get:` on one line, or `Binding(` at end of line
  (the common multi-line form — check the next line is `get:`).
- **5.2 No suitable KeyPath? Create a subscript** (med, JUDGMENT). When the
  model has no addressable property for the projection, add a
  labeled-argument subscript on the model as a functional projection —
  `$store[itemID: id]` — instead of falling back to closures.
- **5.3 @Bindable for plain models** (med, GREP positive). Inside a body,
  `@Bindable var model = model` projects bindings from a plain `let`/`var`
  `@Observable` reference.

## Do NOT flag

- A closure binding on a genuinely cold path (a settings sheet shown once) is
  a minor note, not a headline finding. In a repeated component (every list
  row) or a container (TabView selection), it is a real per-frame cost.

## 5-minute fix

Before:

```swift
TabView(selection: Binding(
    get: { store.selectedTab },
    set: { store.selectedTab = $0 }
)) { … }
```

After:

```swift
@Bindable var store: AppStore          // inside a View body
TabView(selection: $store.selectedTab) { … }
```

## Reference

- https://developer.apple.com/documentation/swiftui/binding
- https://developer.apple.com/documentation/swiftui/bindable
