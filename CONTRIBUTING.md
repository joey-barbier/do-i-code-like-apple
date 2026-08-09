# Contribuer

Merci ! La contribution la plus utile : **une règle d'évaluation**.

## Ajouter ou améliorer une règle

1. Un fichier = un axe, dans `rules/`, nommé `NN-slug.md`.
2. Frontmatter obligatoire : `axe`, `id`, `titre`, `severite`
   (haute/moyenne/basse), `patterns` (regex grep), `reference`, `lien`
   (doc Apple officielle uniquement). `scope` optionnel (ex. « fichiers de
   tests uniquement »).
3. Corps en quatre sections : **Le concept** · **Ce que dit Apple** ·
   **Détection** (avec les cas ambigus laissés au jugement de la session) ·
   **Fix en 5 min** (avant/après).
4. Le ton : jamais culpabilisant. On explique le mécanisme, on ne juge pas
   la personne. Chaque finding doit repartir avec un fix immédiat.
5. Si le pattern est détectable, ajoute un exemple déclencheur dans
   `examples/DemoAntiPatterns.swift` (annoté avec le numéro d'axe).

## Vérifier avant la PR

```bash
node bin/cli.mjs --help       # le CLI répond
node bin/cli.mjs --dry-run    # la session se prépare (ta règle est copiée)
```

Et idéalement : lance `npx dev-comme-apple` sur `examples/` et vérifie que ta
règle déclenche bien.

## Commits

Format : `add/update/fix(scope) - description` — ex.
`add(rules) - axe 11 : tâches détachées dans les vues`. Pas d'emoji dans les
messages de commit.

## QCM

Les questions vivent dans `skill/qcm.md`. Une nouvelle règle peut proposer
1-2 questions associées (snippets A/B, réponse mélangée entre A et B,
explication gardée pour le rapport).
