---
axis: 4
id: observable-granularity
title: "@Observable — Equatable and granularity"
severity: medium
patterns:
  - "@Observable"
reference: "Apple, Observation: the setter can only skip invalidation when the property type is Equatable; reading one field of a struct = depending on the whole struct."
link: "https://developer.apple.com/documentation/observation"
---

# @Observable: Equatable and granularity

## The concept

Two under-known mechanics of `@Observable`:

1. **Equatable**: when you assign a property, Observation can only skip the
   invalidation (`new value == old value`) **if the type is `Equatable`**.
   A non-Equatable state struct → every `set` invalidates subscribers, even
   when nothing changed.

2. **Struct granularity**: observation tracks properties of the **observable
   class**. Reading `store.detailState.isLoading` creates a dependency on
   `detailState` **as a whole**: changing any other field of that struct
   re-renders the view.

## Detection (scan)

- Locate `@Observable` classes, list their properties of custom struct types,
  check whether those structs are `Equatable` (or `Hashable`).
- **Judgment**: spot big catch-all state structs read by several views —
  candidates for flattening into separate properties.

## 5-minute fix

Before:

```swift
struct DetailState { var isLoading = false; var items: [Item] = []; var page = 0 }
@Observable final class Store { var detailState = DetailState() }
// "Load more" (page += 1) ALSO re-renders the view that only reads isLoading
```

After:

```swift
struct DetailState: Equatable { … }        // 1 word: equal sets no longer re-render
// and for hot fields read by different views: flatten
@Observable final class Store {
    var isLoadingDetail = false            // fine-grained, per-field dependencies
    var detailItems: [Item] = []
    var detailPage = 0
}
```
