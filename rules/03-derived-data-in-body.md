---
axe: 3
id: derives-dans-le-body
titre: "Dérivés recalculés dans le body"
severite: haute
patterns:
  - "\\.sorted\\("
  - "\\.sorted\\s*\\{"
  - "\\.filter\\s*[({]"
  - "Dictionary\\(grouping:"
reference: "Apple, data flow : « computed properties still establish dependencies transitively… cache the derived value as its own stored property » ; ForEach : « don't sort or filter inline »."
lien: "https://developer.apple.com/documentation/swiftui/managing-model-data-in-your-app"
---

# Dérivés dans le body

## Le concept

Trier, filtrer ou grouper **dans le body** (ou dans une computed var lue par le
body) refait le calcul à **chaque** réévaluation — y compris quand le changement
d'état n'a rien à voir (fermer une alerte, changer de tab). Pire : le résultat
est un **nouveau tableau** à chaque fois, donc `ForEach` re-diffe toutes les rows.

Invisible avec 6 éléments mock, freeze de scroll avec 200 éléments réels.

## Ce que dit Apple

> Computed properties still establish dependencies transitively. The fix is to
> cache the derived value as its own stored property and keep it in sync.

> Don't sort or filter inline in ForEach. Cache the derived collection on the
> model — recompute in a `didSet`.

## Détection (scan)

- Patterns `sorted`/`filter`/`Dictionary(grouping:)` dans des fichiers de vues.
- **Cas ambigu (jugement)** : un `.filter` sur 3 éléments dans une vue feuille
  n'est pas un chemin chaud. Prioriser : listes principales, dashboards,
  compteurs lus par des conteneurs (TabView badge). Un `sorted` dans un modèle
  ou un engine (hors SwiftUI) n'est pas un finding — c'est là qu'il doit vivre.

## Fix en 5 min

Avant :

```swift
var body: some View {
    List(store.projects.sorted { $0.criticality > $1.criticality }) { … }
}
```

Après :

```swift
@Observable final class Store {
    private(set) var sortedProjects: [Project] = []
    var projects: [Project] = [] {
        didSet { sortedProjects = projects.sorted { $0.criticality > $1.criticality } }
    }   // trié UNE fois, quand la donnée change — pas à chaque render
}

var body: some View { List(store.sortedProjects) { … } }
```
