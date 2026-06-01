# TASK ReactScrew

Roadmap d'execution pour faire evoluer `reactscrew` vers une librairie adaptee aux gros projets web.

Les travaux sont regroupes en 3 categories:

1. `MVP`
2. `CONCURRENT`
3. `MATURE`

Chaque categorie est decoupee en sprints. Les validations et rapports de test associes sont dans le dossier `test/`.

## MVP

Objectif: rendre la librairie fiable, coherent, maintenable et techniquement presentable pour une premiere adoption serieuse.

### Sprint MVP-1: Nettoyage du socle

- [ ] Separer clairement le code de librairie et le code de demonstration.
- [ ] Nettoyer les fichiers morts, imports inutiles et incoherences de structure.
- [ ] Corriger `src/services/schema.js` vide ou le retirer.
- [ ] Revoir les dependances runtime et dev.
- [ ] Retirer la dependance `fs` du runtime navigateur si elle n'est pas strictement necessaire.
- [ ] Clarifier les exports publics du package.
- [ ] Revoir `package.json` pour preparer une distribution propre.

Validation: [test/mvp-validation.md](/home/clodlin/reactscrew/test/mvp-validation.md)  
Rapport: [test/mvp-test-report.md](/home/clodlin/reactscrew/test/mvp-test-report.md)

### Sprint MVP-2: TypeScript et contrat public

- [ ] Migrer le coeur de la librairie vers TypeScript.
- [ ] Remplacer [types/reactscrew.d.ts](/home/clodlin/reactscrew/types/reactscrew.d.ts) par de vrais types issus du code source.
- [ ] Taper `DriverProvider`, `useScrew`, les screws, les methodes et les retours.
- [ ] Definir un format d'erreur unifie.
- [ ] Definir le contrat minimal public de la librairie.
- [ ] Ajouter des tests de types.

Validation: [test/mvp-validation.md](/home/clodlin/reactscrew/test/mvp-validation.md)  
Rapport: [test/mvp-test-report.md](/home/clodlin/reactscrew/test/mvp-test-report.md)

### Sprint MVP-3: Qualite et tests minimaux

- [ ] Ajouter une vraie stack de tests.
- [ ] Ajouter des tests unitaires sur `useScrew` et `DriverProvider`.
- [ ] Ajouter des tests sur les cas succes, erreur et persistence.
- [ ] Ajouter lint, typecheck et build en CI.
- [ ] Reecrire le `README` pour qu'il decrive le produit reel.
- [ ] Ajouter un exemple d'integration simple et propre.

Validation: [test/mvp-validation.md](/home/clodlin/reactscrew/test/mvp-validation.md)  
Rapport: [test/mvp-test-report.md](/home/clodlin/reactscrew/test/mvp-test-report.md)

## CONCURRENT

Objectif: atteindre un niveau de fonctionnalites qui permet de concurrencer serieusement une solution moderne sur des cas web standard.

### Sprint CONCURRENT-1: Refonte API query/mutation

- [ ] Introduire `useScrewQuery`.
- [ ] Introduire `useScrewMutation`.
- [ ] Distinguer officiellement `query definitions` et `mutation definitions`.
- [ ] Ajouter `queryKey`, `enabled`, `select`, `initialData`, `placeholderData`.
- [ ] Ajouter `onSuccess`, `onError`, `onSettled`.
- [ ] Maintenir une strategie de migration depuis `useScrew`.

Validation: [test/concurrent-validation.md](/home/clodlin/reactscrew/test/concurrent-validation.md)  
Rapport: [test/concurrent-test-report.md](/home/clodlin/reactscrew/test/concurrent-test-report.md)

### Sprint CONCURRENT-2: Cache et invalidation

- [ ] Construire un vrai cache memoire par `queryKey`.
- [ ] Ajouter `idle`, `loading`, `success`, `error`, `stale`.
- [ ] Distinguer `isLoading`, `isFetching`, `isRefetching`.
- [ ] Ajouter deduplication des requetes simultanees.
- [ ] Ajouter invalidation ciblee et par prefixe.
- [ ] Ajouter refetch manuel et background refetch.
- [ ] Ajouter refetch on focus et on reconnect.
- [ ] Ajouter prefetch.

Validation: [test/concurrent-validation.md](/home/clodlin/reactscrew/test/concurrent-validation.md)  
Rapport: [test/concurrent-test-report.md](/home/clodlin/reactscrew/test/concurrent-test-report.md)

### Sprint CONCURRENT-3: Architecture et performance

- [ ] Remplacer le `Context` global mutable par un store a subscriptions fines.
- [ ] Utiliser `useSyncExternalStore` ou une abstraction equivalente.
- [ ] Ajouter gestion de concurrence et annulation des requetes.
- [ ] Ajouter protection contre les race conditions.
- [ ] Reduire les rerenders inutiles.
- [ ] Ajouter une instrumentation de performance de base.

Validation: [test/concurrent-validation.md](/home/clodlin/reactscrew/test/concurrent-validation.md)  
Rapport: [test/concurrent-test-report.md](/home/clodlin/reactscrew/test/concurrent-test-report.md)

### Sprint CONCURRENT-4: Transport, validation, mutations

- [ ] Decoupler la librairie de `axios`.
- [ ] Fournir un adaptateur `fetch`.
- [ ] Fournir un adaptateur `axios`.
- [ ] Integrer la validation runtime des params, payloads et reponses.
- [ ] Ajouter optimistic updates et rollback.
- [ ] Ajouter invalidation automatique post-mutation.
- [ ] Normaliser les erreurs reseau, HTTP, validation et metier.

Validation: [test/concurrent-validation.md](/home/clodlin/reactscrew/test/concurrent-validation.md)  
Rapport: [test/concurrent-test-report.md](/home/clodlin/reactscrew/test/concurrent-test-report.md)

## MATURE

Objectif: transformer `reactscrew` en plateforme outillee, observable et industrialisable pour des equipes produit exigeantes.

### Sprint MATURE-1: SSR, hydration et frameworks

- [ ] Ajouter hydration/dehydration du cache.
- [ ] Ajouter support SSR et SSG.
- [ ] Ajouter exemples Next.js App Router et Vite.
- [ ] Clarifier la compatibilite avec React 19 et Server Components.
- [ ] Definir les limites officielles cote client/cote serveur.

Validation: [test/mature-validation.md](/home/clodlin/reactscrew/test/mature-validation.md)  
Rapport: [test/mature-test-report.md](/home/clodlin/reactscrew/test/mature-test-report.md)

### Sprint MATURE-2: Observabilite et devtools

- [ ] Refaire completement le logger.
- [ ] Ajouter evenements structures pour les cycles de requete.
- [ ] Ajouter hooks d'observabilite.
- [ ] Exposer des stats cache hit/miss et temps de reponse.
- [ ] Ajouter integrations optionnelles Sentry et OpenTelemetry.
- [ ] Construire des devtools pour queries, mutations, cache, invalidations et erreurs.

Validation: [test/mature-validation.md](/home/clodlin/reactscrew/test/mature-validation.md)  
Rapport: [test/mature-test-report.md](/home/clodlin/reactscrew/test/mature-test-report.md)

### Sprint MATURE-3: Enterprise features

- [ ] Ajouter pagination avancee et infinite queries.
- [ ] Ajouter persistence du cache avec versionnement.
- [ ] Ajouter strategie auth officielle: JWT, refresh token, 401/403.
- [ ] Ajouter support multi-tenant si cible produit reelle.
- [ ] Ajouter conventions d'equipe, templates et starters de projet.
- [ ] Ajouter une documentation avancee orientee adoption equipe.

Validation: [test/mature-validation.md](/home/clodlin/reactscrew/test/mature-validation.md)  
Rapport: [test/mature-test-report.md](/home/clodlin/reactscrew/test/mature-test-report.md)

### Sprint MATURE-4: Generation et distribution

- [ ] Ajouter generation de screws depuis OpenAPI.
- [ ] Ajouter CLI de generation.
- [ ] Generer types, query keys, hooks et validateurs quand possible.
- [ ] Ajouter strategie de merge code genere/code custom.
- [ ] Finaliser build ESM, `exports` map, sourcemaps et tree shaking.
- [ ] Stabiliser la release process et le versionnement semantique.

Validation: [test/mature-validation.md](/home/clodlin/reactscrew/test/mature-validation.md)  
Rapport: [test/mature-test-report.md](/home/clodlin/reactscrew/test/mature-test-report.md)

## Ordre de passage recommande

1. Finir toute la categorie `MVP`.
2. Ne commencer `CONCURRENT` qu'apres un socle types + tests + CI.
3. Ne commencer `MATURE` qu'apres stabilisation de l'API query/mutation et du moteur de cache.

## Definition of Done globale

- [ ] Le comportement public est documente.
- [ ] Les cas d'erreur sont couverts par tests.
- [ ] Le typage public est coherent et verifiable.
- [ ] Les benchmarks et rerenders critiques sont controles.
- [ ] Les exemples fournis compilent et tournent.
- [ ] Le package peut etre publie proprement.
