// DemoAntiPatterns.swift — Créé par Orka
// Fichier de démonstration VOLONTAIREMENT bourré d'anti-patterns :
// il sert de fixture pour tester le scan de dev-comme-apple.
// Chaque bloc est annoté avec l'axe qu'il doit déclencher. NE PAS s'en inspirer.

import SwiftUI

// MARK: - Axe 4 : struct d'état non-Equatable dans un @Observable

struct DashboardState {          // pas Equatable → chaque set invalide
    var isLoading = false
    var projects: [Project] = []
    var page = 0
}

@Observable final class DemoStore {
    var state = DashboardState()
    var selectedTab = 0
    var demoTitle = "Mes projets"        // String, pas LocalizedStringResource (axe 6)
}

struct Project: Hashable {
    var name: String
    var criticality: Int
}

// MARK: - Écran principal

struct DemoDashboard: View {
    @State private var store = DemoStore()

    var body: some View {
        // Axe 7 : NavigationView est soft-deprecated (→ NavigationStack)
        NavigationView {
            VStack {
                header
                // Axe 3 : tri inline dans le body — recalculé à chaque render
                // Axe 2 : id: \.self — identité = valeur, pas d'id stable
                List(store.state.projects.sorted { $0.criticality > $1.criticality },
                     id: \.self) { project in
                    ProjectRow(project: project)
                }
                // Axe 2 : indices comme identité
                ForEach(0..<store.state.projects.count, id: \.self) { i in
                    Text(store.state.projects[i].name)
                }
            }
            // Axe 5 : closure binding — deux allocations heap par body
            .sheet(isPresented: Binding(
                get: { store.state.isLoading },
                set: { store.state.isLoading = $0 }
            )) { ProgressView() }
        }
    }

    // Axe 1 : section en computed var — inlinée dans le body, aucune frontière
    private var header: some View {
        VStack {
            // Axe 6 : Text(variable String) → overload StringProtocol, jamais localisé
            Text(store.demoTitle)
                // Axe 7 : foregroundColor + cornerRadius soft-deprecated
                .foregroundColor(.secondary)
                .cornerRadius(8)
            // Axe 6 : locale hardcodée — ignore les réglages utilisateur
            Text(Date().formatted(.dateTime.locale(Locale(identifier: "fr_FR"))))
        }
    }
}

struct ProjectRow: View {
    let project: Project
    @State private var isHighlighted = false

    var body: some View {
        Text(project.name)
            // Axe 10 : pattern .if — détruit l'identité structurelle à chaque bascule
            .if(isHighlighted) { $0.foregroundColor(.orange) }
    }
}

// Axe 10 : le helper conditionnel lui-même
extension View {
    @ViewBuilder
    func `if`<T: View>(_ condition: Bool, transform: (Self) -> T) -> some View {
        if condition { transform(self) } else { self }
    }
}

// MARK: - Axe 9 : pyramide de if let au lieu de guard-first

enum DemoRouter {
    static var path: [String] = []

    static func openProject(named name: String, in store: DemoStore) {
        if let project = store.state.projects.first(where: { $0.name == name }) {
            if project.criticality > 0 {
                if !store.state.isLoading {
                    path.append(project.name)
                }
            }
        }
    }
}
