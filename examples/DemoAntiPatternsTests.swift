// DemoAntiPatternsTests.swift — Created by Orka
// Test fixture DELIBERATELY faulty, for axis 8 of the scan.
// Do NOT take inspiration.

import XCTest                                    // Axis 8: XCTest instead of Swift Testing

final class DemoAntiPatternsTests: XCTestCase {

    let catalog: [Project] = [
        Project(name: "core", criticality: 3),
        Project(name: "ui", criticality: 1),
    ]

    func testMostCriticalProject() {
        // Axis 8: fixture force-unwrap — a failure crashes the WHOLE test process
        let core = catalog.first(where: { $0.name == "core" })!
        XCTAssertEqual(core.criticality, 3)
    }

    func testRecentDate() {
        // Axis 8: Date() and Calendar.current — machine- and day-dependent result
        let now = Date()
        let isWeekend = Calendar.current.isDateInWeekend(now)
        XCTAssertFalse(isWeekend)                // red on Saturdays, green on Mondays…
    }

    func testDecoding() {
        // Axis 8: try! — process crash instead of a test failure
        let data = try! JSONEncoder().encode(["name": "core"])
        XCTAssertFalse(data.isEmpty)
    }
}
