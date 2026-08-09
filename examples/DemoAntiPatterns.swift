// DemoAntiPatterns.swift — Created by Orka
// Demo file DELIBERATELY packed with anti-patterns:
// it serves as a fixture to test the do-i-code-like-apple scan.
// Each block is annotated with the axis it must trigger. Do NOT take inspiration.

import SwiftUI

// MARK: - Axis 4: non-Equatable state struct inside an @Observable

struct DashboardState {          // not Equatable → every set invalidates
    var isLoading = false
    var projects: [Project] = []
    var page = 0
}

@Observable final class DemoStore {
    var state = DashboardState()
    var selectedTab = 0
    var demoTitle = "My projects"        // String, not LocalizedStringResource (axis 6)
}

struct Project: Hashable {
    var name: String
    var criticality: Int
}

// MARK: - Main screen

struct DemoDashboard: View {
    @State private var store = DemoStore()

    var body: some View {
        // Axis 7: NavigationView is soft-deprecated (→ NavigationStack)
        NavigationView {
            VStack {
                header
                // Axis 3: inline sort in the body — recomputed on every render
                // Axis 2: id: \.self — identity = value, no stable id
                List(store.state.projects.sorted { $0.criticality > $1.criticality },
                     id: \.self) { project in
                    ProjectRow(project: project)
                }
                // Axis 2: indices as identity
                ForEach(0..<store.state.projects.count, id: \.self) { i in
                    Text(store.state.projects[i].name)
                }
            }
            // Axis 5: closure binding — two heap allocations per body
            .sheet(isPresented: Binding(
                get: { store.state.isLoading },
                set: { store.state.isLoading = $0 }
            )) { ProgressView() }
        }
    }

    // Axis 1: section as func helper — inlined into the caller's body exactly
    // like a computed var, the parameters change nothing about invalidation
    private func projectSection(_ title: String) -> some View {
        VStack {
            Text(title)
            ProgressView()
        }
    }

    // Axis 1: section as computed var — inlined into the body, no boundary
    private var header: some View {
        VStack {
            // Axis 6: Text(String variable) → StringProtocol overload, never localized
            Text(store.demoTitle)
                // Axis 7: foregroundColor + cornerRadius soft-deprecated
                .foregroundColor(.secondary)
                .cornerRadius(8)
            // Axis 6: hardcoded locale — ignores user settings
            Text(Date().formatted(.dateTime.locale(Locale(identifier: "fr_FR"))))
        }
    }
}

struct ProjectRow: View {
    let project: Project
    @State private var isHighlighted = false

    var body: some View {
        Text(project.name)
            // Axis 10: .if pattern — destroys structural identity on every toggle
            .if(isHighlighted) { $0.foregroundColor(.orange) }
    }
}

// Axis 10: the conditional helper itself
extension View {
    @ViewBuilder
    func `if`<T: View>(_ condition: Bool, transform: (Self) -> T) -> some View {
        if condition { transform(self) } else { self }
    }
}

// MARK: - Axis 9: if-let pyramid instead of guard-first

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

    // NEGATIVE case (axis 9): guard-first done right — the scan must NOT
    // flag this function (a previous rule version grepped `else { return }`
    // and flagged its own recommendation; this guards the fix).
    static func closeProject(named name: String, in store: DemoStore) {
        guard let index = path.firstIndex(of: name) else { return }
        path.remove(at: index)
    }
}
