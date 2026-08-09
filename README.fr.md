[English](README.md) · **Français** · [Español](README.es.md) · [Deutsch](README.de.md)

# 🐙 do-i-code-like-apple

> **Est-ce que je dev comme Apple ?**
> Auto-évaluation pour devs iOS/SwiftUI de tout niveau — QCM + scan de ton
> vrai projet, rapport HTML jamais culpabilisant. Propulsé par Claude Code.
> Fonctionne dans ta langue (fr, en, es, de… n'importe laquelle en vrai).

```
🐙 do-i-code-like-apple v0.3.0
   « Est-ce que je dev comme Apple ? »
   un poulpi de LibTracker — https://libtracker.io
```

## Lancer

```bash
npx dev-comme-apple                    # l'alias français, même outil
npx do-i-code-like-apple --lang fr     # ou la commande principale
```

Prérequis : [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
installé (`claude` dans le PATH). C'est tout — zéro dépendance npm.
Langue : flag `--lang` > variables d'env (`LANG`) > Claude demande au début.

## Ce qui se passe

1. **Une question de niveau** — junior / confirmé / senior. Ça n'influence
   jamais le verdict, seulement la pédagogie du rapport.
2. **Un QCM** (~12–15 questions tirées d'une banque de 25) avec snippets :
   « laquelle de ces deux versions tu écrirais ? ».
3. **Un scan de ton vrai projet** (optionnel) : l'outil confronte **ce que
   tu PENSES faire** (tes réponses) et **ce que ton code MONTRE** (le scan),
   axe par axe. Contexte en langage libre (« Features/Checkout c'est mon
   niveau actuel, Legacy/ date de mes débuts ») — le score ne se calcule QUE
   sur ton code d'aujourd'hui, le legacy mesure **ta progression**. Mode
   scan-only disponible si tu veux sauter le QCM.
4. **Un rapport HTML** auto-contenu : score global, poulpes 🐙 par axe, le
   face-à-face déclaré/observé (l'or de l'outil), ta progression, et le top 3
   des « fixes 5 minutes » avec avant/après et liens doc Apple.

## Les 16 axes

Frontières d'invalidation · Identité ForEach · Dérivés dans le body ·
Granularité @Observable · Bindings · Localisation · APIs soft-deprecated
(16 familles) · Tests (Swift Testing, déterminisme) · Guard-first ·
Modifiers conditionnels · Hygiène des init de vues · Fast path des rows de
List · Discipline d'environnement · Préparation SDK 27 · Groups structurels ·
Animations.

**Couverture : 100 % du checkable des guidances Apple SwiftUI.** 378
recommandations discrètes inventoriées ; 369 implémentées en sous-règles de
scan, gardes anti-faux-positifs ou questions de QCM — les 9 restantes sont
des règles de process assistant inapplicables à un audit consenti. La matrice
de traçabilité complète : **[COVERAGE.md](COVERAGE.md)** — toute reco
checkable y a une ligne ; s'il en manque une, c'est un bug, issues
bienvenues.

Ce qui sépare l'outil d'un linter naïf : chaque axe embarque une section
**Do NOT flag** — les ~25 patterns bénis qu'un simple grep sur-flaggerait
(`Group { if/else }`, `.enumerated()` d'affichage, action types du framework,
fichiers XCUITest, defaults d'environnement stables…). Les hits gardés sont
rapportés comme preuves de bonnes habitudes, jamais comme findings.

## Multi-langue par construction

Le contenu (QCM, règles, rapport) est écrit une seule fois, en anglais — la
session Claude le **traduit à la volée** dans la langue de la session. Aucune
copie par langue à maintenir, et ça marche pour n'importe quelle langue.

## Philosophie : jamais culpabilisant

- On ne juge pas, on montre. Chaque finding = **concept + référence doc
  Apple + fix en 5 minutes** (avant/après).
- On n'évalue **jamais** quelqu'un sur son code d'il y a 3 ans — le legacy
  déclaré est exclu du score et retourné en atout (**acquis prouvés** ✓).
- Les divergences marchent dans les deux sens : parfois ton code est
  meilleur que tes réponses. On te le dit aussi.
- Les axes sans matière (pas de tests, pas de clés d'environnement…) sont
  hors moyenne — jamais notés 1/5 pour absence.
- Rien n'est envoyé nulle part : tout tourne en local.

## Contribuer une règle

Les 16 axes vivent dans [`rules/`](rules/) — un fichier par axe : frontmatter
(`axis`, `severity`, `patterns`), puis **Concept · Sub-rules · Do NOT flag
(obligatoire) · Fix 5 min · Reference** (liens developer.apple.com publics
uniquement). Ajouter une règle = une PR avec un fichier + une ligne dans
COVERAGE.md. Voir [CONTRIBUTING.md](CONTRIBUTING.md).

## Essayer sans Claude

```bash
node bin/cli.mjs --help --lang fr    # l'aide (et le 🐙), en français
node bin/cli.mjs --dry-run           # montre ce qui serait lancé, sans lancer claude
node scripts/gate-fixture.mjs        # prouve que chaque axe déclenche sur la fixture
open examples/report-example.html    # à quoi ressemble un rapport
```

---

🐙 Par le développeur de [LibTracker](https://libtracker.io) — le poulpi,
c'est de famille. Réalisé en BuildInPublic sur
[Horka_TV](https://www.twitch.tv/horka_tv) · propulsé par Claude Code ·
Licence [MIT](LICENSE).
