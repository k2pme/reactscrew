# TODO ReactScrew

Roadmap de maturation de `reactscrew` pour en faire une librairie crédible pour de gros projets web.

## Vision Produit

- [ ] Définir précisément la promesse produit de `reactscrew`.
- [ ] Écrire un positionnement clair par rapport à `TanStack Query`, `SWR` et `RTK Query`.
- [ ] Définir les cas d'usage prioritaires: CRUD, auth, dashboards, backoffices, apps métier, multi-domaines.
- [ ] Décider si `reactscrew` reste REST-first ou devient agnostique transport.
- [ ] Définir les garanties officielles de la librairie: cache, invalidation, SSR, typage, persistence, retries, devtools.

## Refonte API

- [ ] Remplacer l'API trop générique `useScrew` par une API spécialisée.
- [ ] Introduire `useScrewQuery`.
- [ ] Introduire `useScrewMutation`.
- [ ] Introduire `prefetchScrewQuery`.
- [ ] Introduire `invalidateScrewQuery`.
- [ ] Introduire `setScrewQueryData`.
- [ ] Introduire `getScrewQueryData`.
- [ ] Distinguer clairement `query definitions` et `mutation definitions`.
- [ ] Normaliser le format de définition d'un endpoint.
- [ ] Ajouter une notion officielle de `queryKey`.
- [ ] Ajouter `enabled`, `staleTime`, `cacheTime`, `retry`, `retryDelay`, `select`, `placeholderData`, `initialData`.
- [ ] Ajouter les callbacks `onSuccess`, `onError`, `onSettled`.

## TypeScript

- [ ] Migrer tout le code source vers TypeScript.
- [ ] Remplacer le fichier de déclaration générique par de vrais types exportés.
- [ ] Taper `DriverProvider`.
- [ ] Taper la structure des screws.
- [ ] Taper les paramètres de route.
- [ ] Taper les payloads de mutation.
- [ ] Taper les réponses serveur.
- [ ] Taper les erreurs normalisées.
- [ ] Permettre l'inférence de types depuis la définition du screw.
- [ ] Ajouter des tests de types.
- [ ] Exporter les types publics documentés.

## Architecture Interne

- [ ] Supprimer la dépendance centrale à un seul `React Context` mutable.
- [ ] Mettre en place un store interne avec abonnements fins.
- [ ] Basculer vers `useSyncExternalStore` pour éviter les rerenders globaux.
- [ ] Séparer les responsabilités `store`, `cache`, `transport`, `react bindings`.
- [ ] Créer un `QueryClient` interne ou équivalent.
- [ ] Créer un gestionnaire de requêtes en cours.
- [ ] Gérer la concurrence des requêtes.
- [ ] Gérer l'annulation des requêtes obsolètes.
- [ ] Gérer les race conditions.
- [ ] Ajouter une couche d'événements internes.

## Cache

- [ ] Implémenter un vrai cache mémoire structuré par clé.
- [ ] Définir un système stable de sérialisation des `queryKey`.
- [ ] Ajouter les statuts `idle`, `loading`, `success`, `error`, `stale`.
- [ ] Distinguer `isLoading`, `isFetching`, `isRefetching`.
- [ ] Ajouter la déduplication des requêtes simultanées.
- [ ] Ajouter l'expiration du cache.
- [ ] Ajouter le garbage collection du cache.
- [ ] Ajouter l'invalidation ciblée par clé.
- [ ] Ajouter l'invalidation par préfixe.
- [ ] Ajouter le refetch manuel.
- [ ] Ajouter le background refetch.
- [ ] Ajouter le refetch on window focus.
- [ ] Ajouter le refetch on reconnect.
- [ ] Ajouter le polling optionnel.
- [ ] Ajouter le prefetch.
- [ ] Ajouter l'hydration/dehydration du cache.
- [ ] Ajouter la persistence du cache avec versionnement.

## Mutations

- [ ] Créer une vraie couche mutation séparée des queries.
- [ ] Ajouter les optimistic updates.
- [ ] Ajouter le rollback sur erreur.
- [ ] Ajouter l'invalidation automatique post-mutation.
- [ ] Ajouter la mise à jour manuelle du cache après mutation.
- [ ] Ajouter des files d'attente de mutations si nécessaire.
- [ ] Ajouter le support du retry pour mutations.
- [ ] Ajouter une gestion fine des erreurs métier.
- [ ] Ajouter des hooks de cycle de vie des mutations.

## Transport

- [ ] Découpler la librairie de `axios`.
- [ ] Fournir un adaptateur `fetch` officiel.
- [ ] Fournir un adaptateur `axios` officiel.
- [ ] Permettre un transport custom.
- [ ] Ajouter la gestion d'`AbortController`.
- [ ] Ajouter le support des timeouts.
- [ ] Ajouter le support d'intercepteurs.
- [ ] Ajouter l'enrichissement dynamique des headers.
- [ ] Ajouter la gestion auth centralisée.
- [ ] Ajouter des hooks pour refresh token.
- [ ] Ajouter la normalisation des réponses HTTP.
- [ ] Ajouter la normalisation des erreurs réseau.

## Validation

- [ ] Brancher réellement la validation runtime dans le flux d'exécution.
- [ ] Remplacer `Joi` par `zod` ou justifier le maintien de `Joi`.
- [ ] Valider les paramètres d'entrée.
- [ ] Valider les payloads de mutation.
- [ ] Valider les réponses serveur.
- [ ] Fournir des erreurs explicites de validation.
- [ ] Permettre une validation optionnelle ou stricte.
- [ ] Permettre des transformers de réponse.

## Gestion d'Erreurs

- [ ] Définir un format d'erreur unifié.
- [ ] Normaliser les erreurs réseau, HTTP, validation, auth et métier.
- [ ] Ajouter `code`, `status`, `message`, `details`, `cause`, `retryable`.
- [ ] Exposer des helpers de discrimination d'erreur.
- [ ] Documenter les stratégies de gestion d'erreur globales.
- [ ] Ajouter un hook pour la gestion globale d'erreurs.

## React et Frameworks

- [ ] Vérifier la compatibilité propre avec React 19.
- [ ] Ajouter le support SSR.
- [ ] Ajouter le support SSG.
- [ ] Ajouter l'hydration client.
- [ ] Ajouter des exemples Next.js App Router.
- [ ] Ajouter des exemples Vite.
- [ ] Ajouter un exemple Remix si pertinent.
- [ ] Clarifier la compatibilité avec Server Components.
- [ ] Clarifier ce qui doit rester côté client.

## Pagination et Données Avancées

- [ ] Ajouter le support pagination page/limit.
- [ ] Ajouter le support curseurs.
- [ ] Ajouter le support infinite queries.
- [ ] Ajouter le support des dépendances entre queries.
- [ ] Ajouter le support parallel queries.
- [ ] Ajouter le support suspense si c'est un axe officiel.
- [ ] Ajouter le support streaming ou temps réel si c'est un axe produit.
- [ ] Prévoir WebSocket/SSE comme extension, pas dans le coeur initial.

## Observabilité

- [ ] Repenser complètement le logger.
- [ ] Remplacer le fichier `logs.txt` par une stratégie browser-safe et framework-safe.
- [ ] Ajouter des événements structurés.
- [ ] Ajouter `onRequestStart`, `onRequestSuccess`, `onRequestError`.
- [ ] Ajouter une instrumentation de performance.
- [ ] Ajouter une intégration optionnelle Sentry.
- [ ] Ajouter une intégration optionnelle OpenTelemetry.
- [ ] Exposer des stats cache hit/miss.
- [ ] Exposer des métriques de retry et temps moyen de réponse.

## Devtools

- [ ] Construire des devtools dédiés.
- [ ] Afficher les queries actives.
- [ ] Afficher les mutations en cours.
- [ ] Afficher le contenu du cache.
- [ ] Afficher l'état stale/fresh.
- [ ] Afficher l'historique des invalidations.
- [ ] Afficher les erreurs.
- [ ] Afficher les temps de réponse.
- [ ] Ajouter la possibilité de refetch/invalidate depuis les devtools.

## Génération et Contrats

- [ ] Ajouter la génération de screws depuis OpenAPI.
- [ ] Générer les types de requête et réponse.
- [ ] Générer les query keys.
- [ ] Générer les hooks query/mutation.
- [ ] Générer les validators si possible.
- [ ] Ajouter une CLI de génération.
- [ ] Ajouter une stratégie de merge entre code généré et code custom.
- [ ] Ajouter un watch mode pour la régénération en dev.

## Sécurité et Auth

- [ ] Ajouter une stratégie officielle pour JWT.
- [ ] Ajouter une stratégie refresh token.
- [ ] Ajouter la gestion 401/403.
- [ ] Ajouter le support multi-tenant.
- [ ] Ajouter le support CSRF si nécessaire.
- [ ] Permettre l'injection sécurisée de credentials.
- [ ] Documenter les patterns d'auth pour gros projets.

## Structure du Repo

- [ ] Séparer la librairie du code de démonstration.
- [ ] Créer `examples/`.
- [ ] Créer `packages/` si monorepo.
- [ ] Nettoyer les fichiers inutiles ou incohérents.
- [ ] Supprimer le code mort.
- [ ] Supprimer les imports non utilisés.
- [ ] Corriger `schema.js` vide ou le retirer.
- [ ] Revoir les dépendances runtime.
- [ ] Passer les dépendances non runtime en `devDependencies`.
- [ ] Nettoyer le packaging npm.

## Build et Distribution

- [ ] Produire un build ESM propre.
- [ ] Décider si CJS reste supporté.
- [ ] Ajouter une `exports` map dans `package.json`.
- [ ] Ajouter un tree-shaking correct.
- [ ] Vérifier la compatibilité avec les bundlers modernes.
- [ ] Ajouter des sourcemaps.
- [ ] Réduire la taille du bundle.
- [ ] Définir les `peerDependencies` proprement.
- [ ] Mettre en place un versionnement sémantique strict.

## Tests

- [ ] Ajouter des tests unitaires du cache.
- [ ] Ajouter des tests unitaires des query keys.
- [ ] Ajouter des tests unitaires des mutations.
- [ ] Ajouter des tests d'annulation de requêtes.
- [ ] Ajouter des tests de retry.
- [ ] Ajouter des tests de persistence.
- [ ] Ajouter des tests de validation.
- [ ] Ajouter des tests de SSR/hydratation.
- [ ] Ajouter des tests d'intégration React.
- [ ] Ajouter des tests end-to-end sur les exemples.
- [ ] Ajouter des tests de non-régression sur erreurs.
- [ ] Ajouter une couverture minimale obligatoire.

## Qualité et CI

- [ ] Ajouter ESLint.
- [ ] Ajouter Prettier ou Biome.
- [ ] Ajouter `typecheck` en CI.
- [ ] Ajouter les tests en CI.
- [ ] Ajouter le build en CI.
- [ ] Ajouter un contrôle de taille de bundle.
- [ ] Ajouter un workflow release.
- [ ] Ajouter la génération automatique du changelog.
- [ ] Ajouter des règles de contribution.
- [ ] Ajouter des conventions de commit si utile.

## Documentation

- [ ] Réécrire le `README` pour un public pro.
- [ ] Ajouter un guide de démarrage rapide.
- [ ] Ajouter un guide architecture.
- [ ] Ajouter un guide migration.
- [ ] Ajouter un guide auth.
- [ ] Ajouter un guide cache et invalidation.
- [ ] Ajouter un guide pagination.
- [ ] Ajouter un guide SSR.
- [ ] Ajouter un guide testing.
- [ ] Ajouter un guide OpenAPI generation.
- [ ] Ajouter une documentation API complète.
- [ ] Ajouter des exemples complets réalistes.
- [ ] Ajouter une comparaison honnête avec les concurrents.

## Adoption Équipe

- [ ] Définir des conventions de nommage.
- [ ] Définir des conventions de découpage par domaine métier.
- [ ] Définir des conventions d'écriture des keys.
- [ ] Définir des conventions de gestion des erreurs.
- [ ] Définir des conventions de cache invalidation.
- [ ] Ajouter des templates d'implémentation pour les équipes.
- [ ] Ajouter des starters de projet.

## Priorité de Livraison

### Phase 1

- [ ] TypeScript.
- [ ] Séparation query/mutation.
- [ ] Transport abstrait.
- [ ] Erreurs normalisées.
- [ ] Nettoyage du repo.

### Phase 2

- [ ] Vrai cache.
- [ ] Invalidation.
- [ ] Retries.
- [ ] Annulation.
- [ ] Subscriptions fines.
- [ ] Tests solides.

### Phase 3

- [ ] SSR/hydratation.
- [ ] Persistence avancée.
- [ ] Devtools.
- [ ] Observabilité.

### Phase 4

- [ ] Génération OpenAPI.
- [ ] Documentation avancée.
- [ ] Exemples enterprise.
- [ ] Release stable.
