---
axis: 1
id: invalidation-boundaries
title: "Invalidation boundaries — screen sections"
severity: high
patterns:
  - "(private\\s+)?var\\s+(?!body\\b)\\w+\\s*:\\s*some View"
reference: "Apple, SwiftUI structuring guidance: a computed property « does not introduce its own invalidation boundary » — it is inlined into the parent body."
link: "https://developer.apple.com/documentation/swiftui/declaring-a-custom-view"
---

# Invalidation boundaries

## The concept

Splitting a screen into sections with computed vars (`private var header: some View`)
organizes the code, but **not the rendering**. A computed var is inlined into the
parent body: SwiftUI sees one big body. Whenever any piece of state read by the
screen changes, **the whole screen re-evaluates**, sections included.

Each `struct` conforming to `View` is, by contrast, an invalidation boundary:
SwiftUI compares its inputs and skips re-evaluating subviews whose inputs did
not change.

## What Apple says

> A computed property does not introduce its own invalidation boundary.
> Extract sections into their own `View` structs so SwiftUI can skip
> re-evaluating the ones whose inputs didn't change.

## Detection (scan)

- Pattern: computed vars typed `some View` other than `body`.
- **Ambiguous case (judgment)**: a computed var returning something trivial
  (an icon, a static `Text`) is harmless. The issue is **sections that read
  state** (store, @State, @Binding) inside screens that read a lot of it.

## 5-minute fix

Before:

```swift
struct ReleaseDetail: View {
    let release: Release
    var body: some View {
        VStack { header; scoreSection; cveList }
    }
    private var scoreSection: some View {
        ScoreGauge(score: release.score)   // re-evaluated with the WHOLE screen
    }
}
```

After:

```swift
struct ReleaseDetail: View {
    let release: Release
    var body: some View {
        VStack { header; ScoreSection(score: release.score); cveList }
    }
    struct ScoreSection: View {            // boundary: only re-evaluates when score changes
        let score: Int
        var body: some View { ScoreGauge(score: score) }
    }
}
```
