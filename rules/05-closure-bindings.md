---
axis: 5
id: closure-bindings
title: "Bindings — closures vs KeyPath"
severity: medium
patterns:
  - "Binding\\(get:"
  - "Binding\\($"
  - "Binding<[^>]*>\\("
reference: "Apple, data flow: closure bindings heap-allocate on every body evaluation and hide dependencies; prefer $property, KeyPath and subscripts."
link: "https://developer.apple.com/documentation/swiftui/binding"
---

# Bindings: closures vs KeyPath

## The concept

`Binding(get:set:)` builds a binding out of **two closures heap-allocated on
every body evaluation**. Beyond the cost, these bindings are opaque: SwiftUI
cannot compare two closures, so it can never determine that "nothing changed".

Bindings derived by projection (`$store.field`, `$item.name`), by KeyPath or
by subscript (`$store.values[id]`) are lightweight, comparable structures.

## Detection (scan)

- Patterns: `Binding(get:` on one line, or `Binding(` at end of line (the
  multi-line form, the most common — check that the next line is `get:`).
- **Judgment**: a closure binding on a cold path (a settings sheet) is a minor
  finding. In a repeated component (every list row) or a container (TabView
  selection), it is a real per-frame cost.

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
