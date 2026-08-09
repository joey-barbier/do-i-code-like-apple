[English](README.md) · **Français** · [Español](README.es.md) · [Deutsch](README.de.md)

# 🐙 do-i-code-like-apple

> **Est-ce que je dev comme Apple ?**
> Auto-évaluation pour devs iOS/SwiftUI de tout niveau — QCM + scan de ton
> vrai projet, rapport HTML jamais culpabilisant. Propulsé par Claude Code.
> Fonctionne dans ta langue (fr, en, es, de… n'importe laquelle en vrai).

```
        ,---.
       ( o o )        « Est-ce que je dev comme Apple ? »
        \ = /
      .-'---'-.       npx dev-comme-apple
     / | | | | \
    (  | | | |  )
     '-'-'-'-'-'
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
2. **Un QCM ~15 questions** avec snippets de code : « laquelle de ces deux
   versions tu écrirais ? ». Frontières d'invalidation, identité ForEach,
   dérivés dans le body, @Observable, bindings, localisation, APIs
   dépréciées, tests, guard-first, modifiers conditionnels.
3. **Un scan de ton vrai projet** (optionnel) : tu donnes le chemin d'un
   projet Xcode/SwiftUI, l'outil confronte **ce que tu PENSES faire** (tes
   réponses) et **ce que ton code MONTRE** (le scan), axe par axe. Tu peux
   contextualiser en langage libre : « Features/Checkout c'est mon niveau
   actuel, Legacy/ date de mes débuts » — le score ne se calcule QUE sur ton
   code d'aujourd'hui, et le legacy sert à mesurer **ta progression**.
4. **Un rapport HTML** auto-contenu s'ouvre : score global, notes en poulpes
   🐙 par axe, le face-à-face déclaré/observé (l'or de l'outil), ta
   progression, et le top 3 des « fixes 5 minutes » avec avant/après et liens
   vers la doc Apple.

## Multi-langue par construction

Le contenu (QCM, règles, rapport) est écrit une seule fois, en anglais — et
la session Claude le **traduit à la volée** dans la langue de la session.
Aucune copie par langue à maintenir, et ça marche pour n'importe quelle
langue, pas seulement les quatre du CLI (`en`, `fr`, `es`, `de` pour les
messages du CLI lui-même).

## Philosophie : jamais culpabilisant

- On ne juge pas, on montre. Chaque finding = **concept + référence doc
  Apple + fix en 5 minutes** (snippet avant/après).
- On n'évalue **jamais** quelqu'un sur son code d'il y a 3 ans. Le legacy
  déclaré est exclu du score — et retourné en atout : les axes où ton code
  récent fait mieux que l'ancien deviennent des **acquis prouvés** ✓.
- Les divergences marchent dans les deux sens : parfois ton code est
  meilleur que tes réponses. On te le dit aussi.
- Rien n'est envoyé nulle part : tout tourne en local dans ta session
  Claude Code.

## Contribuer une règle

Les 10 axes vivent dans [`rules/`](rules/) — un fichier Markdown par axe
(frontmatter structuré : `axis`, `severity`, `patterns`, `reference`,
`link`), quatre sections : concept, ce que dit Apple, détection (cas ambigus
laissés au jugement de Claude), fix 5 min. Ajouter une règle = une PR avec un
fichier. Voir [CONTRIBUTING.md](CONTRIBUTING.md). Le contenu canonique est en
anglais (lingua franca open source) ; la session le traduit pour l'utilisateur.

## Essayer sans Claude

```bash
node bin/cli.mjs --help --lang fr    # l'aide (et le poulpe), en français
node bin/cli.mjs --dry-run           # montre ce qui serait lancé, sans lancer claude
open examples/report-example.html    # à quoi ressemble un rapport
```

---

🐙 Par le développeur de [LibTracker](https://libtracker.io) — le poulpi,
c'est de famille. Réalisé en BuildInPublic sur
[Horka_TV](https://www.twitch.tv/horka_tv) · propulsé par Claude Code ·
Licence [MIT](LICENSE).
