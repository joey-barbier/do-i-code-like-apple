---
axis: 6
id: localization
title: "Localization — Text(String) and hardcoded locales"
severity: medium
patterns:
  - "Locale\\(identifier:"
  - "Text\\([a-z][A-Za-z0-9_.]*\\)"
reference: "Apple, preparing views for localization: Text(stringVariable) picks the StringProtocol overload → never localized nor extracted; use LocalizedStringKey/LocalizedStringResource and the environment locale."
link: "https://developer.apple.com/documentation/swiftui/preparing-views-for-localization"
---

# Localization

## The concept

`Text("Hello")` with a **literal** picks the `LocalizedStringKey` overload:
localized, auto-extracted into the String Catalog. But `Text(myVariable)` with
a `String` variable picks the `StringProtocol` overload: **never localized,
never extracted**. Centralizing your strings as `String` constants therefore
silently disarms the whole localization pipeline — good intention, dead
mechanism.

Second trap: a hardcoded `Locale(identifier: "fr_FR")` in formatting freezes
the locale instead of following the user's (environment).

## Detection (scan)

- `Locale(identifier:`: almost always a finding (except in tests, where it is
  on the contrary a determinism best practice).
- `Text(variable)`: **judgment required** — trace the variable's type. If it
  is UI copy (label, title) typed `String`, finding. If it is user data
  (a project name, a message), it is fine.

## 5-minute fix

Before:

```swift
enum L10n { static let title = "My projects" }        // String
Text(L10n.title)                                       // StringProtocol overload: never localized
```

After:

```swift
enum L10n { static let title: LocalizedStringResource = "My projects" }
Text(L10n.title)                     // extracted into the String Catalog, localizable
// and for formats: .formatted() without Locale(identifier:) → follows the user
```
