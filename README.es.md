[English](README.md) · [Français](README.fr.md) · **Español** · [Deutsch](README.de.md)

# 🐙 do-i-code-like-apple

> **¿Programo como Apple?**
> Autoevaluación para devs iOS/SwiftUI de cualquier nivel — quiz + escaneo de
> tu proyecto real, un informe HTML que nunca culpabiliza. Impulsado por
> Claude Code. Funciona en tu idioma.

## Lanzar

```bash
npx do-i-code-like-apple --lang es
```

Requisito: [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
instalado (`claude` en el PATH). Cero dependencias npm.

## Qué pasa

1. **Una pregunta de nivel** (junior / intermedio / senior) — solo adapta la
   pedagogía del informe, nunca el veredicto.
2. **Un quiz** (~12–15 preguntas de un banco de 25) con snippets de código.
3. **Un escaneo de tu proyecto real** (opcional): confronta **lo que CREES
   hacer** con **lo que tu código MUESTRA**, en **16 ejes** (invalidación,
   identidad de ForEach, datos derivados, @Observable, bindings,
   localización, APIs obsoletas, tests, guard-first, modifiers
   condicionales, inits de vistas, filas de List, disciplina de environment,
   preparación SDK 27, Groups, animaciones). El código antiguo queda fuera
   de la nota y sirve para medir **tu progreso**.
4. **Un informe HTML** autocontenido: nota global, pulpos 🐙 por eje, el cara
   a cara declarado/observado, y el top 3 de «fixes de 5 minutos» con
   enlaces a la doc de Apple.

**Cobertura: el 100% de las guías comprobables de Apple para SwiftUI** (369
de 378 recomendaciones inventariadas; las 9 restantes son reglas de proceso
para asistentes, no aplicables a una auditoría consentida). La matriz de
trazabilidad completa está en [COVERAGE.md](COVERAGE.md). Cada eje incluye
una sección **Do NOT flag** con los patrones bendecidos que un linter
ingenuo marcaría por error.

El contenido canónico está en inglés; la sesión de Claude lo **traduce en
vivo** a tu idioma. Las reglas son open source y se contribuyen por PR: ver
el [README completo en inglés](README.md) y [CONTRIBUTING.md](CONTRIBUTING.md).

---

🐙 Por el desarrollador de [LibTracker](https://libtracker.io) — el pulpo
viene de familia. Construido en público en
[Horka_TV](https://www.twitch.tv/horka_tv) · impulsado por Claude Code ·
Licencia [MIT](LICENSE).
