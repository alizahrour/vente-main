# Tests E2E Cypress

Ces tests valident le parcours critique du MVP vente directe telecom avec des donnees reproductibles et des API mockees par Cypress.

## Installation

Si Cypress n'est pas encore installe :

```powershell
cd frontend
npm install
```

La dependance `cypress` est declaree dans `devDependencies`.

## Lancer l'application

Dans un premier terminal :

```powershell
cd frontend
npm run start -- --host 127.0.0.1 --port 4200
```

## Executer les tests

Mode headless :

```powershell
cd frontend
npm run e2e
```

Mode interactif :

```powershell
cd frontend
npm run e2e:open
```

## Scenario couvert

Le fichier `cypress/e2e/mvp-critical-flow.cy.ts` couvre :

- login agent
- creation d'un client
- recherche du client cree
- consultation du catalogue
- creation d'une vente
- ajout d'une offre au panier
- verification du total
- validation de la vente
- paiement simule
- generation du recu
- verification dans l'historique
- verification du dashboard

Les appels backend sont interceptes par Cypress. Le test ne touche donc pas les donnees reelles et ne couvre pas SIM, MSISDN ou activation reseau.
