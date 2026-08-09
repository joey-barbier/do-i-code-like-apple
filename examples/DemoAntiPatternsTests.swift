// DemoAntiPatternsTests.swift — Créé par Orka
// Fixture de tests VOLONTAIREMENT fautive pour l'axe 8 du scan.
// NE PAS s'en inspirer.

import XCTest                                    // Axe 8 : XCTest au lieu de Swift Testing

final class DemoAntiPatternsTests: XCTestCase {

    let catalog: [Project] = [
        Project(name: "core", criticality: 3),
        Project(name: "ui", criticality: 1),
    ]

    func testMostCriticalProject() {
        // Axe 8 : force-unwrap de fixture — un échec crashe TOUT le process de test
        let core = catalog.first(where: { $0.name == "core" })!
        XCTAssertEqual(core.criticality, 3)
    }

    func testRecentDate() {
        // Axe 8 : Date() et Calendar.current — résultat dépendant de la machine et du jour
        let now = Date()
        let isWeekend = Calendar.current.isDateInWeekend(now)
        XCTAssertFalse(isWeekend)                // rouge un samedi, vert un lundi…
    }

    func testDecoding() {
        // Axe 8 : try! — crash du process au lieu d'un échec de test
        let data = try! JSONEncoder().encode(["name": "core"])
        XCTAssertFalse(data.isEmpty)
    }
}
