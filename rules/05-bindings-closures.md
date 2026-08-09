---
axe: 5
id: bindings-closures
titre: "Bindings — closures vs KeyPath"
severite: moyenne
patterns:
  - "Binding\\(get:"
  - "Binding\\($"
  - "Binding<[^>]*>\\("
reference: "Apple, data flow : les closure bindings allouent sur le heap à chaque évaluation du body et cachent les dépendances ; préférer $property, KeyPath et subscripts."
lien: "https://developer.apple.com/documentation/swiftui/binding"
---

# Bindings : closures vs KeyPath

## Le concept

`Binding(get:set:)` construit un binding avec **deux closures allouées sur le
heap à chaque évaluation du body**. En plus du coût, ces bindings sont opaques :
SwiftUI ne peut pas comparer deux closures, donc ne peut pas déterminer que
« rien n'a changé ».

Les bindings dérivés par projection (`$store.field`, `$item.name`), par
KeyPath ou par subscript (`$store.values[id]`) sont des structures légères et
comparables.

## Détection (scan)

- Patterns : `Binding(get:` sur une ligne, ou `Binding(` en fin de ligne (la
  forme multi-lignes, la plus courante — vérifier que la ligne suivante est
  bien `get:`).
- **Jugement** : un closure binding dans un chemin froid (une sheet de réglages)
  est un finding mineur. Dans un composant répété (chaque row d'une liste) ou un
  conteneur (TabView selection), c'est un vrai coût par frame.

## Fix en 5 min

Avant :

```swift
TabView(selection: Binding(
    get: { store.selectedTab },
    set: { store.selectedTab = $0 }
)) { … }
```

Après :

```swift
@Bindable var store: AppStore          // dans le body d'une View
TabView(selection: $store.selectedTab) { … }
```
