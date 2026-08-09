---
axe: 6
id: localisation
titre: "Localisation — Text(String) et locales hardcodées"
severite: moyenne
patterns:
  - "Locale\\(identifier:"
  - "Text\\([a-z][A-Za-z0-9_.]*\\)"
reference: "Apple, préparation à la localisation : Text(stringVariable) prend l'overload StringProtocol → jamais localisé ni extrait ; utiliser LocalizedStringKey/LocalizedStringResource et la locale de l'environnement."
lien: "https://developer.apple.com/documentation/swiftui/preparing-views-for-localization"
---

# Localisation

## Le concept

`Text("Bonjour")` avec un **littéral** prend l'overload `LocalizedStringKey` :
localisé, extrait automatiquement dans le String Catalog. Mais
`Text(maVariable)` avec une variable `String` prend l'overload
`StringProtocol` : **jamais localisé, jamais extrait**. Centraliser ses strings
dans des constantes `String` désarme donc silencieusement toute la chaîne de
localisation — l'intention est bonne, le mécanisme est mort.

Deuxième piège : `Locale(identifier: "fr_FR")` hardcodée dans le formatage fige
la locale au lieu de suivre celle de l'utilisateur (environnement).

## Détection (scan)

- `Locale(identifier:` : quasi toujours un finding (hors tests, où c'est au
  contraire une bonne pratique de déterminisme).
- `Text(variable)` : **jugement requis** — remonter le type de la variable. Si
  c'est un `String` de contenu UI (label, titre), finding. Si c'est de la donnée
  utilisateur (nom de projet, message), c'est normal.

## Fix en 5 min

Avant :

```swift
enum L10n { static let title = "Mes projets" }        // String
Text(L10n.title)                                       // overload StringProtocol : jamais localisé
```

Après :

```swift
enum L10n { static let title: LocalizedStringResource = "Mes projets" }
Text(L10n.title)                     // extrait dans le String Catalog, localisable
// et pour les formats : .formatted() sans Locale(identifier:) → suit l'utilisateur
```
