---
axis: 8
id: testing
title: "Testing — Swift Testing, #require, determinism"
severity: medium
patterns:
  - "import XCTest"
  - "XCTAssert"
  - "try!\\s"
  - ")!"
  - "Calendar\\.current"
  - "Date\\(\\)"
scope: "test files only (Tests/, *Tests.swift)"
reference: "Apple, Swift Testing: #expect/#require replace XCTAssert; #require fails ONE test instead of crashing the process; inject Calendar and dates for deterministic tests."
link: "https://developer.apple.com/documentation/testing"
---

# Testing

## The concept

Three markers of "coding like Apple" in tests:

1. **Swift Testing** (`@Test`, `#expect`, `#require`) over XCTest — richer
   failure messages, struct suites, `@Test(arguments:)` parameterization.

2. **`#require` over force-unwrap**: a failing `fixture!` **crashes the whole
   test process** — hundreds of other tests never run. `try #require(fixture)`
   fails ONE test and the run continues.

3. **Determinism**: `Date()` and `Calendar.current` in a test = results that
   depend on the machine, the timezone, the day. Inject a fixed date and an
   explicit `Calendar` (here, `Locale(identifier:)` IS the best practice).

## Detection (scan)

- Only scan test files.
- **No test files in the focus scope**: this axis is NOT gradable — give it a
  neutral chip (`c-mut`, "no tests in scope"), EXCLUDE it from the overall
  mean, and never grade it 1/5 for absence. Whether missing tests deserve a
  remark belongs to the report's prose, not to this axis's score.
- `try!` and `)!`: **judgment** — confirm it is a fixture force-unwrap, not a
  `!=` or a legitimate optional chain.
- `Date()`/`Calendar.current`: finding when the test computes relative time.

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
