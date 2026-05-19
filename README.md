# Telecom Direct Sales MVP

Prototype academique full-stack pour digitaliser un parcours de vente directe telecom. Le projet combine une API Spring Boot securisee et une application Angular orientee agent commercial, avec gestion clients, catalogue d'offres, panier/devis, paiement simule, facture simple et dashboard commercial.

> Important : ce MVP est volontairement limite a la vente directe commerciale. Il ne gere pas la reservation SIM, l'attribution MSISDN, l'activation reseau, le provisioning, la portabilite, la facturation operateur reelle ou les integrations avec des systemes telecom externes.

## 1. Presentation Du Projet

`Telecom Direct Sales MVP` est une application web de demonstration qui centralise les actions minimales d'un agent de vente directe :

- identifier ou creer un client ;
- consulter un catalogue d'offres telecom ;
- creer une vente en brouillon ;
- ajouter des offres au panier ;
- valider la vente ;
- simuler le paiement ;
- generer un recu ou une facture HTML imprimable ;
- suivre les ventes et les indicateurs commerciaux.

Le projet est concu pour un contexte academique : lisible, modulaire, testable et suffisamment proche d'un cas d'entreprise sans pretendre couvrir les contraintes industrielles d'un operateur telecom.

## 2. Contexte SIC Modernization

Dans un programme de modernisation du SIC, l'objectif est de remplacer ou completer des processus commerciaux fragmentes par une application web moderne, securisee et exploitable. Ce MVP illustre une premiere brique de modernisation :

- centralisation des donnees clients, offres et ventes ;
- reduction des manipulations manuelles ;
- tracabilite du parcours commercial ;
- premiers indicateurs de pilotage ;
- separation claire frontend / backend via API REST.

Le projet ne remplace pas un SI operateur complet. Il represente une couche applicative de demonstration pour le processus de vente directe.

## 3. EPIC Vente Directe

L'EPIC retenue est la digitalisation du parcours "Vente Directe Telecom".

Objectif fonctionnel :

- permettre a un agent commercial de creer une vente rapidement ;
- construire un panier/devis depuis des offres existantes ;
- valider une vente uniquement si elle contient au moins une offre ;
- enregistrer un paiement simule ;
- produire un recu simple ;
- consulter l'historique et le dashboard.

Roles principaux :

- `ADMIN` : administre les offres et accede au pilotage global ;
- `AGENT` : gere ses clients, ventes, paiements et factures ;
- `SUPERVISOR` : consulte l'historique et le dashboard.

## 4. MVP Retenu

Le MVP implemente le minimum utile pour demontrer un parcours commercial complet :

1. authentification JWT ;
2. gestion des clients ;
3. gestion du catalogue d'offres ;
4. creation d'une vente `DRAFT` ;
5. ajout/retrait d'offres ;
6. calcul automatique du total ;
7. validation de vente ;
8. paiement simule ;
9. generation de facture/recu ;
10. historique des ventes ;
11. dashboard commercial.

## 5. Fonctionnalites Incluses

- Authentification `agent` / `admin` avec JWT.
- Gestion clients : creation, recherche, modification, suppression.
- Catalogue offres : creation, statut actif/inactif, consultation.
- Vente directe :
  - creation de vente pour un client existant ;
  - panier de vente ;
  - quantites ;
  - total automatique ;
  - statuts `DRAFT`, `VALIDATED`, `PAID`, `CANCELLED`.
- Paiement simule :
  - montant exact obligatoire ;
  - methodes `CASH`, `CARD`, `TRANSFER`, `CHECK` ;
  - reference paiement.
- Facture / recu HTML :
  - numero facture ;
  - numero vente ;
  - client ;
  - agent ;
  - lignes d'offres ;
  - montant total ;
  - mode et reference paiement ;
  - impression navigateur.
- Dashboard commercial :
  - nombre total de ventes ;
  - chiffre d'affaires ;
  - ventes payees ;
  - ventes annulees ;
  - top offres ;
  - ventes par agent ;
  - CA par mois ;
  - dernieres ventes.
- Tests backend JUnit/Mockito.
- Tests frontend Jasmine/Karma.
- Tests E2E Cypress avec API mockee.

## 6. Fonctionnalites Exclues

Ces fonctionnalites sont explicitement hors perimetre du MVP :

- reservation SIM ;
- attribution MSISDN ;
- activation reseau ;
- provisioning telecom ;
- verification d'eligibilite reseau ;
- gestion de stock SIM ou routeur ;
- portabilite ;
- signature electronique ;
- paiement bancaire reel ;
- generation PDF avancee ;
- integration CRM/ERP/BSS/OSS operateur ;
- integration avec plateformes de facturation reelles ;
- gestion des commissions commerciales ;
- workflows de validation multi-niveaux.

Le paiement est simule et la facture est une page HTML imprimable.

## 7. Stack Technique Spring Boot + Angular

Backend :

- Java 21 ;
- Spring Boot 3.5 ;
- Spring Web ;
- Spring Security ;
- JWT ;
- Spring Data JPA ;
- Hibernate ;
- PostgreSQL ;
- H2 pour certains tests ;
- springdoc-openapi / Swagger UI ;
- JUnit 5 ;
- Mockito ;
- AssertJ.

Frontend :

- Angular 21 ;
- TypeScript ;
- RxJS ;
- Angular Router ;
- Reactive Forms ;
- SCSS ;
- Chart.js ;
- Jasmine/Karma ;
- Cypress pour E2E.

## 8. Architecture Backend

Structure principale :

```text
backend/src/main/java/com/telecom/crm
  config/          Configuration OpenAPI
  controller/      Controllers REST
  dto/             Objets de requete/reponse
  entity/          Entites JPA
  exception/       Exceptions metier et handler global
  mapper/          Mapping Entity -> DTO
  repository/      Repositories Spring Data JPA
  security/        JWT, filtre, UserDetails, config securite
  service/         Logique metier
```

Services principaux :

- `AuthService` : login, register, profil ;
- `CustomerService` : gestion clients ;
- `OfferService` : catalogue offres ;
- `SaleService` : cycle de vie vente ;
- `PaymentService` : consultation paiements ;
- `InvoiceService` : generation et consultation facture ;
- `DashboardService` : indicateurs commerciaux ;
- `DataSeeder` : donnees initiales.

Regles metier importantes :

- une vente doit etre liee a un client existant ;
- une vente `DRAFT` peut etre modifiee ;
- une vente `VALIDATED` ne peut plus etre modifiee ;
- une vente sans item ne peut pas etre validee ;
- le paiement n'est autorise que pour une vente validee ;
- le montant paye doit correspondre exactement au total ;
- la facture ne peut etre generee que pour une vente payee ;
- les ventes annulees sont exclues du chiffre d'affaires.

## 9. Architecture Frontend

Structure principale :

```text
frontend/src/app
  core/
    guards/
    interceptors/
    models/
    services/
  features/
    auth/
    customers/
    dashboard/
    offers/
    sales/
  layout/
    components/topbar/
    shell/
  shared/
    components/stat-card/
```

Pages principales :

- Login ;
- Dashboard ;
- Gestion clients ;
- Formulaire client ;
- Catalogue offres ;
- Formulaire offre ;
- Creation vente ;
- Detail vente / panier ;
- Paiement simule ;
- Facture / recu ;
- Historique ventes.

Le frontend consomme l'API via des services Angular et protege les routes selon les roles.

## 10. Modele De Donnees

Entites principales :

- `User` : utilisateur applicatif ;
- `Role` : `ADMIN`, `AGENT`, `SUPERVISOR` ;
- `Customer` : client commercial ;
- `Offer` : offre telecom vendable ;
- `Sale` : vente ;
- `SaleItem` : ligne de panier ;
- `Payment` : paiement simule ;
- `Invoice` : facture/recu ;
- `AuditableEntity` : dates de creation/mise a jour.

Relations principales :

```text
User 1..n Sale
Customer 1..n Sale
Sale 1..n SaleItem
Offer 1..n SaleItem
Sale 1..1 Payment
Sale 1..1 Invoice
User n..1 Role
```

Statuts :

- `SaleStatus` : `DRAFT`, `VALIDATED`, `PAID`, `CANCELLED` ;
- `PaymentStatus` : `PENDING`, `PAID`, `FAILED` ;
- `PaymentMethod` : `CASH`, `CARD`, `TRANSFER`, `CHECK` ;
- `OfferCategory` : `MOBILE`, `INTERNET`, `FIBRE`, `ADSL`, `BOX`, `RECHARGE`.

## 11. Endpoints REST Principaux

Base API :

```text
http://localhost:8080/api
```

Authentification :

```text
POST /auth/login
POST /auth/register
GET  /auth/me
```

Clients :

```text
GET    /customers
GET    /customers/{id}
GET    /customers/search?keyword=
POST   /customers
PUT    /customers/{id}
DELETE /customers/{id}
```

Offres :

```text
GET   /offers
GET   /offers/active
GET   /offers/{id}
POST  /offers
PUT   /offers/{id}
PATCH /offers/{id}/activate
PATCH /offers/{id}/deactivate
```

Ventes :

```text
GET    /sales
GET    /sales/{id}
POST   /sales
PUT    /sales/{id}
POST   /sales/{id}/items
PUT    /sales/{id}/items/{itemId}
DELETE /sales/{id}/items/{itemId}
POST   /sales/{id}/validate
POST   /sales/{id}/cancel
POST   /sales/{id}/payment
POST   /sales/{id}/invoice
GET    /sales/{id}/invoice
```

Factures :

```text
GET  /invoices
GET  /invoices/{id}
GET  /invoices/sale/{saleId}
POST /invoices/sale/{saleId}
```

Paiements :

```text
GET /payments
GET /payments/{id}
```

Dashboard :

```text
GET /dashboard
GET /dashboard/summary
GET /dashboard/sales-by-offer
GET /dashboard/sales-by-agent
GET /dashboard/revenue-by-month
```

Swagger UI :

```text
http://localhost:8080/swagger-ui.html
```

## 12. Installation Backend

Prerequis :

- Java 21 ;
- Maven ou Maven Wrapper ;
- PostgreSQL.

Depuis la racine :

```powershell
cd backend
.\mvnw.cmd clean install
```

Lancer l'API :

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Avec Maven global :

```powershell
cd backend
mvn spring-boot:run
```

Backend disponible sur :

```text
http://localhost:8080
```

## 13. Installation Frontend

Prerequis :

- Node.js ;
- npm.

Installation :

```powershell
cd frontend
npm install
```

Lancement :

```powershell
cd frontend
npm start
```

Application disponible sur :

```text
http://localhost:4200
```

Le frontend appelle par defaut :

```text
http://localhost:8080/api
```

Configuration :

```text
frontend/src/environments/environment.ts
```

## 14. Configuration Base De Donnees

Configuration par defaut dans `backend/src/main/resources/application.yml` :

```yaml
spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/telecom_crm}
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD:postgres}
  jpa:
    hibernate:
      ddl-auto: update
```

Creer une base PostgreSQL :

```sql
CREATE DATABASE telecom_crm;
```

Variables d'environnement possibles :

```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/telecom_crm"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="postgres"
$env:SERVER_PORT="8080"
$env:JWT_SECRET="base64-secret"
$env:JWT_EXPIRATION_MS="86400000"
```

Au demarrage, `DataSeeder` cree les roles, comptes de test, clients et offres si les tables sont vides.

## 15. Lancement Des Tests Backend

```powershell
cd backend
.\mvnw.cmd test
```

Ou avec Maven global :

```powershell
cd backend
mvn test
```

Tests inclus :

- tests unitaires services ;
- tests integration auth/ventes ;
- verification des regles metier principales.

## 16. Lancement Des Tests Frontend

```powershell
cd frontend
npm test
```

Les tests Angular utilisent Jasmine/Karma.

Composants couverts :

- login ;
- clients ;
- offres ;
- creation vente ;
- detail vente ;
- paiement ;
- facture ;
- dashboard.

## 17. Lancement Des Tests E2E

Les tests E2E Cypress utilisent des API mockees pour rester reproductibles et ne pas modifier une base reelle.

Installer les dependances :

```powershell
cd frontend
npm install
```

Lancer l'application :

```powershell
cd frontend
npm run start -- --host 127.0.0.1 --port 4200
```

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

Documentation E2E :

```text
frontend/cypress/README.md
```

## 18. Comptes De Test

Comptes crees automatiquement par `DataSeeder` :

```text
admin / admin123
agent / agent123
```

Roles :

- `admin` : role `ADMIN` ;
- `agent` : role `AGENT`.

Le role `SUPERVISOR` existe dans les roles seedes, mais aucun compte superviseur n'est cree par defaut.

## 19. Captures D'ecran A Ajouter Plus Tard

Emplacements suggeres :

```text
docs/screenshots/login.png
docs/screenshots/dashboard.png
docs/screenshots/customers.png
docs/screenshots/offers.png
docs/screenshots/sale-cart.png
docs/screenshots/payment.png
docs/screenshots/invoice.png
docs/screenshots/history.png
```

Captures recommandees :

- page login ;
- dashboard commercial ;
- liste clients ;
- catalogue offres ;
- panier/devis ;
- paiement simule ;
- facture imprimable ;
- historique ventes.

## 20. Perspectives D'evolution

Evolutions fonctionnelles possibles :

- gestion d'un compte `SUPERVISOR` complet ;
- filtres avances dans l'historique ;
- export CSV/Excel ;
- generation PDF ;
- workflow de validation commerciale ;
- gestion des remises ;
- suivi des commissions ;
- multi-agences ;
- statistiques avancees.

Evolutions techniques possibles :

- migrations Flyway/Liquibase ;
- profils Spring `dev`, `test`, `prod` ;
- Docker Compose PostgreSQL + backend + frontend ;
- CI/CD ;
- couverture de tests ;
- observabilite ;
- pagination cote API ;
- gestion fine des permissions ;
- rafraichissement JWT.

Evolutions telecom hors MVP, a traiter uniquement dans une phase ulterieure :

- reservation SIM ;
- attribution MSISDN ;
- activation reseau ;
- integration BSS/OSS ;
- eligibilite reseau ;
- provisioning ;
- facturation operateur reelle.

Ces evolutions ne font pas partie du prototype actuel.
