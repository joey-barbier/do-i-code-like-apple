# Quiz bank — "which of these versions would you write?"

**25 questions; the session asks ~12–15** (see SKILL.md for selection).
For each: the code, the options, the "like Apple" answer, the axis covered,
and the explanation to keep for the report (NEVER give it during the quiz).
Ask one at a time, numbered (1/N…). Translate prose into the session language
on the fly — code snippets stay untouched. The correct option is deliberately
shuffled between A and B. Each question carries its coverage ids in an HTML
comment (traceability → COVERAGE.md).

**Selection guide**: always include the axis-1/2/3 fundamentals (Q1–Q5) and
at least one question per axis family the dev will be scanned on; prefer
Q16–Q25 (mechanics questions) for seasoned/senior; keep the total ~12 for
junior, ~15 for senior.

---

## Q1 — axis 1 (invalidation boundaries) <!-- inventory: S1, S5 -->

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

## Q2 — axis 2 (ForEach identity) <!-- inventory: F1, F2, F31 -->

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
delete + insert, two equal tags = collision, and every field is hashed on
every diff. A stable id survives edits. (Nuance: \.self is tolerable for
immutable, guaranteed-unique values, e.g. enum cases.)

---

## Q3 — axis 2 (ForEach identity, indices) <!-- inventory: F11, F12 -->

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

## Q4 — axis 3 (derived data in the body) <!-- inventory: F40, D29 -->

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
Cache the derived collection; recompute where the data changes.

---

## Q5 — axis 3 (transitive derivations) <!-- inventory: D28 -->

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

**Answer: B.** Computed properties establish dependencies transitively and
recompute per read — moving the computation doesn't remove it; only *storing*
the derived value does.

---

## Q6 — axis 4 (@Observable, Equatable) <!-- inventory: D21, D22 -->

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
`store.filter = x` re-renders subscribers, equal or not — costliest under
polling/streaming writes.

---

## Q7 — axis 4 (granularity) <!-- inventory: D26, D27 -->

A view reads only `store.detail.isLoading`. Someone increments
`store.detail.page`. Does the view re-render?

**A** No — it doesn't read `page`.
**B** Yes — reading one field of a struct depends on the whole struct.

**Answer: B.** Observation tracks properties of the observable CLASS; the
granularity stops at the property. A struct-typed property is ONE dependency
on the entire value. Flatten hot fields into separate store properties.

---

## Q8 — axis 5 (bindings) <!-- inventory: D49, D50 -->

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

## Q9 — axis 6 (localization types) <!-- inventory: L14, L17 -->

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

## Q10 — axis 6 (locale) <!-- inventory: L41 -->

To display a percentage:

**A**
```swift
Text(value.formatted(.percent.locale(Locale(identifier: "en_US"))))
```

**B**
```swift
Text(value.formatted(.percent))    // follows the user's locale
```

**Answer: B.** Hardcoding the locale freezes the app in ONE convention and
ignores user settings. The locale comes from the environment. (Exception: in
TESTS, pinning the locale is on the contrary the best practice.)

---

## Q11 — axis 7 (deprecated APIs) <!-- inventory: catalog top-10 -->

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

## Q12 — axis 8 (testing, force-unwrap) <!-- inventory: T22 -->

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

## Q13 — axis 8 (testing, determinism) <!-- inventory: house rule 8.13 -->

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

## Q14 — axis 9 (guard-first) <!-- inventory: house rule -->

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

## Q15 — axis 10 (conditional modifiers) <!-- inventory: M4, M5, M6, M7 -->

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
@State lost, animations broken, remove+insert instead of animating the value.
The always-applied modifier with a ternary value is THE prescribed fix.

---

## Q16 — axis 11 (view init) <!-- inventory: S14, S23 -->

How many times does a List row view's `init` run?

**A** Once, when the row first appears — init is the setup hook.
**B** On every evaluation of the parent's body — potentially many times per
second while scrolling or animating.

**Answer: B.** View structs are rebuilt freely; `init` is NOT a one-time
setup hook (that intuition comes from classes). Anything beyond a
constant-time copy of inputs is multiplied by the render rate — loading,
decoding and formatting belong to the model layer or `.task`.

---

## Q17 — axis 4 (value vs reference inputs) <!-- inventory: D1, D2 -->

Two views: one takes a `struct Payload` (30 fields), one takes an
`@Observable final class Model`. What does each pay when the parent body
re-runs?

**A** Both are compared the same way — SwiftUI diffs inputs generically.
**B** The struct is compared field by field (30 comparisons, every pass);
the class is compared by pointer, and the view re-renders only for the
properties it actually reads.

**Answer: B.** Value-type inputs make the input's *shape* the invalidation
surface; reference types compare by identity with per-property tracking.
That's why "pass narrow inputs" targets big structs, not observable models.

---

## Q18 — axis 13 (environment mechanics) <!-- inventory: E1–E4, E25 -->

You store a closure `(Item) -> Void` in a custom environment key. An ancestor
writes ANY other environment key. What happens to the subtree reading yours?

**A** Nothing — your key didn't change.
**B** Every reader re-reads its keys; a closure can't be compared, so every
re-read counts as a change — the whole reading subtree invalidates.

**Answer: B.** Environment writes propagate subtree-wide and readers re-read
their keys; function values defeat comparison. That's why closures are
banned from custom keys (framework action types like `DismissAction` are the
designed exception) — defunctionalize: data as properties, behavior as a
method or `callAsFunction`.

---

## Q19 — axis 13 (default stability) <!-- inventory: E41, E46, E47 -->

```swift
extension EnvironmentValues {
    @Entry var session = Session()      // class Session
}
```

Which question decides whether this default is a problem?

**A** "Is `Session` Equatable?"
**B** "Does the default expression return a different result between calls?"

**Answer: B.** `@Entry` wraps its initializer in a computed getter — the
expression re-evaluates on every fallback read. A fresh `Session()` per read
means an ancestor write hands fallback readers a *different* instance each
time = invalidation. Equatable doesn't help (degenerate `==` still
re-evaluates). Fixes: a `private static let` backing (A), a manual key with
a stored default (B), or an Optional entry (C) when readers use sentinels.

---

## Q20 — axis 13 (coarsening) <!-- inventory: E34, E38 -->

Rows need to react to scroll position. Which is the fix?

**A** Move the raw scroll offset into an `@Observable` model and let rows
read it there.
**B** Coarsen what rows READ — e.g. a per-item `isVisible` (or an
`isWide = width > 600` boolean), maintained from the raw value in the model.

**Answer: B.** @Observable is the precondition, not the fix: rows reading the
RAW offset still invalidate on every scroll tick. The invalidation count
drops only when the value the view reads becomes coarse (a row then
invalidates at most on enter/leave). Purely visual effects go renderer-side
(`scrollTransition` / `visualEffect`).

---

## Q21 — axis 12 (row shape) <!-- inventory: F53, F54 -->

```swift
struct AttachmentRow: View {
    let item: Attachment
    var body: some View {
        if item.hasPreview { PreviewCard(item) }    // no else
    }
}
```

What does this do to the List containing it?

**A** Nothing special — rows without previews just render empty.
**B** The row builder produces 0-or-1 views per element — a non-constant
count that defeats List's fast path for every row.

**Answer: B.** The fast path templates row identities from element ids only
when every row yields the SAME constant number of top-level views. Optional
interior content → wrap in a single-root container; "skip this element" →
filter before the ForEach.

---

## Q22 — axis 8 (confirmation shape) <!-- inventory: T33 -->

Testing that a delegate callback fires:

**A**
```swift
await confirmation { confirm in
    sut.onFinish = { confirm() }
    await sut.run()                  // work INSIDE the closure
}
```

**B**
```swift
let c = TestConfirmation()
sut.onFinish = { c.confirm() }
await sut.run()
await c.wait()                       // install, run, then await
```

**Answer: A.** `confirmation()` wraps the work that triggers the callback —
handler installed inside the closure, no await-afterwards step. (B is the
XCTestExpectation mental model; Swift Testing has no standalone
wait-afterwards confirmation.)

---

## Q23 — axis 4 (onChange dependencies) <!-- inventory: D43, D44 -->

A screen reads `scenePhase` ONLY to run `.onChange(of: scenePhase)` — the
body never renders it. Does the body still re-run when scenePhase changes?

**A** No — it's only used for the side effect.
**B** Yes — a dependency read for onChange is still a body dependency; the
whole body re-evaluates on every change.

**Answer: B.** Reading is reading. When the value is used ONLY for a side
effect and the body is non-trivial, extract the onChange AND its dependency
into a dedicated ViewModifier — the parent body stops depending on it.

---

## Q24 — axis 4 (@MainActor observables) <!-- inventory: D18, D19 -->

An `@Observable` class is written from a background `Task` and read by view
bodies. What's missing?

**A** Nothing — @Observable handles thread safety.
**B** `@MainActor` on the class (unless the project sets default MainActor
isolation) — background writes race main-actor body reads.

**Answer: B.** Observation doesn't synchronize; this is a data race that
Swift 6 strict concurrency flags, not a style preference. (Nuance: models
only ever touched from bodies can omit it — that's why it's judged, not
auto-flagged.)

---

## Q25 — axis 15 (Group semantics) <!-- inventory: S24–S28 -->

Which Group is the useless one?

**A**
```swift
Group {                     // shared modifier over branches
    if isCompact { CompactHeader() } else { FullHeader() }
}.padding()
```

**B**
```swift
Group {                     // single static child
    ProfileCard(user: user)
}.padding()
```

**Answer: B.** Group exists to hand several children to one slot, or to
share a modifier across branches (A is blessed, as is `Group { ForEach … }`).
A single-child Group only wraps the type — every chained modifier
type-checks against `Group<T>`: compile-time cost for nothing.
