---
axis: 6
id: localization
title: "Localization — types, catalogs, formats, layout"
severity: high
patterns:
  - "Locale\\(identifier:"
  - "Locale\\.current"
  - "Text\\([a-z][A-Za-z0-9_.]*\\)"
  - "Text\\(\\s*(NSLocalizedString|String\\(localized:|LocalizedStringResource)"
  - "Text\\(\\s*\"[^\"]*\"\\s*\\+"
  - "Text\\([^)]*\\)\\s*\\+\\s*Text\\("
  - "(title|label|message|headline|subtitle|caption|prompt)\\w*\\s*:\\s*String\\b"
  - "DateFormatter\\(\\)"
  - "NumberFormatter\\(\\)"
  - "\\.dateFormat\\s*="
  - "specifier:\\s*\"%"
  - "joined\\(separator:"
  - "\\.(left|right)\\b"
  - "\\.frame\\(width:"
  - "\\.font\\(\\.system\\(size:"
  - "String\\(format:"
  - "NSLocalizedString"
  - "\\.textCase\\("
  - "\\.(uppercased|capitalized|localizedUppercase|localizedCapitalized)"
---

# Localization

## Concept

SwiftUI's text views localize **literals** automatically: a string literal
takes the `LocalizedStringKey` overload, lands in the String Catalog, and
resolves at display time in the user's locale. Every step that converts text
to a plain `String` too early — variable-typed UI copy, concatenation,
call-site wrapping, eager resolution — silently disarms that pipeline while
the code keeps compiling and rendering. Localization also reaches layout
(RTL, text length, script height) and formatting (dates, numbers, currency,
list separators).

## Sub-rules

**Types & literals**

- **6.1 The Text(String) trap** (high, GREP). `Text(stringVariable)` invokes
  the StringProtocol overload → never localized, never extracted. Wrapping
  the variable at the call site in `LocalizedStringKey(variable)` does NOT
  help — there is no literal to extract.
- **6.2 UI text properties are localized types** (high, GREP). View/viewmodel
  properties carrying user-facing copy (`title`, `label`, `message`,
  `headline`, `subtitle`, `caption`, `prompt`…) should be typed
  `LocalizedStringKey` or `LocalizedStringResource`, not `String` — deferring
  resolution costs nothing (every SwiftUI text view accepts both) and
  preserves locale+bundle end to end. Non-view types (models, tips,
  notification content) → `LocalizedStringResource`. Values from a known key
  set → a type exposing a `LocalizedStringResource` property. Never resolve
  at creation time (`Tip(headline: String(localized: …))`) — resolution
  belongs to display time.
- **6.3 Don't double-wrap literals** (high, GREP). SwiftUI initializers
  already treat literals as keys: `Text(NSLocalizedString(…))`,
  `Text(String(localized:))`, `Text(LocalizedStringResource("…"))` on a
  literal add nothing AND resolve eagerly, ignoring `\.locale` overrides.
  `Text(verbatim:)` is the legitimate opt-OUT for a literal.

**Building sentences**

- **6.4 Interpolate, never concatenate** (high, GREP). String interpolation
  preserves the key (`"Welcome, \(name)"` → catalog format string
  `"Welcome, %@"`). `Text("…" + variable)` produces an unlocalized String;
  `Text(a) + Text(b)` glues separately localized fragments into a sentence
  whose word order can't be rearranged by translators. One localized string
  containing the interpolation.
- **6.5 Casing lives in the string** (med, GREP). Bake the desired case into
  the translation; `.textCase()`, `.localizedUppercase` and friends force one
  casing across all languages. If a runtime transform is unavoidable, use the
  `localized*` variants (Turkish dotless I, German ß) — never bare
  `.uppercased()` / `.capitalized`.

**Formatting**

- **6.6 Format styles over formatters with hardcoded patterns** (high, GREP).
  `Text(value, format:)` / `.formatted()` adapt to locale;
  `DateFormatter()` + `dateFormat = "MM/dd"` doesn't. The formatted value
  produces no catalog entry — it localizes *through the style*. Unavoidable
  DateFormatter → `setLocalizedDateFormatFromTemplate`, never assign
  `dateFormat`. Date field components pick WHICH fields appear; the locale
  decides their order.
- **6.7 Currency and lists** (high/med, GREP). Never hardcode currency
  (`"$\(price)"`, `specifier: "%.2f"`) → `.currency(code:)`. Never
  `joined(separator: ", ")` for display lists → `Array.formatted()` (locale
  separators and conjunctions).

**Layout**

- **6.8 Direction-aware, size-aware layout** (high, GREP). `.leading` /
  `.trailing`, never `.left` / `.right` (RTL flip). No hardcoded
  `frame(width:/height:)` on text (translation length, script height) —
  `ViewThatFits` when a layout might not fit longer translations. Text styles
  (`.font(.body)`) over fixed point sizes (`.font(.system(size:))`) — line
  height varies per script.

**Locale & non-view code**

- **6.9 The locale comes from the environment** (high, GREP).
  `@Environment(\.locale)` in views, never `Locale.current` (breaks previews
  and per-view injection) and never `Locale(identifier:)` pinned in
  formatting. Outside views: `String(localized:)` — not `NSLocalizedString`
  (no interpolation in its literal keys), not `String(format:)` (always
  renders Western digits — unsuitable for user-facing text), not the older
  `localizedStringWithFormat`.
- **6.10 Catalogs, bundles, comments** (high/med, GREP + JUDGMENT). The
  `.xcstrings` catalog must exist (Xcode won't create it on the fly);
  `tableName:` routes per-feature catalogs. Frameworks and packages must pass
  `bundle:` — otherwise lookup silently falls back to `Bundle.main` and
  renders unlocalized; prefer `#bundle` over `Bundle.module` /
  `Bundle(for:)`. Add `comment:` describing UI element and purpose for
  ambiguous strings ("Edit": noun or verb?), and describe interpolation
  placeholders by position — translators don't see variable names.

## Do NOT flag

- **`Text(verbatim: literal)`** — the explicit "not localizable on purpose"
  API, i.e. the RIGHT practice. (But `Text(verbatim: variable)` is redundant
  — the variable already takes the StringProtocol overload; minor note only.)
- **User data in Text(variable)** — a project name, a message typed by the
  user displays as-is; only UI *copy* typed String is a finding. The casing
  rules likewise apply only to localized copy, never to user-typed text.
- **Upstream `String(localized:)` pipelines** — a variable carrying an
  already-localized string is functionally localized; trace one level up
  before flagging.
- **`Locale(identifier:)` in tests** — pinning the locale there is the
  determinism best practice (axis 8).
- **SF Symbol names matching `.right`/`.left`** — the alignment pattern
  `\.(left|right)\b` also matches `Image(systemName: "chevron.right")`,
  which is a symbol name, not a layout direction. Post-filter the sweep with
  `grep -v systemName` (and glance at remaining string literals) before
  judging.
- **Existing `.strings`/`.stringsdict` projects** — add to the existing
  files; don't force a catalog migration as a finding.
- **Opaque keys vs natural-language literals** — both are valid conventions;
  follow the project's existing one.
- **Don't sweep String properties in unrelated edits** — the retype applies
  when designing new types or already touching that text. (For a consented
  audit, *reporting* them is exactly the job — but the report should scope
  the fix to deliberate passes.)

## 5-minute fix

Before:

```swift
enum L10n { static let title = "My projects" }        // String
Text(L10n.title)                                       // StringProtocol overload: never localized
Text("Total: " + price.description)                    // concatenation, hardcoded format
```

After:

```swift
enum L10n { static let title: LocalizedStringResource = "My projects" }
Text(L10n.title)                                       // extracted, localizable
Text("Total: \(price, format: .currency(code: "EUR"))") // interpolation + format style
```

## Reference

- https://developer.apple.com/documentation/swiftui/preparing-views-for-localization
- https://developer.apple.com/documentation/xcode/localizing-and-varying-text-with-a-string-catalog
- https://developer.apple.com/documentation/foundation/localizedstringresource
