# Quiz — "which of these versions would you write?"

15 questions. For each: the code, the options, the "like Apple" answer, the
axis covered, and the explanation to keep for the report (NEVER give it during
the quiz). Ask one at a time, in order, numbered (1/15…). Translate prose into
the session language on the fly — code snippets stay untouched. The correct
option is deliberately shuffled between A and B.

---

## Q1 — axis 1 (invalidation boundaries)

Your detail screen has a header, a score and a list. How do you structure it?

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

**Answer: B.** Computed vars are inlined into the parent body — no
invalidation boundary, the whole screen re-evaluates together. Each View
struct is a boundary: SwiftUI skips those whose inputs didn't change.

---

## Q2 — axis 2 (ForEach identity)

**A**
```swift
ForEach(tags, id: \.self) { tag in TagChip(tag) }
```

**B**
```swift
// Tag: Identifiable (stable UUID id)
ForEach(tags) { tag in TagChip(tag) }
```

**Answer: B.** `id: \.self` makes the value the identity: editing a tag =
delete + insert, two equal tags = collision. A stable id survives edits.
(Nuance: \.self is tolerable for immutable, guaranteed-unique values, e.g.
enum cases.)

---

## Q3 — axis 2 (ForEach identity, indices)

**A**
```swift
ForEach(0..<items.count, id: \.self) { i in ItemRow(item: items[i]) }
```

**B**
```swift
ForEach(items) { item in ItemRow(item: item) }
```

**Answer: B.** Indices are not an identity: inserting at the head shifts every
id, everything re-renders and per-row @State slides from one row to the next.

---

## Q4 — axis 3 (derived data in the body)

**A**
```swift
var body: some View {
    List(store.projects.sorted { $0.criticality > $1.criticality }) { … }
}
```

**B**
```swift
// in the store: projects { didSet { sortedProjects = … } }
var body: some View { List(store.sortedProjects) { … } }
```

**Answer: B.** Inline sorting runs on EVERY body re-evaluation (even triggered
by unrelated state) and produces a fresh array → ForEach re-diffs everything.
Apple: "cache the derived collection… recompute in a didSet".

---

## Q5 — axis 3 (transitive derivations)

The sort moved into a computed var. Problem solved?

**A**
```swift
struct Dashboard: View {
    var sorted: [Project] { store.projects.sorted { $0.score > $1.score } }
    var body: some View { List(sorted) { … } }
}
```

**B** No: a computed var read by the body redoes the work on every
re-evaluation — you need a stored property maintained when the data changes.

**Answer: B.** "Computed properties still establish dependencies
transitively" — moving the computation doesn't remove it; only *storing* the
derived value does.

---

## Q6 — axis 4 (@Observable, Equatable)

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

**Answer: B.** An @Observable property's setter can only skip invalidation
(same value reassigned) when the type is Equatable. Without it, every
`store.filter = x` re-renders subscribers, equal or not.

---

## Q7 — axis 4 (granularity)

A view reads only `store.detail.isLoading`. Someone increments
`store.detail.page`. Does the view re-render?

**A** No — it doesn't read `page`.
**B** Yes — reading one field of a struct depends on the whole struct.

**Answer: B.** Observation tracks properties of the observable CLASS.
`detail` changed → every reader of `detail` re-renders, whatever field it
read. Flatten hot fields into separate store properties.

---

## Q8 — axis 5 (bindings)

**A**
```swift
Toggle("Demo mode", isOn: Binding(
    get: { store.isDemoMode },
    set: { store.isDemoMode = $0 }
))
```

**B**
```swift
@Bindable var store: AppStore
Toggle("Demo mode", isOn: $store.isDemoMode)
```

**Answer: B.** `Binding(get:set:)` heap-allocates two closures on every body
evaluation, and SwiftUI cannot compare closures. `$store.…` is lightweight,
comparable, and declares the dependency cleanly.

---

## Q9 — axis 6 (localization)

**A**
```swift
enum L10n { static let title = "My projects" }          // String
Text(L10n.title)
```

**B**
```swift
enum L10n { static let title: LocalizedStringResource = "My projects" }
Text(L10n.title)
```

**Answer: B.** `Text(String)` picks the StringProtocol overload: never
localized, never extracted into the String Catalog. Centralizing `String`s
silently disarms localization; `LocalizedStringResource` keeps it armed.

---

## Q10 — axis 6 (locale)

To display a percentage:

**A**
```swift
Text(value.formatted(.percent.locale(Locale(identifier: "en_US"))))
```

**B**
```swift
Text(value.formatted(.percent))    // follows the user's locale
```

**Answer: B.** Hardcoding the locale freezes the app in ONE language and
ignores user settings. The locale comes from the environment. (Exception: in
TESTS, pinning the locale is on the contrary the best practice.)

---

## Q11 — axis 7 (deprecated APIs)

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

**Answer: B.** NavigationView, foregroundColor and cornerRadius are
soft-deprecated: they compile, but without the new behaviors (typed
deep-links, hierarchical styles). Silent migration debt.

---

## Q12 — axis 8 (testing, force-unwrap)

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

**Answer: A.** A failing fixture force-unwrap crashes the WHOLE test process —
no other test runs. `try #require` fails ONE test and the run continues.
(+ Swift Testing > XCTest for new tests.)

---

## Q13 — axis 8 (testing, determinism)

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

**Answer: B.** `Date()` and `Calendar.current` make the test depend on the
day, timezone and machine — green on your Mac, red in CI at midnight.
Injecting dates and calendar = same result everywhere, forever.

---

## Q14 — axis 9 (guard-first)

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

**Answer: B.** Preconditions at the top, flat happy path, explicit exits.
(Nuance: inside a @ViewBuilder body, display `if let`s remain the right tool.)

---

## Q15 — axis 10 (conditional modifiers)

**A**
```swift
Text(title).if(isHighlighted) { $0.foregroundStyle(.orange) }
// via extension View { @ViewBuilder func `if`(…) }
```

**B**
```swift
Text(title).foregroundStyle(isHighlighted ? .orange : .primary)
```

**Answer: B.** The `.if` helper rests on a ViewBuilder if/else: two branches =
two structural identities. Every toggle destroys and recreates the view:
@State lost, animations broken. An always-applied modifier with a changing
value keeps identity stable.
