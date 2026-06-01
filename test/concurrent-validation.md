# CONCURRENT Validation

Checklist de validation pour la phase `CONCURRENT`.

## API

- [x] `useScrewQuery` est stable.
- [x] `useScrewMutation` est stable.
- [x] La migration depuis `useScrew` est definie.
- [x] Les `queryKey` sont deterministes.

## Cache

- [x] Le cache gere `stale` et `fresh`.
- [x] La deduplication fonctionne.
- [x] L'invalidation ciblee fonctionne.
- [x] Le refetch au focus fonctionne.
- [x] Le refetch a la reconnexion fonctionne.

## Architecture

- [x] Les rerenders ont ete mesures.
- [x] Les subscriptions fines fonctionnent.
- [x] Les requetes obsoletes peuvent etre annulees.
- [x] Les race conditions critiques sont couvertes.

## Validation et erreurs

- [x] Les params peuvent etre valides.
- [x] Les reponses peuvent etre validees.
- [x] Les erreurs reseau et HTTP sont normalisees.
- [x] Les mutations gerent optimistic update et rollback.

## Decision

- [x] Phase validee
- [ ] Phase rejetee

## Notes

- Verification executee par `npm run typecheck`, `npx vitest run test/concurrent-hooks.test.tsx test/transport.test.ts` et `npm run build`.
- La mesure de rerenders reste fonctionnelle et qualitative via l'usage de `useSyncExternalStore` et la deduplication testee, pas un benchmark quantifie.
- Les tests couvrent query hooks, mutation hooks, invalidation, refetch focus/reconnect, annulation/obsolescence, validation runtime, optimistic update et compatibilite `useScrew`.
