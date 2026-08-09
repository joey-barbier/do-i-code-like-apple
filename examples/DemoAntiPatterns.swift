// DemoAntiPatterns.swift — Created by Orka
// Demo file DELIBERATELY packed with anti-patterns:
// it serves as a fixture to test the do-i-code-like-apple scan.
// Each block is annotated with the axis it must trigger.
// NEGATIVE-case blocks at the bottom must trigger NOTHING.
// Do NOT take inspiration.

import SwiftUI

// MARK: - Axis 4: coarse observation

class LegacySettings: ObservableObject {            // axis 4.1: ObservableObject
    @Published var theme = "dark"                   // axis 4.1: @Published
}

struct DashboardState {                             // axis 4.3: not Equatable → every set invalidates
    var isLoading = false
    var projects: [Project] = []
    var page = 0
}

@Observable final class DemoStore {                 // axis 4.2: no @MainActor, written from Task
    var state = DashboardState()                    // axis 4.4: struct property = coarse dependency
    var selectedTab = 0
    var demoTitle = "My projects"                   // axis 6.2: String, not LocalizedStringResource
}

struct Project: Hashable {
    var name: String
    var criticality: Int
}

// MARK: - Axis 13: environment discipline

extension EnvironmentValues {
    @Entry var onProjectTap: (Project) -> Void = { _ in }   // axis 13.1: closure key
    @Entry var session = DemoStore()                        // axis 13.5: fresh instance per fallback read
    @Entry var launchDate = Date()                          // axis 13.5: differs between calls
}

struct LegacyThemeKey: EnvironmentKey {                     // axis 13.7: manual key → @Entry
    static var defaultValue: [String] { ["dark"] }          // axis 13.5: computed default re-evaluates
}

// MARK: - Axis 14: SDK 27 readiness

struct CounterBadge: View {
    @State private var count = 0                    // axis 14.1/14.2: declaration initializer…
    let label: String

    init(label: String, start: Int) {
        self.label = label
        self.count = start                          // …assigned in init = body renders 0 TODAY (W2)
    }

    var body: some View {
        Text("\(count)")
            .overlay(Color.red.opacity(0.3))        // axis 14.5: ShapeStyle modifier as direct argument (W5)
    }
}

// MARK: - Main screen

struct DemoDashboard: View {
    @State var store = DemoStore()                  // axis 4.8: @State without private
    @Environment(\.colorScheme) private var colorScheme   // axis 13.8: declared, never used in body

    var body: some View {
        // Axis 7: NavigationView is soft-deprecated (→ NavigationStack)
        NavigationView {
            VStack {
                header
                titleRow("Projects")
                // Axis 3: inline sort in the body — recomputed on every render
                // Axis 2: id: \.self — identity = value, hashes every field
                List(store.state.projects.sorted { $0.criticality > $1.criticality },
                     id: \.self) { project in
                    ProjectRow(project: project)
                }
                // Axis 2: indices as identity
                ForEach(0..<store.state.projects.count, id: \.self) { i in
                    Text(store.state.projects[i].name)
                }
                // Axis 3.5: collection reach-through in body
                if let first = store.state.projects.first(where: { $0.criticality > 2 }) {
                    Text(first.name)
                }
            }
            // Axis 5: closure binding — two heap allocations per body
            .sheet(isPresented: Binding(
                get: { store.state.isLoading },
                set: { store.state.isLoading = $0 }
            )) { ProgressView() }
        }
    }

    // Axis 1: section as computed var — inlined into the body, no boundary
    private var header: some View {
        VStack(alignment: .leading) {
            // Axis 6.1: Text(String variable) → StringProtocol overload, never localized
            Text(store.demoTitle)
                // Axis 7: foregroundColor + cornerRadius soft-deprecated
                .foregroundColor(.secondary)
                .cornerRadius(8)
                // Axis 6.8: hardcoded frame width on text
                .frame(width: 120)
            // Axis 6.3: double-wrapped literal (eager resolution)
            Text(NSLocalizedString("Welcome", comment: ""))
            // Axis 6.4: concatenation builds an unlocalized String
            Text("Total: " + String(store.state.projects.count))
            // Axis 6.7: hardcoded currency
            Text("$\(store.state.page).00")
            // Axis 6.7: joined(separator:) for a display list
            Text(store.state.projects.map(\.name).joined(separator: ", "))
                // Axis 6.5: runtime casing transform on localized copy
                .textCase(.uppercase)
                // Axis 6.8: fixed point size instead of a text style
                .font(.system(size: 13))
            // Axis 6.9 + 6.6: hardcoded locale + DateFormatter with dateFormat
            Text(Self.formatted(date: Date()))
        }
    }

    // Axis 1.4: function-shaped section — inlined like a computed var
    private func titleRow(_ title: String) -> some View {
        HStack { Text(title); Spacer() }
    }

    // Axis 1.3: @ViewBuilder helper section — same inlining problem
    @ViewBuilder private var footer: some View {
        Text("footer")
        Text(Locale.current.identifier)             // axis 6.9: Locale.current in a view
    }

    static func formatted(date: Date) -> String {
        let f = DateFormatter()                     // axis 6.6: formatter with hardcoded pattern
        f.dateFormat = "MM/dd"
        f.locale = Locale(identifier: "fr_FR")      // axis 6.9: pinned locale in app code
        return f.string(from: date)
    }
}

// MARK: - Axis 11: heavy view init

struct ProjectCard: View {
    let summary: String

    init(json: Data) {
        // Axis 11.3: decoding in a view init — runs on every parent body pass
        let decoded = (try? JSONDecoder().decode([String: String].self, from: json)) ?? [:]
        // Axis 11.5: formatter allocation in a view init
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        summary = decoded["name", default: "?"] + (formatter.string(from: 1) ?? "")
    }

    var body: some View { Text(summary) }
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

// MARK: - Axis 12: row shapes that defeat the List fast path

enum FeedKind { case text, photo }
struct FeedItem: Identifiable { let id = UUID(); let kind: FeedKind; let hasBadge: Bool }

struct FeedRow: View {
    let item: FeedItem
    var body: some View {
        switch item.kind {                          // axis 12.2: bare top-level switch in a row body
        case .text: Text("text")
        case .photo: Text("photo")
        }
    }
}

struct BadgeRow: View {
    let item: FeedItem
    var body: some View {
        if item.hasBadge { Text("badge") }          // axis 12.4: if without else = 0-or-1 views
    }
}

// Axis 12.5: AnyView row factory — erases structural identity
func rowView(for item: FeedItem) -> AnyView {
    switch item.kind {
    case .text: return AnyView(Text("text"))
    case .photo: return AnyView(Text("photo"))
    }
}

// MARK: - Axis 15: single-child Group

struct WrappedCard: View {
    var body: some View {
        Group {                                     // axis 15.1: single static child, useless wrapper
            Text("card")
        }
        .padding()
    }
}

// MARK: - Axis 16: hand-written animatableData

struct GaugeShape: Shape {
    var progress: Double
    var animatableData: Double {                    // axis 16.2: boilerplate the @Animatable macro replaces
        get { progress }
        set { progress = newValue }
    }
    func path(in rect: CGRect) -> Path { Path(rect) }
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

// MARK: - NEGATIVE cases: blessed patterns, the scan must flag NOTHING below

struct BlessedPatterns: View {
    @Environment(\.dismiss) private var dismiss     // axis 13 DNF: framework action type (used below)
    let numbered: [Project]

    // Axis 11 DNF: formatter as static let — allocated once, this IS the fix
    static let sharedFormatter: NumberFormatter = {
        let f = NumberFormatter()
        f.numberStyle = .decimal
        return f
    }()

    var body: some View {
        // Axis 15 DNF: Group over if/else — shared modifier across branches
        Group {
            if numbered.isEmpty { Text(verbatim: "EMPTY-STATE-DEBUG") }   // axis 6 DNF: verbatim opt-out
            else { Text(verbatim: "LIST-DEBUG") }
        }
        .padding()

        // Axis 2 DNF: .enumerated() with element identity — position is row DATA, not id
        List {
            ForEach(Array(numbered.enumerated()), id: \.element.name) { pair in
                VStack {                            // axis 12: single-root container, row stays unary
                    Text(verbatim: "\(pair.offset + 1).")
                    Text(verbatim: pair.element.name)
                }
            }
        }

        Button {
            dismiss()                               // framework action: designed closure wrapper
        } label: {
            Text("Close")                           // literal → LocalizedStringKey overload, fine
        }

        // Axis 6 DNF: SF Symbol name, not an alignment — post-filter `grep -v systemName`
        Image(systemName: "chevron.right")
    }
}

// Axis 15 DNF: WindowGroup is not Group — the substring must NOT match
struct DemoScene: App {
    var body: some Scene {
        WindowGroup {
            DemoDashboard()
        }
    }
}
