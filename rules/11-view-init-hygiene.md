---
axis: 11
id: view-init-hygiene
title: "View init hygiene — init is a constant-time copy"
severity: high
patterns:
  - "init\\([^)]*\\)\\s*\\{[^}]*(load|fetch|request)"
  - "JSONDecoder\\(\\)"
  - "\\.decode\\("
  - "FileManager|contentsOfFile|Data\\(contentsOf:"
  - "DateFormatter\\(\\)"
  - "NumberFormatter\\(\\)"
  - "\\.string\\(from:"
  - "Text\\(\\w+,\\s*format:"
---

# View init hygiene

## Concept

A view's `init` runs on **every evaluation of the parent's body** — in a
List, a LazyVStack, during scrolling or an animation, that can be many times
per second. `init` is NOT a one-time setup hook (that intuition comes from
classes and UIKit). The only correct init is a constant-time copy of inputs
into stored properties; any real work there is multiplied by the render rate.

## Sub-rules

- **11.1 init = constant-time copy** (high, JUDGMENT). Anything beyond
  assigning parameters to stored properties deserves a look.
- **11.2 No loading** (high, GREP). `load` / `fetch` / `request` calls in a
  view init — move to `.task` or the model layer.
- **11.3 No decoding** (high, GREP). `JSONDecoder()` / `.decode(` in init —
  decode in the model layer; the view takes the already-decoded value.
- **11.4 No file system** (high, GREP). `FileManager`, `contentsOfFile`,
  `Data(contentsOf:)` in init.
- **11.5 No formatter allocation or eager formatting** (high, GREP).
  `DateFormatter()` / `NumberFormatter()` / `.string(from:)` in init — and
  instead of pre-formatted String inputs, prefer `Text(value, format:)`
  which is cached and locale-aware (see axis 6).
- **11.6 No large allocations** (med, JUDGMENT). Big buffers, big
  collections built in init — same multiplication.
- **11.7 Take prepared values; derive once elsewhere** (high/med, JUDGMENT).
  Inputs arrive ready to render; a derived value needed once per view
  lifetime lives on a `@State`-owned `@Observable` model or is computed in
  `.task`.

## Do NOT flag

- Plain stored-property assignment, cheap literal defaults, `@State` initial
  values that are literals or trivial constructions.
- Formatters held as `static let` at type level (allocated once) — that IS
  the fix for pre-format-style code; the finding is per-init allocation.
- `JSONDecoder()` / `FileManager` in model-layer types, `.task` closures, or
  preview/fixture code — the rule is about View inits only.
- An explicit init that only forwards to stored properties to control access
  levels.

## 5-minute fix

Before:

```swift
struct PriceTag: View {
    let text: String
    init(price: Decimal) {
        let f = NumberFormatter()          // allocated on EVERY parent body pass
        f.numberStyle = .currency
        text = f.string(from: price as NSNumber) ?? ""
    }
    var body: some View { Text(text) }
}
```

After:

```swift
struct PriceTag: View {
    let price: Decimal                     // constant-time copy
    var body: some View {
        Text(price, format: .currency(code: "EUR"))   // cached, locale-aware
    }
}
```

## Reference

- https://developer.apple.com/documentation/swiftui/view
- https://developer.apple.com/documentation/swiftui/text/init(_:format:)
