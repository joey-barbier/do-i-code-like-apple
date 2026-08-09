[English](README.md) · [Français](README.fr.md) · [Español](README.es.md) · **Deutsch**

# 🐙 do-i-code-like-apple

> **Programmiere ich wie Apple?**
> Selbsteinschätzung für iOS/SwiftUI-Entwickler jeder Stufe — Quiz + Scan
> deines echten Projekts, ein HTML-Report, der niemals beschämt. Angetrieben
> von Claude Code. Funktioniert in deiner Sprache.

## Starten

```bash
npx do-i-code-like-apple --lang de
```

Voraussetzung: [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
installiert (`claude` im PATH). Null npm-Abhängigkeiten.

## Was passiert

1. **Eine Einstufungsfrage** (Junior / Fortgeschritten / Senior) — beeinflusst
   nur die Didaktik des Reports, nie das Urteil.
2. **Ein Quiz** (~12–15 Fragen aus einer Bank von 25) mit Code-Snippets.
3. **Ein Scan deines echten Projekts** (optional): konfrontiert **was du zu
   tun GLAUBST** mit **was dein Code ZEIGT**, auf **16 Achsen**
   (Invalidierungsgrenzen, ForEach-Identität, abgeleitete Daten,
   @Observable, Bindings, Lokalisierung, veraltete APIs, Tests, guard-first,
   bedingte Modifier, View-Inits, List-Rows, Environment-Disziplin,
   SDK-27-Bereitschaft, Groups, Animationen). Alter Code fließt nie in die
   Note ein — er misst stattdessen **deinen Fortschritt**.
4. **Ein selbstständiger HTML-Report**: Gesamtnote, Oktopusse 🐙 pro Achse,
   das Duell Erklärt/Beobachtet, und die Top 3 „5-Minuten-Fixes" mit Links
   zur Apple-Doku.

**Abdeckung: 100% der prüfbaren Apple-SwiftUI-Guidance** (369 von 378
inventarisierten Empfehlungen; die übrigen 9 sind Assistenten-Prozessregeln,
für ein beauftragtes Audit nicht anwendbar). Die vollständige
Rückverfolgbarkeitsmatrix: [COVERAGE.md](COVERAGE.md). Jede Achse enthält
eine **Do NOT flag**-Sektion mit den gesegneten Mustern, die ein naiver
Linter fälschlich markieren würde.

Der kanonische Inhalt ist auf Englisch; die Claude-Sitzung **übersetzt live**
in deine Sprache. Die Regeln sind Open Source und per PR erweiterbar: siehe
das [vollständige englische README](README.md) und
[CONTRIBUTING.md](CONTRIBUTING.md).

---

🐙 Vom Entwickler von [LibTracker](https://libtracker.io) — der Oktopus liegt
in der Familie. Build in Public auf
[Horka_TV](https://www.twitch.tv/horka_tv) · angetrieben von Claude Code ·
[MIT](LICENSE)-Lizenz.
