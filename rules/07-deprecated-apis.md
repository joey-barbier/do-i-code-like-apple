---
axis: 7
id: deprecated-apis
title: "Soft-deprecated APIs — the 16-family catalog"
severity: low
patterns:
  - "\\bNavigationView\\s*\\{"
  - "\\.(foregroundColor|cornerRadius|edgesIgnoringSafeArea|navigationBarTitle|navigationBarItems|accentColor|disableAutocorrection|statusBar|navigationViewStyle|autocapitalization)\\("
  - "\\balert\\(isPresented:"
  - "\\bactionSheet\\("
  - "presentationMode"
  - "NavigationLink\\(\\s*destination:"
  - "\\.accessibility\\("
  - "\\.mask\\(\\s*[A-Z]"
  - "(overlay|background)\\(\\s*[A-Z][^,)]*,\\s*alignment:"
  - "\\b(MenuButton|RotationGesture|MagnificationGesture|AnimatableModifier)\\b"
  - "onCommit:|onEditingChanged:"
  - "Section\\(header:"
  - "GroupBox\\(label:"
  - "ScrollView\\([^)]*showsIndicators:"
  - "\\.tabItem\\("
  - "coordinateSpace\\(name:"
  - "ContentSizeCategory|sizeCategory|ControlActiveState"
  - "Color\\(UIColor"
---

# Soft-deprecated APIs

## Concept

SwiftUI deprecates gently: old APIs often compile without warnings for years,
but no longer receive new behaviors (hierarchical styles, typed deep-links,
transitions) and quietly accrue migration debt. There are on the order of
**166 soft-deprecated symbols across 16 families** in current SDKs. Findings
here are **informational, never urgent** — everything still compiles and
works; the value is knowing where the debt sits.

## The 16 families (counts ≈ current SDK catalog)

| Family (≈count) | Typical deprecated APIs | Replacement | Doc |
|---|---|---|---|
| Navigation (26) | `NavigationView`, `navigationBarTitle`, `NavigationLink(destination:isActive:)` | `NavigationStack`/`SplitView`, `navigationTitle`, value-based links | [Migrating to new navigation types](https://developer.apple.com/documentation/swiftui/migrating-to-new-navigation-types) |
| Accessibility (22) | `.accessibility(label:)` etc. | `.accessibilityLabel()` etc. (one modifier per trait) | [Accessibility modifiers](https://developer.apple.com/documentation/swiftui/view-accessibility) |
| Text input (17) | `TextField(…, onCommit:)`/`onEditingChanged:`, `autocapitalization`, `disableAutocorrection` | `onSubmit`, focus APIs, `textInputAutocapitalization`, `autocorrectionDisabled` | [TextField](https://developer.apple.com/documentation/swiftui/textfield) |
| Styling (17) | `foregroundColor`, `accentColor`, `cornerRadius`, `overlay/background(_:alignment:)`, `mask(_:)`, `edgesIgnoringSafeArea`, `Color(UIColor:)` | `foregroundStyle`, `tint`, `clipShape(.rect(cornerRadius:))`, `(alignment:content:)` closures, `ignoresSafeArea`, `Color(uiColor:)` | [foregroundStyle](https://developer.apple.com/documentation/swiftui/view/foregroundstyle(_:)) |
| Controls (14) | old `Slider`/`Stepper`/`Picker` inits, style tints | current inits, `tint` | [Controls](https://developer.apple.com/documentation/swiftui/controls-and-indicators) |
| Menus (12) | `MenuButton` family | `Menu` | [Menu](https://developer.apple.com/documentation/swiftui/menu) |
| Presentation (10) | `Alert`/`ActionSheet` types, `alert(isPresented:content:)`, `presentationMode`, `ContextMenu` type | `alert(_:isPresented:presenting:actions:)`, `confirmationDialog`, `dismiss`, `contextMenu` modifier | [dismiss](https://developer.apple.com/documentation/swiftui/environmentvalues/dismiss) |
| Layout/list styles (10) | `Section(header:footer:)`, `GroupBox(label:)`, `ScrollView(showsIndicators:)`, alternate `*ListStyle`s | trailing-closure forms, `scrollIndicators(_:)`, current styles | [List](https://developer.apple.com/documentation/swiftui/list) |
| Gestures (9) | `RotationGesture`, `MagnificationGesture`, `coordinateSpace(name:)` | `RotateGesture`, `MagnifyGesture`, typed coordinate spaces | [Gestures](https://developer.apple.com/documentation/swiftui/gestures) |
| Tabs (8) | `tabItem`, carousel `TabView(selection:)` forms | `Tab` builders | [TabView](https://developer.apple.com/documentation/swiftui/tabview) |
| Toolbar/status (7) | `navigationBarLeading/Trailing` placements, `statusBar(hidden:)` | current placements, `statusBarHidden` | [Toolbars](https://developer.apple.com/documentation/swiftui/toolbars) |
| Drag & drop / paste (6) | old drop/paste overloads | `Transferable`-based APIs | [Transferable](https://developer.apple.com/documentation/coretransferable/transferable) |
| Environment/dynamic type (4) | `ContentSizeCategory`, `sizeCategory`, `ControlActiveState` | `DynamicTypeSize`, `dynamicTypeSize`, `controlActiveState` successors | [Environment values](https://developer.apple.com/documentation/swiftui/environmentvalues) |
| Search (3) | old `searchable` overloads | current overloads | [Search](https://developer.apple.com/documentation/swiftui/search) |
| Animation (1) | `AnimatableModifier` | `Animatable` + custom modifier | [Animatable](https://developer.apple.com/documentation/swiftui/animatable) |

Top hits in real code, in order: `NavigationView`, `foregroundColor`,
`cornerRadius`, `edgesIgnoringSafeArea`, `navigationBarTitle`,
`navigationBarItems`, `alert(isPresented:content:)`, `presentationMode`,
`background/overlay(_:alignment:)`, `NavigationLink(destination:)`.

## Sub-rules

- **7.1 The sweep** (low severity per hit, GREP). Run the frontmatter
  patterns over the focus scope; group hits by family; report counts per
  family with the family's replacement and doc link — never the navigation
  guide for a styling hit.
- **7.2 Informational framing** (process). These compile and work — frame as
  "migration debt inventory", not defects. Zero hits is a headline worth
  celebrating.
- **7.3 Consent note** (process). Apple's guidance for coding assistants is
  to NOT proactively scan unedited code for deprecated APIs. **A consented
  audit inverts that scoping**: the user explicitly requested this scan over
  this scope — proactive detection here is the product, not an overreach.
  The assistant-facing scoping rule still applies to any tool follow-up
  edits: fix only what the user asks to fix.

## Do NOT flag

- `isActive:`-style matches need a glance — could be a custom parameter;
  confirm the receiver is really the deprecated API.
- Code OUTSIDE the consented scope: the inversion above applies to the
  requested scope only.
- Never propose rewriting working navigation/presentation flows as part of an
  unrelated fix — report the debt, let the dev schedule the migration.

## 5-minute fix

Before:

```swift
NavigationView {
    content.foregroundColor(.secondary).cornerRadius(12)
        .edgesIgnoringSafeArea(.bottom)
}
```

After:

```swift
NavigationStack {
    content.foregroundStyle(.secondary)
        .clipShape(.rect(cornerRadius: 12))
        .ignoresSafeArea(edges: .bottom)
}
```

## Reference

- https://developer.apple.com/documentation/swiftui/migrating-to-new-navigation-types
- https://developer.apple.com/documentation/swiftui/view-accessibility
