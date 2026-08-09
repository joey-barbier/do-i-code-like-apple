---
axis: 10
id: conditional-modifiers
title: "Conditional modifiers — the .if pattern"
severity: high
patterns:
  - "func\\s+`if`"
  - "\\.if\\("
  - "@ViewBuilder\\s+func\\s+(when|applyIf|conditional)"
reference: "Apple (WWDC « Demystify SwiftUI »): an if/else inside a ViewBuilder creates two distinct structural identities — a .if() helper destroys the view's identity on every toggle: state lost, animations broken."
link: "https://developer.apple.com/videos/play/wwdc2021/10022/"
---

# Conditional modifiers: the `.if` pattern

## The concept

The viral helper:

```swift
extension View {
    @ViewBuilder func `if`<T: View>(_ condition: Bool, transform: (Self) -> T) -> some View {
        if condition { transform(self) } else { self }
    }
}
```

looks elegant, but the ViewBuilder's `if/else` produces a
`_ConditionalContent<T, Self>`: **two branches = two structural identities**.
Every time the condition flips, SwiftUI treats the view as destroyed and
replaced: `@State` lost, animations broken, scroll reset, phantom transitions.

The right approach: modifiers that are **always applied** whose *values*
change — the view's identity stays stable.

## Detection (scan)

- ``func `if` `` and `.if(`: highly reliable.
- **Judgment**: a display `if` (show/hide a whole view) is normal; the finding
  is the generic helper that wraps `self`.

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
// complex cases: opacity(x ? 1 : 0), or a custom ViewModifier with conditional values
```
