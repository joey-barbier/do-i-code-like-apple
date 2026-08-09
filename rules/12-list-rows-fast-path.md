---
axis: 12
id: list-rows-fast-path
title: "List rows — keep the unary fast path"
severity: high
patterns:
  - "var body: some View \\{\\s*$"
  - "AnyView\\("
  - "->\\s*AnyView"
  - "-LogForEachSlowPath"
---

# List rows: keep the unary fast path

## Concept

List and the lazy containers have a fast path: when every row is **unary**
(the row builder produces exactly ONE top-level view per element), row
identities can be templated from element ids without running row bodies.
A row whose builder can produce zero, several, or differently-shaped
top-level views defeats that — the container must run bodies to count views.
The row's *content* can branch freely; the branching just has to live INSIDE
a single root container.

## Sub-rules

- **12.1 Unary rows** (high, JUDGMENT). One top-level view per row element —
  "multi" means several top-level views, or branching between shapes at the
  top level. Each row's builder must produce the SAME constant number of
  top-level views for every element.
- **12.2 No bare top-level `switch` in a row body** (high, GREP multi-line).
  `var body: some View { switch … }` = one shape per case = non-unary.
  Fix: wrap the switch in a single-root container (VStack/HStack/ZStack or a
  custom container).
- **12.3 No bare top-level `if/else` either** (high, GREP + JUDGMENT). Same
  mechanics; for List rows the usual fix is wrapping the body in a VStack.
- **12.4 `if` WITHOUT `else` = non-constant count** (high, JUDGMENT). A
  top-level `if` alone produces 0-or-1 views — the count changes per
  element. Optional interior content → wrap in a single-root container;
  "skip this element" intent → filter BEFORE the ForEach, never a zero-view
  row.
- **12.5 Never AnyView rows** (high, GREP). `AnyView(` as a ForEach/List row
  erases structural identity and defeats id templating — worst as a row in
  List, where the cost scales with row count. The `func rowView(for:) ->
  AnyView` switch helper is the same finding. Fix: a concrete row view whose
  body has the switch inside a single-root container.
- **12.6 Group and ForEach are passthroughs** (med, GREP + JUDGMENT).
  `Group { A(); B(); C() }` contributes THREE top-level views, not one —
  wrapping in Group does not make a row unary.
- **12.7 Anti-fixes** (med, JUDGMENT). Swapping AnyView for a `@ViewBuilder
  … -> some View` helper whose body is still a bare switch changes nothing —
  still multi-shape. Flattening a switch into one shape with conditional
  modifiers only works while the cases genuinely share a top-level shape.
- **12.8 Diagnostic** (low, GREP scheme files). The launch argument
  `-LogForEachSlowPath YES` logs non-constant row builders in lazy
  containers — suggest it when findings here are uncertain.

## Do NOT flag

- Bare `switch`/`if` bodies in views that are NOT rows of a List/ForEach/
  lazy container — the fast path concern is container rows; an ordinary
  screen-level view may branch at the top level legitimately (though axis 10
  identity rules still apply to its state).
- Branching INSIDE a single root container — that is exactly the prescribed
  shape, not a finding.
- `Group` used for its real purposes (see axis 15's blessed exceptions).
- `AnyView` outside row/identity-sensitive positions (e.g. a type-erased
  return in rarely-evaluated plumbing) — cost exists but is not this axis's
  fast-path defeat; judge separately.

## 5-minute fix

Before:

```swift
struct FeedRow: View {
    let item: FeedItem
    var body: some View {
        switch item.kind {                 // bare switch: one shape per case
        case .text: TextCard(item)
        case .photo: PhotoCard(item)
        }
    }
}
```

After:

```swift
struct FeedRow: View {
    let item: FeedItem
    var body: some View {
        VStack {                           // single root: row stays unary
            switch item.kind {
            case .text: TextCard(item)
            case .photo: PhotoCard(item)
            }
        }
    }
}
```

## Reference

- https://developer.apple.com/documentation/swiftui/list
- https://developer.apple.com/documentation/swiftui/foreach
