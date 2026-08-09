---
axe: 2
id: identite-foreach
titre: "Identité ForEach — ids stables"
severite: haute
patterns:
  - "id:\\s*\\\\\\.self"
  - "ForEach\\([^)]*\\.indices"
  - "ForEach\\(0\\s*\\.\\.<"
  - "\\.enumerated\\(\\)"
reference: "Apple, ForEach : l'identité doit être stable et unique dans le temps ; les indices et valeurs transitoires cassent le diffing et les animations."
lien: "https://developer.apple.com/documentation/swiftui/foreach"
---

# Identité ForEach

## Le concept

`ForEach` identifie chaque row par un id. Si l'id n'est pas **stable** (le même
élément garde le même id dans le temps) et **unique**, SwiftUI ne peut pas faire
le rapprochement entre deux rendus : il détruit et recrée des rows, perd l'état
local (`@State` des rows), casse les animations d'insertion/suppression, et
re-rend plus que nécessaire.

- `id: \.self` : l'identité EST la valeur → modifier un élément = « suppression + insertion » aux yeux de SwiftUI. Deux valeurs égales = crash d'unicité potentiel.
- indices (`0..<items.count`, `.indices`, `.enumerated()`) : insérer en tête décale tous les ids → tout re-rend, les états locaux glissent d'une row à l'autre.

## Ce que dit Apple

> The id must remain stable for the lifetime of the data it identifies.
> Conform your data to `Identifiable` with an id that survives edits.

## Détection (scan)

- Patterns ci-dessus, dans les fichiers de vues.
- **Cas ambigu (jugement)** : `id: \.self` sur une collection de valeurs
  immuables et garanties uniques (ex. un enum `CaseIterable` de tabs) est
  acceptable — le signaler comme mineur, pas comme finding.

## Fix en 5 min

Avant :

```swift
ForEach(projects, id: \.self) { project in ProjectRow(project) }
ForEach(0..<items.count) { i in ItemRow(items[i]) }
```

Après :

```swift
struct Project: Identifiable { let id: UUID; var name: String }

ForEach(projects) { project in ProjectRow(project) }   // id stable, gratuit
```
