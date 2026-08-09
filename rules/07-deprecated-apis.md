---
axe: 7
id: apis-depreciees
titre: "APIs soft-deprecated"
severite: basse
patterns:
  - "NavigationView"
  - "\\.foregroundColor\\("
  - "\\.cornerRadius\\("
  - "navigationBarItems"
  - "presentationMode"
  - "\\.accentColor\\("
  - "isActive:"
reference: "Apple : NavigationView → NavigationStack ; foregroundColor → foregroundStyle ; cornerRadius → clipShape(.rect(cornerRadius:)) ; navigationBarItems → toolbar ; presentationMode → dismiss."
lien: "https://developer.apple.com/documentation/swiftui/migrating-to-new-navigation-types"
---

# APIs soft-deprecated

## Le concept

SwiftUI déprécie en douceur : les vieilles APIs compilent sans warning parfois
pendant des années, mais ne reçoivent plus les nouveaux comportements (styles
hiérarchiques, deep-links typés, transitions). S'appuyer dessus, c'est
accumuler une dette de migration silencieuse.

| Déprécié | Remplacement |
|---|---|
| `NavigationView` | `NavigationStack` / `NavigationSplitView` |
| `.foregroundColor(_:)` | `.foregroundStyle(_:)` |
| `.cornerRadius(_:)` | `.clipShape(.rect(cornerRadius:))` |
| `.navigationBarItems(…)` | `.toolbar { … }` |
| `@Environment(\.presentationMode)` | `@Environment(\.dismiss)` |
| `.accentColor(_:)` | `.tint(_:)` |
| `NavigationLink(…, isActive:)` | valeur poussée dans un `NavigationPath` |

## Détection (scan)

- Patterns directs, très fiables. `isActive:` demande un coup d'œil (peut être
  un paramètre maison) — vérifier que c'est bien un `NavigationLink`.

## Fix en 5 min

Avant :

```swift
NavigationView {
    Text(title).foregroundColor(.secondary).cornerRadius(8)
}
```

Après :

```swift
NavigationStack {
    Text(title).foregroundStyle(.secondary)
        .clipShape(.rect(cornerRadius: 8))
}
```
