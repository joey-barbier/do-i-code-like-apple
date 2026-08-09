---
axe: 10
id: modifiers-conditionnels
titre: "Modifiers conditionnels — le pattern .if"
severite: haute
patterns:
  - "func\\s+`if`"
  - "\\.if\\("
  - "@ViewBuilder\\s+func\\s+(when|applyIf|conditional)"
reference: "Apple (WWDC « Demystify SwiftUI ») : un if/else dans un ViewBuilder crée deux identités structurelles distinctes — un helper .if() détruit l'identité de la vue à chaque bascule : état perdu, animations cassées."
lien: "https://developer.apple.com/videos/play/wwdc2021/10022/"
---

# Modifiers conditionnels : le pattern `.if`

## Le concept

Le helper viral :

```swift
extension View {
    @ViewBuilder func `if`<T: View>(_ condition: Bool, transform: (Self) -> T) -> some View {
        if condition { transform(self) } else { self }
    }
}
```

semble élégant, mais le `if/else` du ViewBuilder produit un
`_ConditionalContent<T, Self>` : **deux branches = deux identités
structurelles**. À chaque bascule de la condition, SwiftUI considère que la vue
est détruite et remplacée : `@State` perdu, animations cassées, scroll reset,
transitions parasites.

La bonne approche : des modifiers **toujours appliqués** dont les *valeurs*
changent — l'identité de la vue reste stable.

## Détection (scan)

- ``func `if` `` et `.if(` : très fiables.
- **Jugement** : un `if` d'affichage (montrer/cacher une vue entière) est
  normal ; le finding, c'est le helper générique qui enveloppe `self`.

## Fix en 5 min

Avant :

```swift
Text(title)
    .if(isHighlighted) { $0.foregroundStyle(.orange) }   // bascule = identité détruite
```

Après :

```swift
Text(title)
    .foregroundStyle(isHighlighted ? .orange : .primary)  // même identité, valeur qui change
// cas complexe : opacity(x ? 1 : 0), ou un ViewModifier maison à valeurs conditionnelles
```
