# QCM — « laquelle de ces versions tu écrirais ? »

15 questions. Pour chacune : le code, les options, la réponse « comme Apple »,
l'axe couvert, et l'explication à garder pour le rapport (ne JAMAIS la donner
pendant le QCM). Pose les questions une par une, dans l'ordre, en numérotant
(1/15…). L'option correcte est volontairement mélangée entre A et B.

---

## Q1 — axe 1 (frontières d'invalidation)

Ton écran de détail a un header, un score et une liste. Tu structures comment ?

**A**
```swift
struct ReleaseDetail: View {
    var body: some View { VStack { header; scoreSection; cveList } }
    private var header: some View { … }
    private var scoreSection: some View { … }
    private var cveList: some View { … }
}
```

**B**
```swift
struct ReleaseDetail: View {
    var body: some View {
        VStack { Header(release: release); ScoreSection(score: release.score); CVEList(cves: release.cves) }
    }
    struct Header: View { … }
    struct ScoreSection: View { … }
    struct CVEList: View { … }
}
```

**Réponse : B.** Les computed vars sont inlinées dans le body parent — aucune
frontière d'invalidation, tout l'écran se réévalue ensemble. Chaque struct View
est une frontière : SwiftUI saute celles dont les inputs n'ont pas changé.

---

## Q2 — axe 2 (identité ForEach)

**A**
```swift
ForEach(tags, id: \.self) { tag in TagChip(tag) }
```

**B**
```swift
// Tag: Identifiable (id: UUID stable)
ForEach(tags) { tag in TagChip(tag) }
```

**Réponse : B.** `id: \.self` fait de la valeur l'identité : éditer un tag =
suppression + insertion, deux tags égaux = collision. Un id stable survit aux
éditions. (Nuance : \.self est tolérable pour des valeurs immuables garanties
uniques, ex. cases d'un enum.)

---

## Q3 — axe 2 (identité ForEach, indices)

**A**
```swift
ForEach(0..<items.count, id: \.self) { i in ItemRow(item: items[i]) }
```

**B**
```swift
ForEach(items) { item in ItemRow(item: item) }
```

**Réponse : B.** Les indices ne sont pas une identité : insérer en tête décale
tous les ids, tout re-rend et les @State des rows glissent d'une row à l'autre.

---

## Q4 — axe 3 (dérivés dans le body)

**A**
```swift
var body: some View {
    List(store.projects.sorted { $0.criticality > $1.criticality }) { … }
}
```

**B**
```swift
// dans le store : projects { didSet { sortedProjects = … } }
var body: some View { List(store.sortedProjects) { … } }
```

**Réponse : B.** Le tri inline s'exécute à CHAQUE réévaluation du body (même
déclenchée par un état sans rapport) et produit un tableau neuf → ForEach
re-diffe tout. Apple : « cache the derived collection… recompute in a didSet ».

---

## Q5 — axe 3 (dérivés transitifs)

Le tri est déporté dans une computed var. Problème réglé ?

**A**
```swift
struct Dashboard: View {
    var sorted: [Project] { store.projects.sorted { $0.score > $1.score } }
    var body: some View { List(sorted) { … } }
}
```

**B** Non : une computed var lue par le body refait le calcul à chaque
réévaluation — il faut une stored property maintenue quand la donnée change.

**Réponse : B.** « Computed properties still establish dependencies
transitively » — déplacer le calcul ne le supprime pas, seul le *stockage* du
dérivé le fait.

---

## Q6 — axe 4 (@Observable, Equatable)

**A**
```swift
struct FilterState { var query = ""; var onlyCritical = false }
@Observable final class Store { var filter = FilterState() }
```

**B**
```swift
struct FilterState: Equatable { var query = ""; var onlyCritical = false }
@Observable final class Store { var filter = FilterState() }
```

**Réponse : B.** Le setter d'une propriété @Observable ne peut sauter
l'invalidation (valeur identique réassignée) que si le type est Equatable.
Sans ça, chaque `store.filter = x` re-rend les abonnés, égal ou pas.

---

## Q7 — axe 4 (granularité)

Une vue lit uniquement `store.detail.isLoading`. On incrémente
`store.detail.page`. La vue se re-rend ?

**A** Non — elle ne lit pas `page`.
**B** Oui — lire un champ d'une struct crée une dépendance sur la struct entière.

**Réponse : B.** L'observation trace les propriétés de la CLASSE observable.
`detail` change → tous les lecteurs de `detail` re-rendent, quel que soit le
champ lu. Aplatir les champs chauds en propriétés séparées du store.

---

## Q8 — axe 5 (bindings)

**A**
```swift
Toggle("Mode démo", isOn: Binding(
    get: { store.isDemoMode },
    set: { store.isDemoMode = $0 }
))
```

**B**
```swift
@Bindable var store: AppStore
Toggle("Mode démo", isOn: $store.isDemoMode)
```

**Réponse : B.** `Binding(get:set:)` alloue deux closures sur le heap à chaque
évaluation du body, et SwiftUI ne peut pas comparer des closures. `$store.…`
est léger, comparable, et déclare la dépendance proprement.

---

## Q9 — axe 6 (localisation)

**A**
```swift
enum L10n { static let title = "Mes projets" }          // String
Text(L10n.title)
```

**B**
```swift
enum L10n { static let title: LocalizedStringResource = "Mes projets" }
Text(L10n.title)
```

**Réponse : B.** `Text(String)` prend l'overload StringProtocol : jamais
localisé, jamais extrait dans le String Catalog. Centraliser des `String`
désarme la localisation en silence ; `LocalizedStringResource` la garde armée.

---

## Q10 — axe 6 (locale)

Pour afficher un pourcentage en français :

**A**
```swift
Text(value.formatted(.percent.locale(Locale(identifier: "fr_FR"))))
```

**B**
```swift
Text(value.formatted(.percent))    // suit la locale de l'utilisateur
```

**Réponse : B.** Hardcoder la locale fige l'app dans UNE langue et ignore les
réglages utilisateur. La locale vient de l'environnement. (Exception : dans les
TESTS, fixer la locale est au contraire la bonne pratique.)

---

## Q11 — axe 7 (APIs dépréciées)

**A**
```swift
NavigationView {
    content.foregroundColor(.secondary).cornerRadius(12)
}
```

**B**
```swift
NavigationStack {
    content.foregroundStyle(.secondary).clipShape(.rect(cornerRadius: 12))
}
```

**Réponse : B.** NavigationView, foregroundColor et cornerRadius sont
soft-deprecated : ça compile, mais sans les nouveaux comportements (deep-links
typés, styles hiérarchiques). Dette de migration silencieuse.

---

## Q12 — axe 8 (tests, force-unwrap)

**A**
```swift
@Test func score() throws {
    let release = try #require(catalog.first { $0.id == "core" })
    #expect(engine.score(release) == 87)
}
```

**B**
```swift
func testScore() {
    let release = catalog.first(where: { $0.id == "core" })!
    XCTAssertEqual(engine.score(release), 87)
}
```

**Réponse : A.** Le force-unwrap d'une fixture qui échoue crashe TOUT le
process de test — plus aucun autre test ne tourne. `try #require` fait échouer
UN test et le run continue. (+ Swift Testing > XCTest pour les nouveaux tests.)

---

## Q13 — axe 8 (tests, déterminisme)

**A**
```swift
@Test func isRecent() {
    #expect(engine.isRecent(release, now: Date(), calendar: .current))
}
```

**B**
```swift
@Test func isRecent() {
    let now = Date(timeIntervalSince1970: 1_750_000_000)
    var cal = Calendar(identifier: .gregorian); cal.timeZone = TimeZone(identifier: "Europe/Paris")!
    #expect(engine.isRecent(release, now: now, calendar: cal))
}
```

**Réponse : B.** `Date()` et `Calendar.current` rendent le test dépendant du
jour, du fuseau et de la machine — vert chez toi, rouge en CI à minuit.
Injecter dates et calendrier = même résultat partout, pour toujours.

---

## Q14 — axe 9 (guard-first)

**A**
```swift
func openRelease(id: String) {
    if let project = store.selectedProject {
        if let release = project.releases.first(where: { $0.id == id }) {
            path.append(Route.release(release))
        }
    }
}
```

**B**
```swift
func openRelease(id: String) {
    guard let project = store.selectedProject,
          let release = project.releases.first(where: { $0.id == id }) else { return }
    path.append(Route.release(release))
}
```

**Réponse : B.** Préconditions en tête, happy path à plat, sorties explicites.
(Nuance : dans un body @ViewBuilder, les `if let` d'affichage restent le bon
outil.)

---

## Q15 — axe 10 (modifiers conditionnels)

**A**
```swift
Text(title).if(isHighlighted) { $0.foregroundStyle(.orange) }
// via extension View { @ViewBuilder func `if`(…) }
```

**B**
```swift
Text(title).foregroundStyle(isHighlighted ? .orange : .primary)
```

**Réponse : B.** Le helper `.if` repose sur un if/else de ViewBuilder : deux
branches = deux identités structurelles. Chaque bascule détruit et recrée la
vue : @State perdu, animations cassées. Un modifier toujours appliqué dont la
valeur change garde l'identité stable.
