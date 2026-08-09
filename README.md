# 🐙 dev-comme-apple

> **Est-ce que je dev comme Apple ?**
> Auto-évaluation SwiftUI pour devs iOS de tout niveau — QCM + scan de ton
> vrai projet, rapport HTML jamais culpabilisant. Propulsé par Claude Code.

```
        ,---.
       ( o o )        « Est-ce que je dev comme Apple ? »
        \ = /
      .-'---'-.       npx dev-comme-apple
     / | | | | \
    (  | | | |  )
     '-'-'-'-'-'
```

![Démo](docs/demo.gif) <!-- GIF à venir -->

## Lancer

```bash
npx dev-comme-apple
```

Prérequis : [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
installé (`claude` dans le PATH). C'est tout — zéro dépendance npm.

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

Les 10 axes d'évaluation vivent dans [`rules/`](rules/) — un fichier
Markdown par axe, avec un frontmatter structuré :

```yaml
---
axe: 2
id: identite-foreach
titre: "Identité ForEach — ids stables"
severite: haute            # haute | moyenne | basse
patterns:                  # regex grep détectables dans le code
  - "id:\\s*\\\\\\.self"
reference: "Résumé de ce que dit la doc Apple"
lien: "https://developer.apple.com/documentation/swiftui/foreach"
---
```

suivi de quatre sections : **Le concept**, **Ce que dit Apple**, **Détection**
(patterns + cas ambigus laissés au jugement de Claude), **Fix en 5 min**
(avant/après). La session lit tous les fichiers de `rules/` : ajouter une
règle = ouvrir une PR avec un fichier. Voir [CONTRIBUTING.md](CONTRIBUTING.md).

## Structure

```
bin/cli.mjs        # CLI zéro dépendance : vérifie claude, prépare, lance
skill/SKILL.md     # le protocole que suit la session Claude
skill/qcm.md       # les 15 questions du QCM
rules/*.md         # les 10 axes — contribuables par PR
template/          # rapport néo-brutaliste (CSS + squelette)
examples/          # fixture d'anti-patterns + rapport d'exemple
```

## Essayer sans Claude

```bash
node bin/cli.mjs --help      # l'aide (et le poulpe)
node bin/cli.mjs --dry-run   # montre ce qui serait lancé, sans lancer claude
open examples/rapport-exemple.html   # à quoi ressemble un rapport
```

---

🐙 Par le développeur de [LibTracker](https://libtracker.io) — le poulpi,
c'est de famille. Réalisé en BuildInPublic sur
[Horka_TV](https://www.twitch.tv/horka_tv) · propulsé par Claude Code ·
Licence [MIT](LICENSE).
