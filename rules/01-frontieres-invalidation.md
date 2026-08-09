---
axe: 1
id: frontieres-invalidation
titre: "Frontières d'invalidation — sections d'écran"
severite: haute
patterns:
  - "(private\\s+)?var\\s+(?!body\\b)\\w+\\s*:\\s*some View"
reference: "Apple, guide de structuration SwiftUI : une computed property « does not introduce its own invalidation boundary » — elle est inlinée dans le body parent."
lien: "https://developer.apple.com/documentation/swiftui/declaring-a-custom-view"
---

# Frontières d'invalidation

## Le concept

Découper un écran en sections via des computed vars (`private var header: some View`)
organise le code, mais **pas le rendu**. Une computed var est inlinée dans le body
parent : SwiftUI ne voit qu'un seul gros body. Quand n'importe quelle donnée lue
par l'écran change, **tout l'écran se réévalue**, sections comprises.

Chaque `struct` conforme à `View` est au contraire une frontière d'invalidation :
SwiftUI compare ses inputs et ne réévalue que les sous-vues dont les inputs ont changé.

## Ce que dit Apple

> A computed property does not introduce its own invalidation boundary.
> Extract sections into their own `View` structs so SwiftUI can skip
> re-evaluating the ones whose inputs didn't change.

## Détection (scan)

- Pattern : computed vars typées `some View` autres que `body`.
- **Cas ambigu (jugement)** : une computed var qui retourne un élément trivial
  (une icône, un `Text` statique) est inoffensive. Le problème vaut pour les
  **sections qui lisent de l'état** (store, @State, @Binding) dans des écrans
  qui en lisent beaucoup.

## Fix en 5 min

Avant :

```swift
struct ReleaseDetail: View {
    let release: Release
    var body: some View {
        VStack { header; scoreSection; cveList }
    }
    private var scoreSection: some View {
        ScoreGauge(score: release.score)   // réévalué avec TOUT l'écran
    }
}
```

Après :

```swift
struct ReleaseDetail: View {
    let release: Release
    var body: some View {
        VStack { header; ScoreSection(score: release.score); cveList }
    }
    struct ScoreSection: View {            // frontière : ne se réévalue que si score change
        let score: Int
        var body: some View { ScoreGauge(score: score) }
    }
}
```
