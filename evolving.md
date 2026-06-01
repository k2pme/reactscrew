# Evolving ReactScrew

Document de vision pour faire evoluer `reactscrew` vers une plateforme `contract-first` capable de cacher la complexite API, standardiser les erreurs, piloter l'UX et orchestrer des executions complexes.

## Objectif Global

Faire de `reactscrew` un package qui permet a un dev front de:

- ne pas manipuler directement les routes backend
- consommer une API a partir d'un contrat `OpenAPI`
- obtenir des hooks, des validations, des erreurs et des comportements UX generes
- masquer ou proxyfier les routes backend reelles
- orchestrer des lots, des workflows et suivre leur progression

---

## Niveau 1

### Contrat API comme source de verite

Objectif:
- faire du backend `OpenAPI` la base unique de generation front

### Taches

- [x] Lire un fichier `OpenAPI` local ou distant.
- [x] Parser `paths`, `methods`, `parameters`, `requestBody`, `responses`.
- [x] Parser les schemas principaux de type `components.schemas`.
- [x] Identifier les descriptions textuelles des endpoints.
- [x] Identifier les codes d'erreur declares dans les `responses`.
- [x] Definir un format interne de representation du contrat.

### Livrables

- un parseur `OpenAPI`
- un modele interne de contrat
- une premiere CLI de lecture/validation de contrat

### Resultat attendu

Le package comprend le contrat backend sans que le dev front ecrive manuellement les routes.

---

## Niveau 2

### Generation automatique des screws et hooks

Objectif:
- generer la couche d'acces front a partir du contrat

### Taches

- [x] Generer automatiquement les `screws`.
- [x] Generer les `queryKey`.
- [x] Generer les hooks par endpoint:
  - `useListUsersQuery`
  - `useCreateUserMutation`
  - etc.
- [x] Generer les types TypeScript de params, body, response, errors.
- [x] Generer une structure `generated/` stable.
- [x] Ajouter une strategie de regeneration sans ecraser le code custom.
- [x] Ajouter une convention de separation:
  - `generated/`
  - `custom/`
  - `wrappers/`

### Livrables

- `generated/screws`
- `generated/hooks`
- `generated/types`
- `generated/errors`

### Resultat attendu

Le dev front n'appelle plus directement les routes. Il appelle des hooks/screws generes.

---

## Niveau 3

### Validation runtime et erreurs documentees

Objectif:
- transformer le contrat en garanties d'execution

### Taches

- [x] Generer ou deriver des validateurs pour les entrees.
- [x] Generer ou deriver des validateurs pour les sorties.
- [x] Valider automatiquement:
  - params
  - body
  - response
- [x] Normaliser les erreurs backend.
- [x] Exposer:
  - `code`
  - `status`
  - `message`
  - `description`
  - `details`
  - `retryable`
  - `uiHint`
- [x] Mapper les erreurs techniques vers des erreurs metier front.
- [x] Documenter le format unique des erreurs `reactscrew`.

### Livrables

- moteur de validation
- moteur de normalisation d'erreurs
- catalogue d'erreurs documentees

### Resultat attendu

Le dev front recoit des erreurs propres, documentees et typables sans parser manuellement les reponses backend.

---

## Niveau 4

### Proxy front, routes masquees, loaders et UX personnalisable

Objectif:
- ne plus exposer directement les routes backend au front applicatif
- controler l'UX autour des executions

### Taches Proxy

- [ ] Ajouter une couche proxy optionnelle devant l'API backend.
- [ ] Permettre au front d'appeler des routes frontend differenciees:
  - `/front-api/users/list`
  - `/front-api/users/create`
  - etc.
- [ ] Mapper ces routes frontend vers les routes backend reelles.
- [ ] Supporter une configuration de rewrite/mapping.
- [ ] Permettre de masquer:
  - host backend
  - structure reelle des chemins
  - conventions internes du backend
- [ ] Supporter une execution via proxy local dev et proxy deploye.
- [ ] Prevoir la compatibilite avec:
  - Next.js route handlers
  - proxy Node/BFF
  - reverse proxy applicatif

### Taches UX / Toast / Feedback

- [ ] Ajouter un systeme de toast personnalisable.
- [ ] Ajouter un adaptateur de toast par defaut.
- [ ] Permettre un renderer custom.
- [ ] Permettre des mappings par code d'erreur:
  - `USER_ALREADY_EXISTS`
  - `TOKEN_EXPIRED`
  - `FORBIDDEN`
- [ ] Permettre de configurer:
  - position
  - duree
  - variante
  - icone
  - action
  - ton UX

### Taches Loader

- [ ] Ajouter des loaders personnalisables par requete.
- [ ] Permettre des loaders globaux.
- [ ] Permettre des loaders par screw.
- [ ] Permettre des loaders par endpoint.
- [ ] Permettre des variantes UX:
  - spinner
  - skeleton
  - barre de progression
  - shimmer
  - overlay
- [ ] Permettre un systeme de policy:
  - ne pas afficher le loader sous un seuil de 150ms
  - afficher un skeleton pour certains endpoints
  - afficher un overlay pour des actions critiques

### Taches UI Feedback avance

- [ ] Ajouter une couche `ui feedback engine`.
- [ ] Relier erreurs, toasts, loaders et success states.
- [ ] Ajouter des hooks utilitaires pour:
  - `useScrewToast`
  - `useScrewLoader`
  - `useScrewFeedback`

### Livrables

- moteur proxy configurable
- systeme toast configurable
- systeme loader configurable
- systeme feedback branchable

### Resultat attendu

Le dev front n'utilise plus les routes backend visibles, et l'experience utilisateur autour des appels API devient totalement pilotable.

---

## Niveau 5

### Lots, orchestration, progression et suivi d'execution

Objectif:
- faire de `reactscrew` un moteur d'execution de scenarios API complexes

### Taches Lots

- [ ] Ajouter la prise en charge des operations par lot.
- [ ] Permettre l'execution d'une liste d'actions homogènes.
- [ ] Permettre l'execution d'une liste d'actions heterogenes.
- [ ] Ajouter une structure de resultat de lot:
  - succes
  - echec
  - partiel
  - stats

### Taches Orchestration

- [ ] Ajouter un moteur d'orchestration d'executions.
- [ ] Permettre des chaines d'execution dependantes.
- [ ] Permettre des executions paralleles.
- [ ] Permettre des strategies conditionnelles.
- [ ] Permettre des retries par etape.
- [ ] Permettre des compensations/rollback logiques.

### Taches Progression

- [ ] Exposer la progression d'une execution.
- [ ] Exposer la progression d'un lot.
- [ ] Exposer la progression d'un workflow.
- [ ] Supporter:
  - pourcentage
  - etape courante
  - temps estime
  - nombre d'items traites
  - nombre d'echecs

### Taches Monitoring d'execution

- [ ] Ajouter un journal d'execution detaille.
- [ ] Permettre la souscription aux evenements de progression.
- [ ] Permettre un affichage temps reel de l'avancement.
- [ ] Ajouter des hooks:
  - `useScrewBatch`
  - `useScrewWorkflow`
  - `useScrewProgress`

### Taches UX d'orchestration

- [ ] Ajouter des loaders et toasts specialises pour les lots.
- [ ] Ajouter des vues de progression configurables.
- [ ] Ajouter des messages de resume:
  - X succes
  - Y echecs
  - reprise possible

### Taches Erreurs d'orchestration

- [ ] Distinguer:
  - erreur d'etape
  - erreur bloquante
  - erreur recuperable
  - erreur partielle de lot
- [ ] Exposer un format d'erreur adapte aux workflows.
- [ ] Ajouter des strategies de reprise.

### Livrables

- moteur batch
- moteur workflow
- moteur de progression
- hooks et etats associes

### Resultat attendu

Le package ne se limite plus a appeler des endpoints. Il sait piloter de vraies sequences metier avec suivi de progression et experience utilisateur associee.

---

## Synthesis

### Vision finale

Le backend publie un contrat `OpenAPI`.

`reactscrew`:

- lit ce contrat
- genere les `screws`
- genere les hooks
- valide entrees et sorties
- normalise les erreurs
- masque les routes via proxy
- pilote loaders et toasts
- orchestre des lots et workflows
- expose la progression et les evenements d'execution

### Promesse developpeur finale

Le dev front:

- ne voit presque jamais les routes brutes
- consomme des hooks metier
- recupere des erreurs documentees
- pilote l'UX de maniere declarative
- orchestre des scenarios complexes sans recoder toute l'infrastructure

---

## Priorisation recommandee

1. Niveau 1
2. Niveau 2
3. Niveau 3
4. Niveau 4
5. Niveau 5

Ne pas attaquer les niveaux 4 et 5 avant stabilisation complete du mode `contract-first` des niveaux 1 a 3.


4. CONCURRENT : refonte de l'API query/mutation, cache structuré, subscriptions fines, découplage transport
5. Niveau 4 : proxy, toasts, loaders, UX feedback
6. Niveau 5 : lots, orchestration, progression
7. MATURE : SSR, devtools, enterprise features