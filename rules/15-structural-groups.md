---
axis: 15
id: structural-groups
title: "Structural Groups — no single-child wrappers"
severity: medium
patterns:
  - "Group\\s*\\{"
---

# Structural Groups

## Concept

`Group { SingleChild() }` wraps the child in `Group<T>` for nothing: every
chained modifier now type-checks against the wrapper, adding compile-time
cost in long chains (the cost is type-checking, not runtime). Group exists
to hand SEVERAL children to one parent slot, or to share a modifier across
branches — a single static child needs no Group.

## Sub-rules

- **15.1 No single-child Group** (med, GREP + JUDGMENT). A Group whose body
  is a single expression with no branching — unwrap it; apply the modifiers
  directly to the child.

## Do NOT flag

The three blessed shapes — exactly what Group is FOR:

- **`Group { ForEach … }`** — passthrough over a dynamic child.
- **`Group` with 2+ sibling children** — the TupleView case, Group's core
  purpose.
- **`Group { if … } / { switch … }`** — sharing a modifier across branches
  (also note: on SDK 27, `Group { }` EMPTY intersects axis 14.8).

## 5-minute fix

Before:

```swift
Group {
    ProfileCard(user: user)
}
.padding()
.shadow(radius: 2)
```

After:

```swift
ProfileCard(user: user)
    .padding()
    .shadow(radius: 2)
```

## Reference

- https://developer.apple.com/documentation/swiftui/group
