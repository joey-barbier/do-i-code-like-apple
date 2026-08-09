---
axe: 9
id: guard-first
titre: "Guard-first — early exit dans le code impératif"
severite: basse
patterns:
  - "if let [^{]+\\{[^}]*if let"
  - "else\\s*\\{\\s*return"
reference: "Swift, The Swift Programming Language (Early Exit) : guard exprime les préconditions en tête de fonction et garde le happy path à plat, non indenté."
lien: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/controlflow#Early-Exit"
---

# Guard-first

## Le concept

Dans le code **impératif** (fonctions, actions, interactors), les préconditions
s'expriment en tête avec `guard` : chaque sortie anticipée est explicite, et le
happy path reste à plat, au niveau d'indentation zéro. Les pyramides de
`if let` imbriqués enterrent la logique métier au fond de l'indentation et
dispersent les cas d'échec.

Nuance importante : cette règle vaut pour le code impératif. Dans un
`@ViewBuilder` (body), les `if let` d'affichage conditionnel sont le bon outil
— `guard` n'y est d'ailleurs pas disponible.

## Détection (scan)

- Pattern grep grossier (deux `if let` imbriqués) + **jugement obligatoire** :
  lire la fonction, compter la profondeur, vérifier que ce n'est pas un body
  SwiftUI. Sévérité selon la profondeur (2 niveaux = mineur, 4 = finding).

## Fix en 5 min

Avant :

```swift
func openRelease(id: String) {
    if let project = store.selectedProject {
        if let release = project.releases.first(where: { $0.id == id }) {
            if release.isPublished {
                path.append(Route.release(release))
            }
        }
    }
}
```

Après :

```swift
func openRelease(id: String) {
    guard let project = store.selectedProject,
          let release = project.releases.first(where: { $0.id == id }),
          release.isPublished else { return }
    path.append(Route.release(release))      // happy path à plat
}
```
