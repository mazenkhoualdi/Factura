# 🧾 Factura – Prototype Frontend

> **Application desktop de traçabilité commerciale**
>
> Prototype React permettant de visualiser le cycle complet des documents commerciaux issus de Sage :
>
> **Devis → Bon de Commande → Bon de Livraison → Attachement → Facture → Paiement**

---

# 📖 Présentation



L'objectif est de reproduire l'ensemble du processus commercial d'une entreprise utilisant **Sage**, en mettant en évidence les relations entre les différents documents afin d'assurer une meilleure traçabilité des transactions..

Toutes les données sont **statiques**.

Aucun backend, aucune API et aucune base de données ne sont utilisés.

---

# 🎯 Objectifs

Le prototype permet de :

- Valider le parcours utilisateur
- Présenter une démonstration fonctionnelle
- Tester l'ergonomie
- Visualiser la navigation
- Vérifier les relations entre les documents
- Simuler toutes les opérations CRUD
- Préparer le développement de la version finale

---

# 🚀 Fonctionnalités

## 📊 Tableau de bord

- KPIs
- Nombre de clients
- Nombre de sociétés
- Nombre de devis
- Nombre de BDC
- Nombre de BL
- Nombre de factures
- Montant facturé
- Montant encaissé
- Reste à encaisser
- Dossiers en cours

### Graphiques

- Evolution mensuelle des devis
- Répartition des devis par statut
- Facturé vs Encaissé vs Reste

### Alertes

- Devis en attente
- BL sans attachement
- Factures partiellement payées

---

## 👥 Gestion des Clients

- Liste
- Recherche
- Fiche détaillée
- Coordonnées
- Historique complet

Historique :

- Devis
- BDC
- BL
- Attachements
- Factures
- Paiements

---

## 🏢 Gestion des Sociétés

- Liste
- Recherche
- Responsable
- Matricule fiscal
- Registre de commerce
- Historique des transactions

---

# 📄 Gestion des Documents

Chaque module possède les mêmes fonctionnalités.

Modules :

- Devis
- Bon de Commande
- Bon de Livraison
- Attachement
- Facture
- Paiement

Fonctionnalités :

- Liste
- Recherche
- Filtres
- Ajout
- Modification
- Suppression
- Aperçu PDF
- Simulation de pièce jointe

Chaque document possède :

- Numéro
- Date
- Client
- Description
- Montant
- Statut
- Références vers les autres documents

---

# ⭐ Traçabilité

Fonction principale du projet.

L'utilisateur peut rechercher n'importe quel document :

```
DEV-0001
BDC-0002
BL-0004
ATT-0007
FAC-0010
PAY-0015
```

L'application reconstruit automatiquement tout le parcours commercial.

```
Client

↓

Devis

↓

Bon de Commande

↓

Bon de Livraison

↓

Attachement

↓

Facture

↓

Paiement(s)
```

Fonctionnalités :

- Recherche
- Mise en évidence du document recherché
- Roadmap horizontale
- Consultation des détails
- Navigation entre les documents

---

# 📅 Timeline Interactive

Vue chronologique complète.

Les transactions sont regroupées par client.

Filtres :

- Toutes
- En cours
- Terminées
- Bloquées

Chaque transaction peut être développée afin d'afficher :

- Devis
- BDC
- BL
- Attachement
- Facture
- Paiements

Chaque étape affiche :

- numéro
- date
- statut
- montant
- description

---

# 🔍 Recherche

Disponible dans tous les modules.

Recherche par :

- numéro
- client
- description

Filtres :

- statut
- période

---

# ⚙️ Paramètres

- Mode clair
- Mode sombre

Le thème est conservé durant toute la session.

---

# 📂 Données de démonstration

Le prototype contient des données fictives.

| Élément | Quantité |
|----------|----------|
| Clients | 5 |
| Sociétés | 2 |
| Devis | 20 |
| BDC | 15 |
| BL | 12 |
| Attachements | 10 |
| Factures | 8 |
| Paiements | 15 |

Les données couvrent plusieurs scénarios :

- Accepté
- Refusé
- Contesté
- Livré
- Partiellement livré
- Validé
- En attente
- Facture en retard
- Paiement partiel
- Paiement complet

---

# 🔄 Cycle métier

Le prototype respecte le processus métier suivant :

```text
Devis (Accepté)

        │

        ▼

Bon de Commande (Validé)

        │

        ▼

Bon de Livraison (Livré)

        │

        ▼

Attachement (Validé)

        │

        ▼

Facture

        │

        ▼

Paiement(s)
```

Chaque étape dépend de la validation de la précédente.

---

# 🎨 Codes couleurs

| Couleur | Signification |
|----------|---------------|
| 🟢 Vert | Accepté, Validé, Livré, Payée |
| 🟡 Orange | En attente, Partiellement livré, En attente d'accord |
| 🔴 Rouge | Refusé, Contesté, En retard |
| 🔵 Bleu | Paiement partiel |

---

# 🛠️ Technologies utilisées

| Couche | Technologie |
|---------|--------------|
| Frontend | React 18 |
| Build Tool | Vite |
| UI | Material UI (MUI v5) |
| Graphiques | Recharts |
| Routing | React Router DOM v6 |
| Langage | JavaScript (JSX) |
| Gestion d'état | React Context |
| Données | Statiques |

---

# 📁 Structure du projet

```
src/

│

├── App.jsx

│

├── Context

├── Components

│      ├── Dashboard

│      ├── Clients

│      ├── Sociétés

│      ├── Devis

│      ├── BDC

│      ├── BL

│      ├── Attachements

│      ├── Factures

│      ├── Paiements

│      ├── Traçabilité

│      ├── Timeline

│      └── Paramètres

│

├── Assets

├── Theme

└── Utils
```

---

# 🚀 Installation

## 1. Cloner le projet

```bash
git clone https://github.com/votre-compte/factura.git
```

---

## 2. Installer les dépendances

```bash
npm install
```

---

## 3. Lancer le projet

```bash
npm run dev
```

Puis ouvrir :

```
http://localhost:5173
```

---

# 📦 Dépendances principales

```bash
npm install

@mui/material
@mui/icons-material
@emotion/react
@emotion/styled
react-router-dom
recharts
```

---

# 🧪 Tests du prototype

Vous pouvez tester :

- ✅ Ajout
- ✅ Modification
- ✅ Suppression
- ✅ Recherche
- ✅ Filtres
- ✅ Timeline
- ✅ Traçabilité
- ✅ Navigation
- ✅ Aperçu PDF (simulation)

Les données sont uniquement stockées en mémoire.

Un rechargement de la page réinitialise toutes les données.

---

# 🔐 Authentification

Le prototype ne possède pas :

- Authentification
- Gestion des rôles
- Base de données

Un utilisateur **Administrateur** est simulé automatiquement.

---

# 🚧 Roadmap

Version complète prévue :

- Backend Spring Boot
- API REST
- PostgreSQL
- Authentification JWT
- Gestion des rôles
- Import automatique des PDF Sage
- Stockage des fichiers
- Notifications Desktop
- Génération de rapports PDF
- Tableau de bord avancé
- Statistiques temps réel
- Export Excel / PDF
- Packaging Windows (.exe)
- Tests unitaires
- Tests d'intégration

---

# 📄 Licence

Prototype interne destiné à la validation fonctionnelle.

Les données utilisées sont entièrement fictives.

Aucune donnée réelle n'est enregistrée ni transmise.
