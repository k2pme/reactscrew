# MVP ReactScrew

Document d'execution de la phase `MVP` pour `reactscrew`.

But: decrire exactement ce qu'un assistant IA doit faire, dans quel ordre, pourquoi, avec quels livrables, et comment valider la fin de phase.

Ce document est volontairement operationnel. Il ne decrit pas une vision long terme complete. Il decrit uniquement le socle minimal necessaire pour rendre la librairie propre, coherente et exploitable.

## Contexte

Aujourd'hui, `reactscrew` est une petite librairie React qui expose:

- `DriverProvider`
- `useScrew`

Le coeur actuel est surtout dans:

- [src/components/DriverProvider.js](/home/clodlin/reactscrew/src/components/DriverProvider.js)
- [src/hooks/useScrew.js](/home/clodlin/reactscrew/src/hooks/useScrew.js)
- [src/index.js](/home/clodlin/reactscrew/src/index.js)

Le depot contient aussi du code de demonstration melange au code de librairie:

- [App.js](/home/clodlin/reactscrew/App.js)
- [src/services/api.js](/home/clodlin/reactscrew/src/services/api.js)
- [src/services/screws/client.js](/home/clodlin/reactscrew/src/services/screws/client.js)
- [src/services/screws/post.js](/home/clodlin/reactscrew/src/services/screws/post.js)

Le point de pilotage de la roadmap est:

- [TASK.md](/home/clodlin/reactscrew/TASK.md)
- [TODO.md](/home/clodlin/reactscrew/TODO.md)

## Objectif du MVP

L'objectif n'est pas encore de concurrencer directement `TanStack Query` ou `RTK Query`.

L'objectif du MVP est de produire une base saine qui:

- peut etre comprise vite par un autre dev ou un autre assistant
- peut etre installee sans ambiguite
- expose une API publique claire
- dispose d'un typage credible
- dispose de tests minimaux
- peut etre build et publiee proprement

## Non-objectifs du MVP

Ce qu'il ne faut pas faire dans cette phase:

- ne pas refaire tout le moteur de cache
- ne pas introduire tout de suite `useScrewQuery` et `useScrewMutation`
- ne pas construire de devtools
- ne pas ajouter SSR, hydration ou OpenAPI generation
- ne pas tenter une rearchitecture lourde du store si cela casse le calendrier MVP

Ces sujets sont pour `CONCURRENT` et `MATURE` dans [TASK.md](/home/clodlin/reactscrew/TASK.md).

## Strategie generale

La phase `MVP` est composee de 3 chantiers:

1. nettoyer le socle
2. fiabiliser le contrat public et le typage
3. mettre en place les verifications minimales de qualite

Le principe directeur est simple:

- supprimer l'ambiguite avant d'ajouter de la sophistication
- rendre le package publiable avant de le rendre ambitieux
- documenter le reel avant de promettre le futur

## Sprint MVP-1: Nettoyage du socle

### Ce qu'il faut faire

- separer le code de librairie du code de demonstration
- identifier les fichiers qui appartiennent au package public
- identifier les fichiers qui servent uniquement d'exemple local
- corriger ou retirer les fichiers incomplets
- nettoyer les dependances
- rendre `package.json` coherent avec la realite du package

### Pourquoi

Le depot est actuellement ambigu:

- [src/index.js](/home/clodlin/reactscrew/src/index.js) expose la librairie
- [App.js](/home/clodlin/reactscrew/App.js) ressemble a une app de demo
- [src/services/schema.js](/home/clodlin/reactscrew/src/services/schema.js) est vide
- [src/utils/validator.js](/home/clodlin/reactscrew/src/utils/validator.js) n'est pas branche clairement
- la dependance `fs` est declaree dans [package.json](/home/clodlin/reactscrew/package.json), ce qui est mauvais signal pour une librairie web

Un package destine a des gros projets doit d'abord etre lisible et previsible. Si le perimetre n'est pas propre, aucun travail plus avance ne reposera sur un socle fiable.

### Comment le faire

- garder comme coeur de librairie:
  - [src/components/DriverProvider.js](/home/clodlin/reactscrew/src/components/DriverProvider.js)
  - [src/hooks/useScrew.js](/home/clodlin/reactscrew/src/hooks/useScrew.js)
  - [src/index.js](/home/clodlin/reactscrew/src/index.js)
  - les utilitaires effectivement utilises
- deplacer ou isoler les fichiers de demonstration dans un dossier `examples/` ou equivalent
- retirer du package les fichiers de demo qui n'ont pas vocation a etre publies
- supprimer les modules morts ou partiellement branches
- reclasser les dependances entre `dependencies`, `devDependencies` et `peerDependencies`
- verifier la liste `files` et les entrees `main`, `types`, puis preparer a terme `exports`

### Livrables attendus

- une structure de repo lisible
- un package dont le contenu publie est volontaire
- un `README` qui ne raconte pas autre chose que le code reel

### Critere d'acceptation

- un nouveau contributeur comprend en moins de 5 minutes ce qui est librairie et ce qui est demo
- le build ne depend pas de fichiers incomplets
- aucune dependance manifestement incoherente n'est gardee sans justification

## Sprint MVP-2: Contrat public et TypeScript

### Ce qu'il faut faire

- migrer le coeur critique vers TypeScript, ou au minimum fournir des types derives du vrai code
- remplacer le fichier de declaration trop vague par de vrais types publics
- formaliser le contrat de `DriverProvider` et `useScrew`
- formaliser les structures minimales:
  - screw
  - method
  - resultat d'etat
  - erreur

### Pourquoi

Le fichier actuel [types/reactscrew.d.ts](/home/clodlin/reactscrew/types/reactscrew.d.ts) est trop permissif:

- `apiInstance: any`
- `screws: any`
- `useScrew(...): any`

Pour un usage sur gros projet, ce niveau de flou rend l'outil fragile:

- pas d'autocompletion fiable
- pas de verification des contrats
- pas de surface publique stable
- pas de confiance dans l'integration

Le typage n'est pas une finition ici. C'est une partie du produit.

### Comment le faire

- definir les interfaces de base:
  - `ScrewDefinition`
  - `ScrewMethodDefinition`
  - `DriverProviderProps`
  - `ScrewState<TData, TError>`
- typer `useScrew` sur un nom de screw connu si l'architecture actuelle le permet
- typer les methodes `executeMethod` et `refetch`
- introduire un type d'erreur normalise minimal
- faire en sorte que les types publics viennent du `src/` et non d'un fichier `.d.ts` de secours ecrit a la main

### Livrables attendus

- un coeur de librairie type
- un export de types publics
- une surface publique beaucoup moins basee sur `any`

### Critere d'acceptation

- un consommateur TypeScript obtient de l'aide utile a l'integration
- les principaux contrats de la librairie sont lisibles dans le code
- les types publies suivent le vrai comportement du package

## Sprint MVP-3: Tests, build et qualite minimale

### Ce qu'il faut faire

- installer une vraie stack de tests
- ajouter un minimum de tests unitaires et d'integration
- ajouter `typecheck`
- ajouter des scripts de verification
- ajouter une CI basique

### Pourquoi

La commande `test` actuelle dans [package.json](/home/clodlin/reactscrew/package.json) ne teste rien.

Sans filet minimum:

- chaque refactor casse potentiellement l'API
- le passage a `CONCURRENT` sera dangereux
- un autre assistant IA ne pourra pas verifier ses modifications proprement

Le MVP doit donc rendre la verification routiniere.

### Comment le faire

- utiliser `Vitest` pour garder un outillage moderne et leger
- tester au minimum:
  - rendu de `DriverProvider`
  - comportement de `useScrew`
  - transition `loading -> success`
  - transition `loading -> error`
  - fallback de persistence si conserve dans cette phase
- ajouter un script `test`
- ajouter un script `typecheck`
- ajouter un script `build`
- ajouter une CI simple qui execute ces scripts

### Livrables attendus

- une commande de tests reelle
- une commande de typecheck reelle
- une verification de build
- des premiers tests automatises

### Critere d'acceptation

- un changement regressif simple sur `useScrew` est detecte par les tests
- un probleme de typage public est detecte par `typecheck`
- le package peut etre valide par pipeline sans intervention manuelle

## Ordre exact d'execution

L'assistant qui prend en charge cette phase doit suivre cet ordre:

1. lire:
   - [TASK.md](/home/clodlin/reactscrew/TASK.md)
   - [TODO.md](/home/clodlin/reactscrew/TODO.md)
   - [README.md](/home/clodlin/reactscrew/README.md)
   - [package.json](/home/clodlin/reactscrew/package.json)
2. cartographier les fichiers reellement publics
3. cartographier les fichiers de demo
4. nettoyer le repo et le packaging
5. mettre en place le typage public
6. seulement ensuite ajouter la stack de tests
7. mettre a jour la documentation en fin de travail, pas au debut

## Definition of Done du MVP

La phase `MVP` est terminee uniquement si:

- le repo est structurellement propre
- le package publie a un perimetre clair
- la surface publique principale n'est plus basee sur `any`
- les scripts `build`, `test` et `typecheck` existent et fonctionnent
- le `README` decrit le vrai etat du package
- les documents de validation sont remplissables dans:
  - [test/mvp-validation.md](/home/clodlin/reactscrew/test/mvp-validation.md)
  - [test/mvp-test-report.md](/home/clodlin/reactscrew/test/mvp-test-report.md)

## Ressources locales

Utiliser d'abord ces ressources du repo:

- [TASK.md](/home/clodlin/reactscrew/TASK.md)
- [TODO.md](/home/clodlin/reactscrew/TODO.md)
- [README.md](/home/clodlin/reactscrew/README.md)
- [package.json](/home/clodlin/reactscrew/package.json)
- [src/index.js](/home/clodlin/reactscrew/src/index.js)
- [src/components/DriverProvider.js](/home/clodlin/reactscrew/src/components/DriverProvider.js)
- [src/hooks/useScrew.js](/home/clodlin/reactscrew/src/hooks/useScrew.js)
- [types/reactscrew.d.ts](/home/clodlin/reactscrew/types/reactscrew.d.ts)
- [test/mvp-validation.md](/home/clodlin/reactscrew/test/mvp-validation.md)
- [test/mvp-test-report.md](/home/clodlin/reactscrew/test/mvp-test-report.md)

## Ressources en ligne

Ces references servent de garde-fou technique pour faire les bons choix.

- TypeScript, publication des declarations:
  - https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html
- TypeScript, declaration de modules:
  - https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-d-ts.html
- TypeScript, type declarations:
  - https://www.typescriptlang.org/docs/handbook/2/type-declarations
- npm `package.json`, notamment `files`, `main`, `types`, `exports`:
  - https://docs.npmjs.com/files/package.json/
- npm packages and modules:
  - https://docs.npmjs.com/about-packages-and-modules
- Vitest, getting started:
  - https://vitest.dev/guide/
- Vitest, writing tests:
  - https://main.vitest.dev/guide/learn/writing-tests

## Reference d'architecture a garder en tete

Cette reference n'est pas un chantier MVP immediat, mais elle explique la direction future si la librairie evolue vers un store externe plus scalable:

- React `useSyncExternalStore`:
  - https://react.dev/reference/react/useSyncExternalStore

Ne pas declencher cette refonte dans le MVP sauf si un blocage structurel l'impose. La reference est la pour eviter de repartir plus tard sur un design non scalable.

## Mode d'ecriture attendu pour un autre assistant IA

Un autre assistant qui execute ce document doit:

- faire des modifications petites et verifiables
- ne pas lancer de refonte large non demandee
- expliquer ses changements par rapport aux objectifs du MVP
- remplir les fichiers de validation et de rapport a la fin des tests
- garder la phase `MVP` compatible avec la roadmap `CONCURRENT`

## Resume court

Le MVP consiste a:

- nettoyer le package
- clarifier ce qui est public
- typer la surface critique
- ajouter les tests minimaux
- rendre le projet transmissible et verifiable

Tant que cela n'est pas fait, toute ambition `CONCURRENT` ou `MATURE` sera prematuree.
