---
axis: 8
id: testing
title: "Testing — Swift Testing migration, #require discipline, determinism"
severity: high
patterns:
  - "import XCTest"
  - ":\\s*XCTestCase"
  - "\\bXCTAssert[A-Za-z]*\\("
  - "\\bXCTUnwrap\\("
  - "\\bXCTFail\\("
  - "XCTestExpectation|expectation\\(description:|waitForExpectations|fulfillment\\(of:"
  - "override\\s+func\\s+(setUp|tearDown)"
  - "func\\s+test[A-Z_]"
  - "XCTSkip|XCTExpectFailure|XCTAttachment"
  - "continueAfterFailure"
  - "var\\s+\\w+\\s*:\\s*\\w+!"
  - "try!\\s"
  - "\\)!"
  - "DispatchSemaphore|RunLoop\\.current\\.run"
  - "Calendar\\.current"
  - "Date\\(\\)"
  - "guard\\s+let[^\\n]*else\\s*\\{\\s*Issue\\.record"
  - "^\\s*//\\s*(#expect|#require|XCTAssert)"
  - "#_"
scope: "test files only (Tests/, *Tests.swift); UI-automation targets excluded — both XCUI*-using files AND Xcode-convention *UITests/ folders (outside SwiftPM layout)"
---

# Testing

## Concept

Modern Swift tests use Swift Testing (`@Test`, `#expect`, `#require`,
traits, confirmations): struct suites with per-test init, expressive failure
messages, parallel by default. Three disciplines matter beyond the migration
itself: **fail one test, never kill the process** (`#require` over
force-unwraps), **preserve failure semantics when migrating** (a
`continueAfterFailure = false` class means `try #require` everywhere
downstream), and **determinism** (inject dates, calendars, locales — never
depend on the machine or the day).

## Sub-rules

**Migration detectors** (the finding IS the pattern; all mean "unmigrated"):

- **8.1 XCTest presence** (high, GREP). `import XCTest`, `: XCTestCase`,
  `XCTAssert*` / `XCTUnwrap`, `XCTFail`, `XCTestExpectation` /
  `waitForExpectations` / `fulfillment(of:)`, `override setUp/tearDown`
  (→ `init`/`deinit`), `func test…` prefixes (→ `@Test`), `XCTSkip*`
  (→ `.disabled(if:)` / `.enabled(if:)` traits or `Test.cancel`),
  `XCTExpectFailure` (→ `withKnownIssue`), `XCTAttachment`
  (→ `Attachment.record`). Note: XCTest re-exported Foundation — migrated
  files may need an explicit `import Foundation`.
- **8.2 Suite structure** (med/high, GREP + JUDGMENT). Prefer struct suites
  (`final class` without a deinit/shared-state reason is a smell; actor/class
  only when genuinely needed). No implicitly-unwrapped stored fixtures
  (`var sut: Thing!`) — suites are value types with init per test; fixtures
  become stored properties instead of duplicated `let x = Foo()` in every
  body. Suite-wide traits go on `@Suite`, not repeated per test.

**Failure-handling discipline:**

- **8.3 #require over force-unwrap** (high, GREP). A failing `fixture!` or
  `try!` crashes the WHOLE test process — every other test dies with it.
  `try #require(value)` fails ONE test and the run continues.
- **8.4 Preserve continueAfterFailure semantics** (high, GREP → JUDGMENT).
  A class setting `continueAfterFailure = false` (especially in `setUp`)
  stops at first failure: its assertions must migrate to `try #require`
  EVERYWHERE downstream — migrating them to `#expect` silently changes
  behavior. Never downgrade an existing `try #require` to `#expect`; choose
  between them by whether the test must exit after the failure.
- **8.5 Issue.record promotions** (high/med, GREP). `guard let … else {
  Issue.record(…); return }` → `try #require(value, "msg")`. Boolean guards
  likewise. `if !x { Issue.record(…) }` without early exit → `#expect(x)`.
  A surviving raw `Issue.record` needs justification. Drop failure messages
  that just restate the expression.
- **8.6 Error assertions** (med, GREP → JUDGMENT). Name the specific error
  when it's Equatable and known: `#expect(throws: SpecificError.self)`;
  inspect via the return value when needed. "Does not throw" =
  `#expect(throws: Never.self)` — don't drop `XCTAssertNoThrow` semantics on
  the floor. No accuracy-comparison helper exists in Swift Testing — write
  `abs(a - b) < tolerance` explicitly; inventing an API is wrong.

**Async & concurrency:**

- **8.7 confirmation() shape** (high, JUDGMENT). `confirmation()` wraps the
  work that triggers the callback — the handler is installed INSIDE the
  closure; there is no await-afterwards step. Over-fulfillment tolerance is
  an `expectedCount:` range (`10...`).
- **8.8 No manual waiting** (med, GREP). Tests can be `async throws` —
  `DispatchSemaphore`, `RunLoop.current.run`, `waitForExpectations` are all
  smells in Swift Testing files.
- **8.9 Isolation honesty** (high/med, GREP → JUDGMENT). `@MainActor` only
  where main-actor isolation is genuinely relied on — blanket suite
  annotation is wrong. Suites with shared mutable state (static vars,
  singletons, shared file paths) need `.serialized` — parallel-by-default
  otherwise means flakes; such suites may also warrant actor/class instead
  of struct.

**Traits & known issues:**

- **8.10 Statically visible skips and failures** (med, GREP). Skips as
  traits (`.disabled(if:)` / `.enabled(if:)`); mid-test abandonment via
  `try Test.cancel("reason")`; OS gating via `@available` on the test
  function, not `.enabled(if: #available…)`. Expected failures →
  `withKnownIssue` scoped with `when:`/`matching:` (never blanket-wrapped),
  `isIntermittent: true` for flaky ones — never commented-out asserts or
  disabled tests.

**Modern structure:**

- **8.11 Parameterized tests** (med, GREP heuristic → JUDGMENT).
  `@Test(arguments:)` for looped inputs or 3+ near-identical bodies.
  Carve-out: determinism tests comparing forward vs reversed input in ONE
  body are structurally monolithic — never parameterize them.
- **8.12 Diagnostics & API hygiene** (low/high, GREP). `Attachment.record`
  over `print` and ad-hoc file writes. Never underscore-prefixed internals
  (`#_sourceLocation`) — use public `SourceLocation(fileID:filePath:line:column:)`.

**Determinism (any framework):**

- **8.13 Inject time and place** (high, GREP). `Date()` and
  `Calendar.current` inside tests computing relative time = results that
  depend on the machine, the timezone, the day. Inject fixed dates, explicit
  `Calendar`, pinned `Locale(identifier:)` — the pinned locale is a BEST
  practice here, unlike in app code.

## Do NOT flag

- **XCUI\*** (`XCUIApplication`, `XCUIElement`, UI-automation targets):
  NOT migratable to Swift Testing — flagging it is a false positive. This
  exclusion covers Xcode-convention **`*UITests/` folders** too (projects
  outside the SwiftPM `Tests/` layout): skip those directories entirely for
  this axis, whatever their file names.
- **Mixed XCTest + Swift Testing files/targets mid-migration**: legitimate —
  report "migration in progress", never as a failure. One class at a time is
  the sane migration unit.
- **Raw-identifier sentence naming** (```@Test func `renders empty state`
  ()```): CONTESTED STYLE — present as opt-in, never as a defect; camelCase
  test names are fine. (Same for "single-word names stay plain".)
- **`try!` / `)!` matches**: confirm a real fixture force-unwrap — not `!=`,
  not a legitimate optional chain.
- **Already-Swift-Testing suites** are still worth a modernization glance
  (parameterization, traits, confirmations, serialization) — but as
  suggestions, not findings.
- **No test files in the focus scope**: the axis is NOT gradable — neutral
  chip, excluded from the overall mean, never 1/5 for absence (prose remark
  at most).

## 5-minute fix

Before:

```swift
func testScore() {
    let release = catalog.first(where: { $0.id == "core" })!   // process crash if missing
    XCTAssertEqual(engine.score(release, at: Date()), 87)      // depends on today
}
```

After:

```swift
@Test func score() throws {
    let release = try #require(catalog.first { $0.id == "core" })  // ONE test fails cleanly
    let fixed = Date(timeIntervalSince1970: 1_750_000_000)
    #expect(engine.score(release, at: fixed) == 87)                // same result everywhere
}
```

## Reference

- https://developer.apple.com/documentation/testing
- https://developer.apple.com/documentation/testing/migratingfromxctest
