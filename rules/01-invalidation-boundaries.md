---
axis: 1
id: invalidation-boundaries
title: "Invalidation boundaries — screen sections"
severity: high
patterns:
  - "(private\\s+)?var\\s+\\w+\\s*:\\s*some View"
  - "func\\s+\\w+\\([^)]*\\)\\s*->\\s*some\\s+View"
  - "@ViewBuilder\\s+(private\\s+)?(func|var)"
  - "private\\s+var\\s+(header|footer|details|metadata|content|toolbar|sections?)\\s*:\\s*some View"
  - "struct\\s+\\w*Detail(View)?\\s*:\\s*View"
---

# Invalidation boundaries

## Concept

A view struct is SwiftUI's unit of invalidation: when state changes, the
framework re-runs the body of the smallest enclosing view that depends on it.
Splitting a screen into sections with computed vars, `@ViewBuilder` helpers or
`func … -> some View` organizes the code, but **not the rendering** — all of
these are inlined into the parent body, so SwiftUI still sees one big body and
re-evaluates the whole screen together. Only a `struct` conforming to `View`
creates a boundary the framework can skip.

## Sub-rules

- **1.1 Sections get their own View structs** (high, JUDGMENT). A screen with
  3+ distinct regions (header / list / footer, or any named sections) should
  compose one `struct … : View` per section. The parent stays thin — it only
  assembles sections.
- **1.2 No computed-var sections** (high, GREP). `private var header: some
  View` and friends are the named anti-shape — especially the classic
  vocabulary: `header`, `footer`, `details`, `metadata`, `content`,
  `toolbar`, `section(s)`.
- **1.3 No @ViewBuilder helper sections** (high, GREP). `@ViewBuilder private
  func/var` helpers have exactly the same problem as computed vars — the
  builder body is inlined into the caller.
- **1.4 Function-shaped sections too** (high, GREP). `func …(…) -> some View`
  is a computed var with parameters; the parameters change nothing about
  invalidation.
- **1.5 The DetailView shape** (high, GREP + JUDGMENT). Any
  `SomethingDetailView` (movie, recipe, article, profile, episode…) built as
  one struct with `private var header/metadata/related` sections is the single
  most common miss — each named section should be its own View type.
- **1.6 Extracted sections take narrow inputs** (high, JUDGMENT). A section
  struct receiving the parent's whole state struct re-invalidates with all of
  it; pass only the fields the section renders (see axis 4 for the
  value-vs-reference nuance).

## Do NOT flag

- **Tiny fragments**: a computed var or small `@ViewBuilder` helper returning
  a trivial fragment (an icon, one static `Text`), possibly reused 2-3 times
  within the same body, is fine — the rule targets factoring done for
  organization or body length, where a real View type is required.
- `var body` itself, obviously — the first pattern matches it by design
  (plain ERE has no lookahead); discard `body` matches mechanically before
  judging.
- `.if`-style `extension View` helpers match the func pattern but belong to
  axis 10 — don't double-count them here.
- A section extracted as a View struct that takes a whole **reference-type**
  model (`@Observable` class) is usually fine — observation tracks
  per-property; the narrow-inputs concern is about large **value** payloads.

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
    struct ScoreSection: View {            // boundary: skipped unless score changes
        let score: Int
        var body: some View { ScoreGauge(score: score) }
    }
}
```

## Reference

- https://developer.apple.com/documentation/swiftui/declaring-a-custom-view
- https://developer.apple.com/documentation/swiftui/view
