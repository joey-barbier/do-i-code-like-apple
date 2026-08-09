---
axis: 10
id: conditional-modifiers
title: "Conditional modifiers — the .if pattern"
severity: high
patterns:
  - "func\\s+`if`"
  - "\\.if\\("
  - "@ViewBuilder\\s+func\\s+(when|applyIf|conditional)"
---

# Conditional modifiers: the `.if` pattern

## Concept

The viral helper:

```swift
extension View {
    @ViewBuilder func `if`<T: View>(_ condition: Bool, transform: (Self) -> T) -> some View {
        if condition { transform(self) } else { self }
    }
}
```

looks elegant, but the ViewBuilder's `if/else` produces two branches of
different view types — **two structural identities**. Every time the
condition flips: the view is treated as destroyed and replaced, `@State`
anywhere in the subtree resets, and instead of animating the property change
SwiftUI performs a remove+insert (broken animations, scroll resets, phantom
transitions).

## Sub-rules

- **10.1 Never write a `.if`-style conditional modifier** (high, GREP).
  ``func `if` ``, `.if(`, and `when`/`applyIf`/`conditional` helpers wrapping
  `transform(self)/self` — all the same shape.
- **10.2 The ternary is THE fix** (high, GREP positive). A modifier that is
  **always applied** with a conditional *value* keeps identity stable and
  animates smoothly: `.foregroundStyle(isOn ? .red : .primary)`,
  `.opacity(isVisible ? 1 : 0)`. No "inert modifier" alternative exists —
  the ternary inside the argument is the prescribed replacement.
- **10.3 Process guard: never rip out an existing `.if` in passing** (high,
  JUDGMENT). Removing or refactoring a `.if` found in a codebase is a
  behavior change and out of scope for an unrelated edit — POINT IT OUT
  (with the risks and the ternary alternative), don't silently rewrite it.

## Do NOT flag

- A display `if` in a body (show/hide a whole view) is normal SwiftUI; the
  finding is the generic helper that wraps `self`.
- Branching between genuinely different view *shapes* is what `if/else` is
  for — the anti-pattern is conditionalizing a *modifier chain* on one view.

## 5-minute fix

Before:

```swift
Text(title)
    .if(isHighlighted) { $0.foregroundStyle(.orange) }   // toggle = identity destroyed
```

After:

```swift
Text(title)
    .foregroundStyle(isHighlighted ? .orange : .primary)  // same identity, changing value
```

## Reference

- https://developer.apple.com/documentation/swiftui/view
- https://developer.apple.com/videos/play/wwdc2021/10022/
