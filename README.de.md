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
2. **Ein Quiz mit ~15 Fragen** und Code-Snippets: „Welche dieser beiden
   Versionen würdest du schreiben?" — Invalidierungsgrenzen,
   ForEach-Identität, abgeleitete Daten, @Observable, Bindings,
   Lokalisierung, veraltete APIs, Tests, guard-first, bedingte Modifier.
3. **Ein Scan deines echten Projekts** (optional): konfrontiert **was du zu
   tun GLAUBST** mit **was dein Code ZEIGT**, Achse für Achse. Freitext-
   Kontext möglich („Legacy/ stammt aus meinen Anfängen") — alter Code fließt
   nie in die Note ein und dient stattdessen der Messung **deines
   Fortschritts**.
4. **Ein selbstständiger HTML-Report**: Gesamtnote, Oktopusse 🐙 pro Achse,
   das Duell Erklärt/Beobachtet, und die Top 3 „5-Minuten-Fixes" mit Links
   zur Apple-Doku.

Der kanonische Inhalt ist auf Englisch; die Claude-Sitzung **übersetzt live**
in deine Sprache — keine Sprachkopien zu pflegen. Die Regeln sind Open Source
und per PR erweiterbar: siehe das [vollständige englische README](README.md)
und [CONTRIBUTING.md](CONTRIBUTING.md).

---

🐙 Vom Entwickler von [LibTracker](https://libtracker.io) — der Oktopus liegt
in der Familie. Build in Public auf
[Horka_TV](https://www.twitch.tv/horka_tv) · angetrieben von Claude Code ·
[MIT](LICENSE)-Lizenz.
