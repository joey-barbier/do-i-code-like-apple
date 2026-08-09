---
axis: 7
id: deprecated-apis
title: "Soft-deprecated APIs"
severity: low
patterns:
  - "NavigationView"
  - "\\.foregroundColor\\("
  - "\\.cornerRadius\\("
  - "navigationBarItems"
  - "presentationMode"
  - "\\.accentColor\\("
  - "isActive:"
reference: "Apple: NavigationView → NavigationStack; foregroundColor → foregroundStyle; cornerRadius → clipShape(.rect(cornerRadius:)); navigationBarItems → toolbar; presentationMode → dismiss."
link: "https://developer.apple.com/documentation/swiftui/migrating-to-new-navigation-types"
---

# Soft-deprecated APIs

## The concept

SwiftUI deprecates gently: old APIs sometimes compile without warnings for
years, but no longer receive new behaviors (hierarchical styles, typed
deep-links, transitions). Leaning on them accrues silent migration debt.

| Deprecated | Replacement |
|---|---|
| `NavigationView` | `NavigationStack` / `NavigationSplitView` |
| `.foregroundColor(_:)` | `.foregroundStyle(_:)` |
| `.cornerRadius(_:)` | `.clipShape(.rect(cornerRadius:))` |
| `.navigationBarItems(…)` | `.toolbar { … }` |
| `@Environment(\.presentationMode)` | `@Environment(\.dismiss)` |
| `.accentColor(_:)` | `.tint(_:)` |
| `NavigationLink(…, isActive:)` | value pushed onto a `NavigationPath` |

## Detection (scan)

- Direct patterns, highly reliable. `isActive:` needs a glance (could be a
  custom parameter) — confirm it belongs to a `NavigationLink`.

## 5-minute fix

Before:

```swift
NavigationView {
    Text(title).foregroundColor(.secondary).cornerRadius(8)
}
```

After:

```swift
NavigationStack {
    Text(title).foregroundStyle(.secondary)
        .clipShape(.rect(cornerRadius: 8))
}
```
