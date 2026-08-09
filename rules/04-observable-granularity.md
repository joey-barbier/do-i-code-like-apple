---
axe: 4
id: observable-granularite
titre: "@Observable — Equatable et granularité"
severite: moyenne
patterns:
  - "@Observable"
reference: "Apple, Observation : le setter ne skippe l'invalidation que si le type de la propriété est Equatable ; lire un champ d'une struct = dépendre de la struct entière."
lien: "https://developer.apple.com/documentation/observation"
---

# @Observable : Equatable et granularité

## Le concept

Deux mécaniques méconnues d'`@Observable` :

1. **Equatable** : quand tu assignes une propriété, Observation ne peut sauter
   l'invalidation (`nouvelle valeur == ancienne`) **que si le type est
   `Equatable`**. Une struct d'état non-Equatable → chaque `set` invalide les
   vues abonnées, même si rien n'a changé.

2. **Granularité struct** : l'observation suit les propriétés de la **classe**
   observable. Lire `store.detailState.isLoading` crée une dépendance sur
   `detailState` **en entier** : changer n'importe quel autre champ de la struct
   re-rend la vue.

## Détection (scan)

- Localiser les classes `@Observable`, lister leurs propriétés de type struct
  « maison », vérifier si ces structs sont `Equatable` (ou `Hashable`).
- **Jugement** : repérer les grosses structs d'état fourre-tout lues par
  plusieurs vues — candidates à l'aplatissement en propriétés séparées.

## Fix en 5 min

Avant :

```swift
struct DetailState { var isLoading = false; var items: [Item] = []; var page = 0 }
@Observable final class Store { var detailState = DetailState() }
// « Charger plus » (page += 1) re-rend AUSSI la vue qui ne lit que isLoading
```

Après :

```swift
struct DetailState: Equatable { … }        // 1 mot : les sets égaux ne re-rendent plus
// et pour les champs chauds lus par des vues différentes : aplatir
@Observable final class Store {
    var isLoadingDetail = false            // dépendances fines par champ
    var detailItems: [Item] = []
    var detailPage = 0
}
```
