---
axis: 16
id: animations
title: "Animations — Animatable conformance without boilerplate"
severity: medium
patterns:
  - "struct\\s+\\w+\\s*:\\s*[^{]*\\bShape\\b"
  - "animatableData"
  - "@Animatable\\b"
  - "@AnimatableIgnored"
  - "AnimatablePair<"
  - "AnimatableValues<"
---

# Animations

## Concept

A custom View or Shape whose properties should animate must conform to
`Animatable` — otherwise SwiftUI jumps to the end value instead of
interpolating. The modern path is the `@Animatable` macro; hand-written
`animatableData` (and its nested `AnimatablePair` plumbing) is boilerplate
reserved for custom interpolation logic.

## Sub-rules

- **16.1 Animatable conformance where properties animate** (med, GREP +
  JUDGMENT). A custom Shape driven by changing values without
  `Animatable`/`animatableData` snaps instead of animating.
- **16.2 Prefer the @Animatable macro** (med, GREP). Over hand-written
  `animatableData` — the macro synthesizes it from stored properties.
- **16.3 Opt out per property with @AnimatableIgnored** (med, GREP). When the
  macro errors on a non-conforming property: conform its type to
  `VectorArithmetic`/`Animatable` if it should animate, or mark it
  `@AnimatableIgnored`.
- **16.4 Pair plumbing by deployment target** (med, GREP vs target).
  Deployment ≥ 26: `AnimatableValues<…>` (`newValue.value.0/.1`); earlier
  targets: `AnimatablePair<…>`. Don't recommend the newer type below its
  floor.

## Do NOT flag

- Hand-written `animatableData` implementing genuine custom interpolation
  (normalization, clamping, derived values) — that is its remaining
  legitimate use.
- Shapes that are static (no animated inputs) — conformance is pointless
  there, not missing.

## 5-minute fix

Before:

```swift
struct Gauge: Shape {
    var progress: Double
    var animatableData: Double {           // boilerplate
        get { progress } set { progress = newValue }
    }
    func path(in rect: CGRect) -> Path { … }
}
```

After:

```swift
@Animatable
struct Gauge: Shape {
    var progress: Double                   // synthesized interpolation
    func path(in rect: CGRect) -> Path { … }
}
```

## Reference

- https://developer.apple.com/documentation/swiftui/animatable
- https://developer.apple.com/documentation/swiftui/animations
