# Coverage matrix

**378 discrete Apple SwiftUI/Testing recommendations inventoried · 369 covered
(97.6%) · 9 excluded with reasons · coverage of the checkable set: 100%.**

Every checkable Apple recommendation has a line here. If you find one that
doesn't, that's a bug — issues welcome.

How to read a line: `id → axis.sub-rule` means the scanner checks it;
`→ axis DNF` means it is implemented as an anti-false-positive guard in that
axis's **Do NOT flag** section (those guards are as load-bearing as the
positive rules); `+ QUIZ Qn` means a quiz question also teaches it;
`→ axis (concept)` means the mechanism is taught in the axis's Concept
section and its report prose; `EXCLUDED` items don't apply to a consented
audit tool, with the reason stated.

Inventory ids (S/D/E/F/M/A/L/SD/T/W) are our own working taxonomy of Apple's
public guidance — see each rule's Reference links for the primary sources.

## Structure (S1–S28)

| Id | Mapped to |
|---|---|
| S1 | 1 (concept) + QUIZ Q1 |
| S2 | 1.1 |
| S3 | 1.2 |
| S4 | 1.3 |
| S5 | 1 (concept) + QUIZ Q1 |
| S6 | 1.6 |
| S7 | 1 DNF (tiny fragments) |
| S8 | 1.1 + 1 DNF (targets organizational factoring) |
| S9 | 1.5 |
| S10 | 1.1 |
| S11 | 1.5 |
| S12 | 1.2 |
| S13 | 11.1 |
| S14 | 11 (concept) + QUIZ Q16 |
| S15 | 11.2 |
| S16 | 11.3 |
| S17 | 11.4 |
| S18 | 11.5 |
| S19 | 11.6 |
| S20 | 11.7 |
| S21 | 11.5 |
| S22 | 11.7 |
| S23 | 11 (concept) + QUIZ Q16 |
| S24 | 15.1 |
| S25 | 15 DNF (Group{ForEach}) |
| S26 | 15 DNF (2+ children) |
| S27 | 15 DNF (Group{if/else}) |
| S28 | 15 (concept) + QUIZ Q25 |

## Data flow (D1–D61)

| Id | Mapped to |
|---|---|
| D1 | 4 (concept) + QUIZ Q17 |
| D2 | 4 (concept) + QUIZ Q17 |
| D3 | 4 DNF (reference-type inputs) |
| D4 | 4.5 |
| D5 | 4.5 |
| D6 | 4 DNF (forwarding = reading) |
| D7 | 4 DNF (forwarding parent correctly factored) |
| D8 | 4.5 |
| D9 | 4.5 |
| D10 | 4.5 |
| D11 | 4.5 |
| D12 | 4.5 |
| D13 | 3.5 (cross-ref 4.5) |
| D14 | 4.8 |
| D15 | 4.8 + 4 DNF (recommend, don't auto-change) |
| D16 | 4.1 |
| D17 | 4.1 |
| D18 | 4.2 |
| D19 | 4.2 + QUIZ Q24 |
| D20 | 4.2 |
| D21 | 4.3 |
| D22 | 4.3 + QUIZ Q6 |
| D23 | 4.3 |
| D24 | 4.3 |
| D25 | 4.3 |
| D26 | 4 (concept) + QUIZ Q7 |
| D27 | 4 (concept) + QUIZ Q7 |
| D28 | 3.2 |
| D29 | 3.3 |
| D30 | 3.5 |
| D31 | 4.4 |
| D32 | 4 DNF (several narrow reads) |
| D33 | 4 (concept) |
| D34 | 4 DNF (list view owns its collection dependency) |
| D35 | 4.6 |
| D36 | 4.6 (cross-ref 2.2) |
| D37 | 4.6 |
| D38 | 4.6 |
| D39 | 4.7 |
| D40 | 4.4 |
| D41 | 4.4 |
| D42 | 4.4 |
| D43 | 4.9 + QUIZ Q23 |
| D44 | 4.9 |
| D45 | 4.9 |
| D46 | 4 DNF (onChange extraction gating) |
| D47 | 4 DNF |
| D48 | 4 DNF |
| D49 | 5.1 |
| D50 | 5.1 + QUIZ Q8 |
| D51 | 5.2 |
| D52 | 5.3 |
| D53 | 13.7 |
| D54 | 13.5 |
| D55 | 13.7 |
| D56 | 13 DNF (stable default shapes) |
| D57 | 13.7 |
| D58 | 13.7 |
| D59 | 13.7 |
| D60 | 13.7 |
| D61 | 13.7 (show the diff, don't rewrite) |

## Environment (E1–E72)

| Id | Mapped to |
|---|---|
| E1 | 13 (concept) + QUIZ Q18 |
| E2 | 13 (concept) + QUIZ Q18 |
| E3 | 13.1 + QUIZ Q18 |
| E4 | 13 (concept) + QUIZ Q18 |
| E5 | 13.1 |
| E6 | 13 DNF (framework action types) |
| E7 | 13.1 |
| E8 | 13.1 |
| E9 | 13.1 |
| E10 | 13.1 (NOT-fix: struct wrapper) |
| E11 | 13.1 (NOT-fix: hoisted property) |
| E12 | 13.2 |
| E13 | 13.2 |
| E14 | 13.2 |
| E15 | 13.2 |
| E16 | 13.2 |
| E17 | 13 DNF (optionality per context) |
| E18 | 13.2 |
| E19 | 13.2 |
| E20 | 13 DNF (@MainActor defensive default) |
| E21 | 13.2 |
| E22 | 13.2 |
| E23 | 13.2 |
| E24 | 13.2 |
| E25 | 13 (concept) + QUIZ Q18 |
| E26 | 13.3 |
| E27 | 13.3 |
| E28 | 13.3 |
| E29 | 13.3 |
| E30 | 13.3 |
| E31 | 13.3 |
| E32 | 13.3 |
| E33 | 13.3 |
| E34 | 13.4 |
| E35 | 13.3 (anti-fix: raw reads) |
| E36 | 13.4 |
| E37 | 13.4 |
| E38 | 13.4 + QUIZ Q20 |
| E39 | 13.4 |
| E40 | 13.4 |
| E41 | 13.5 + QUIZ Q19 |
| E42 | 13.5 |
| E43 | 13.5 |
| E44 | 13.5 |
| E45 | 13.5 |
| E46 | 13.5 + QUIZ Q19 |
| E47 | 13.5 (operative test) + QUIZ Q19 |
| E48 | 13.5 + 13 DNF |
| E49 | 13.5 |
| E50 | 13.5 (routes to 13.1) |
| E51 | 13.5 (live vs latent) |
| E52 | 13.5 (NOT-fix: degenerate ==) |
| E53 | 13 DNF (defensive memoization) |
| E54 | 13 DNF (defensive Equatable) |
| E55 | 13 DNF (defensive refactors are noise) |
| E56 | 13 DNF (stable reference field) |
| E57 | 13 DNF (deterministic inline struct) |
| E58 | 13.6 (fix A) |
| E59 | 13.6 (fix B) |
| E60 | 13.6 |
| E61 | 13.6 (fix C) |
| E62 | 13.6 (sentinel diagnostic) |
| E63 | 13.6 |
| E64 | 13.6 |
| E65 | 13.6 (make the call) |
| E66 | 13.8 |
| E67 | 13.8 |
| E68 | 13.8 + 13 DNF (type-form registers no dependency) |
| E69 | 13.8 |
| E70 | 13.8 |
| E71 | 13.8 |
| E72 | 13.8 (cleanup framing) |

## ForEach & rows (F1–F62)

| Id | Mapped to |
|---|---|
| F1 | 2.1 |
| F2 | 2.1 |
| F3 | 2 (concept) |
| F4 | 2.8 |
| F5 | 2.8 |
| F6 | 2.8 |
| F7 | 2.8 |
| F8 | 2.8 |
| F9 | 2.8 |
| F10 | 2.8 |
| F11 | 2.2 |
| F12 | 2.2 |
| F13 | 2.1 |
| F14 | 2.2 |
| F15 | 2 DNF (.enumerated() legitimate) |
| F16 | 2.3 |
| F17 | 2.3 |
| F18 | 2.3 |
| F19 | 2 DNF (Array() pre-6.1) |
| F20 | 2.3 |
| F21 | 2.4 |
| F22 | 2.4 |
| F23 | 2.4 |
| F24 | 2.4 |
| F25 | 2.4 |
| F26 | 2.5 |
| F27 | 2.7 |
| F28 | 2.7 |
| F29 | 2 DNF (explicit keypath acceptable) |
| F30 | 2 DNF (don't force Identifiable) |
| F31 | 2.6 |
| F32 | 2.6 |
| F33 | 2.6 |
| F34 | 2.6 |
| F35 | 2 DNF (fix the id, keep Hashable) |
| F36 | 2.1 |
| F37 | 2.5 |
| F38 | 2.5 |
| F39 | 2.5 |
| F40 | 3.1 |
| F41 | 3 (concept) |
| F42 | 3.3 |
| F43 | 3.4 |
| F44 | 3 DNF (cheap transforms) |
| F45 | 12.1 |
| F46 | 12.2 |
| F47 | 12.3 |
| F48 | 12.2 |
| F49 | 12.7 |
| F50 | 12.1 |
| F51 | 12.6 |
| F52 | 12.3 |
| F53 | 12.4 + QUIZ Q21 |
| F54 | 12.1 + QUIZ Q21 |
| F55 | 12.4 |
| F56 | 12.4 |
| F57 | 12.5 |
| F58 | 12.5 |
| F59 | 12.5 |
| F60 | 12.5 |
| F61 | 12.7 |
| F62 | 12.8 |

## Modifiers (M1–M7) & Animations (A1–A7)

| Id | Mapped to |
|---|---|
| M1 | 10.1 |
| M2 | 10.3 |
| M3 | 10.3 |
| M4 | 10 (concept) + QUIZ Q15 |
| M5 | 10 (concept) + QUIZ Q15 |
| M6 | 10 (concept) + QUIZ Q15 |
| M7 | 10.2 |
| A1 | 16.1 |
| A2 | 16.2 |
| A3 | 16.3 |
| A4 | 16.3 |
| A5 | 16.2 + 16 DNF (custom interpolation legitimate) |
| A6 | 16.4 |
| A7 | 16.4 |

## Localization (L1–L54)

| Id | Mapped to |
|---|---|
| L1 | 6.10 |
| L2 | 6 DNF (existing .strings projects) |
| L3 | 6.10 |
| L4 | 6.10 |
| L5 | 6.10 |
| L6 | 6.10 |
| L7 | 6.3 |
| L8 | 6.3 |
| L9 | 6.3 |
| L10 | 6 DNF (opaque keys vs literals: both valid) |
| L11 | 6.3 |
| L12 | 6.3 (verbatim = legitimate opt-out) |
| L13 | 6 DNF (verbatim on a variable) |
| L14 | 6.1 + QUIZ Q9 |
| L15 | 6.1 |
| L16 | 6.2 |
| L17 | 6.2 |
| L18 | 6.2 |
| L19 | 6.4 |
| L20 | 6.4 |
| L21 | 6.4 |
| L22 | 6.4 |
| L23 | 6.5 |
| L24 | 6.5 |
| L25 | 6.5 |
| L26 | 6 DNF (user-typed text) |
| L27 | 6.5 |
| L28 | 6.6 |
| L29 | 6.6 |
| L30 | 6.6 |
| L31 | 6.6 |
| L32 | 6.6 |
| L33 | 6.7 |
| L34 | 6.7 |
| L35 | 6.7 |
| L36 | 6.6 |
| L37 | 6.8 |
| L38 | 6.8 |
| L39 | 6.8 |
| L40 | 6.8 |
| L41 | 6.9 + QUIZ Q10 |
| L42 | 6.9 |
| L43 | 6.9 |
| L44 | 6.9 |
| L45 | 6.9 |
| L46 | 6.9 |
| L47 | 6.2 |
| L48 | 6.2 |
| L49 | 6.2 |
| L50 | 6 DNF (no sweeping in unrelated edits) |
| L51 | 6.2 |
| L52 | 6.10 |
| L53 | 6.10 |
| L54 | 6.10 |

## Soft-deprecation process (SD1–SD23) + catalog meta

| Id | Mapped to |
|---|---|
| SD1 | 7.3 (consent inverts assistant scoping) |
| SD2 | 7.3 |
| SD3 | 7.3 |
| SD4 | 7.3 |
| SD5 | 7.3 |
| SD6 | 7.3 |
| SD7 | 7.3 |
| SD8 | 7.1 |
| SD9 | 7.1 |
| SD10 | 7.1 |
| SD11 | EXCLUDED — code-generation process rule for assistants; this tool audits, it doesn't generate app code |
| SD12 | EXCLUDED — same (never *generate* deprecated-API code) |
| SD13 | 7.1 (verify against the catalog, not memory) |
| SD14 | 7.2 |
| SD15 | 7.2 |
| SD16 | EXCLUDED — feature/bugfix scoping for assistants; an audit has no feature edits |
| SD17 | EXCLUDED — same |
| SD18 | EXCLUDED — same |
| SD19 | EXCLUDED — same |
| SD20 | EXCLUDED — fresh-code generation rule; not applicable to an audit |
| SD21 | EXCLUDED — same |
| SD22 | 7.3 + 7 DNF (consented scope only) |
| SD23 | 7.3 + 7 DNF |
| Meta1 | 7.1 (authoritative catalog lookup) |
| Meta2 | 7.1 (sweep regex) |

## Testing (T1–T52)

| Id | Mapped to |
|---|---|
| T1 | 8.1 |
| T2 | 8.1 |
| T3 | 8.1 |
| T4 | 8.1 |
| T5 | 8.1 |
| T6 | 8.1 |
| T7 | 8.1 |
| T8 | 8.1 |
| T9 | 8.1 |
| T10 | 8.1 |
| T11 | 8.1 |
| T12 | 8.1 + 8.4 (migration constraint) |
| T13 | 8 DNF (XCUI* not migratable) |
| T14 | 8.2 |
| T15 | 8.2 |
| T16 | 8.2 |
| T17 | 8.2 |
| T18 | EXCLUDED — compiler-enforced (mutating tests); nothing to check |
| T19 | 8.2 |
| T20 | 8.4 |
| T21 | 8.4 |
| T22 | 8.3 + QUIZ Q12 |
| T23 | 8.5 |
| T24 | 8.5 |
| T25 | 8.5 |
| T26 | 8.4 |
| T27 | 8.5 |
| T28 | 8.5 |
| T29 | 8.6 |
| T30 | 8.6 |
| T31 | 8.6 |
| T32 | 8.6 |
| T33 | 8.7 + QUIZ Q22 |
| T34 | 8.7 |
| T35 | 8.8 |
| T36 | 8.9 |
| T37 | 8.9 |
| T38 | 8.9 |
| T39 | 8.10 |
| T40 | 8.10 |
| T41 | 8.10 |
| T42 | 8.10 |
| T43 | 8.10 |
| T44 | 8.10 |
| T45 | 8 DNF (opt-in style, never a defect) |
| T46 | 8 DNF |
| T47 | 8 DNF |
| T48 | 8.11 (with the forward/reversed carve-out) |
| T49 | 8 DNF (mixed files mid-migration) |
| T50 | 8.11 (suggestions, not findings) |
| T51 | 8.12 |
| T52 | 8.12 |

## SDK 27 (W1–W10) + opt-in exclusion groups

| Id | Mapped to |
|---|---|
| W1 | 14.2 |
| W2 | 14.1 (LIVE correctness bug on SDK ≤ 26) |
| W3 | 14.3 |
| W4 | 14.4 |
| W5 | 14.5 |
| W6 | 14.6 |
| W7 | 14.7 |
| W8 | 14.8 |
| W9 | 14.9 |
| W10 | 14.10 |
| B2 (7 groups: reorderable, AsyncImage(request:), constrained-space toolbars, alert(item:), swipeActionsContainer, Readable/WritableDocument, @ContentBuilder adoption) | 14 DNF — flagging their *absence* is noise; FileDocument is CORRECT below target 27 |

## Tally

- Inventoried: **378** (S 28 + D 61 + E 72 + F 62 + M 7 + A 7 + L 54 +
  SD 23 + catalog meta 2 + T 52 + W 10).
- Covered by a scanner sub-rule, a Do-NOT-flag guard, a Concept section, or
  a quiz question: **369**.
- EXCLUDED: **9** — SD11, SD12, SD16, SD17, SD18, SD19, SD20, SD21
  (assistant code-generation/scoping process rules, inapplicable to a
  consented audit) and T18 (compiler-enforced, nothing to check).
- **Coverage of the checkable set: 369/369 = 100%. Coverage of the full
  inventory: 369/378 = 97.6%.**

House rules with no Apple-inventory id (axis 9 guard-first, axis 8.13
determinism) are additive — they don't count toward the totals.
