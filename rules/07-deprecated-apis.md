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

| Deprecated | Replacement | Doc (per family) |
|---|---|---|
| `NavigationView` | `NavigationStack` / `NavigationSplitView` | [Migrating to new navigation types](https://developer.apple.com/documentation/swiftui/migrating-to-new-navigation-types) |
| `NavigationLink(…, isActive:)` | value pushed onto a `NavigationPath` | [Migrating to new navigation types](https://developer.apple.com/documentation/swiftui/migrating-to-new-navigation-types) |
| `.foregroundColor(_:)` | `.foregroundStyle(_:)` | [foregroundStyle(_:)](https://developer.apple.com/documentation/swiftui/view/foregroundstyle(_:)) |
| `.cornerRadius(_:)` | `.clipShape(.rect(cornerRadius:))` | [clipShape(_:style:)](https://developer.apple.com/documentation/swiftui/view/clipshape(_:style:)) |
| `.accentColor(_:)` | `.tint(_:)` | [tint(_:)](https://developer.apple.com/documentation/swiftui/view/tint(_:)-93mfq) |
| `.navigationBarItems(…)` | `.toolbar { … }` | [toolbar(content:)](https://developer.apple.com/documentation/swiftui/view/toolbar(content:)-5w0tj) |
| `@Environment(\.presentationMode)` | `@Environment(\.dismiss)` | [dismiss](https://developer.apple.com/documentation/swiftui/environmentvalues/dismiss) |

When reporting a finding, link the doc of its **family** (navigation /
styling / presentation) — most real-world findings are styling
(`foregroundColor`, `cornerRadius`), so don't send everyone to the
navigation migration guide.

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
