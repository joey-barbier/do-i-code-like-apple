---
axe: 8
id: tests
titre: "Tests — Swift Testing, #require, déterminisme"
severite: moyenne
patterns:
  - "import XCTest"
  - "XCTAssert"
  - "try!\\s"
  - ")!"
  - "Calendar\\.current"
  - "Date\\(\\)"
scope: "fichiers de tests uniquement (Tests/, *Tests.swift)"
reference: "Apple, Swift Testing : #expect/#require remplacent XCTAssert ; #require fait échouer LE test au lieu de crasher le process ; injecter Calendar et dates pour des tests déterministes."
lien: "https://developer.apple.com/documentation/testing"
---

# Tests

## Le concept

Trois marqueurs d'un code de test « comme Apple » :

1. **Swift Testing** (`@Test`, `#expect`, `#require`) plutôt que XCTest —
   messages d'échec riches, suites en struct, paramétrage `@Test(arguments:)`.

2. **`#require` plutôt que force-unwrap** : `fixture!` qui échoue **crashe tout
   le process de test** — les centaines d'autres tests ne tournent jamais.
   `try #require(fixture)` fait échouer UN test et le run continue.

3. **Déterminisme** : `Date()` et `Calendar.current` dans un test = résultat qui
   dépend de la machine, du fuseau, du jour. Injecter une date fixe et un
   `Calendar` explicite (ici, `Locale(identifier:)` est une BONNE pratique).

## Détection (scan)

- Ne scanner que les fichiers de tests.
- `try!` et `)!` : **jugement** — vérifier que c'est bien un force-unwrap de
  fixture, pas un `!=` ou une chaîne optionnelle légitime.
- `Date()`/`Calendar.current` : finding si le test calcule du temps relatif.

## Fix en 5 min

Avant :

```swift
func testScore() {
    let release = catalog.first(where: { $0.id == "core" })!   // crash du process si absent
    XCTAssertEqual(engine.score(release, at: Date()), 87)      // dépend d'aujourd'hui
}
```

Après :

```swift
@Test func score() throws {
    let release = try #require(catalog.first { $0.id == "core" })  // échec propre d'UN test
    let fixed = Date(timeIntervalSince1970: 1_750_000_000)
    #expect(engine.score(release, at: fixed) == 87)                // même résultat partout
}
```
