# Factura

Application desktop de traçabilité commerciale — prototype frontend React avec données statiques.

> Visualise le cycle complet **Devis → BDC → BL → Attachement → Facture → Paiements** issu du cahier des charges Sage.

---

## Stack

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 + Vite |
| Langage | JavaScript (JSX) |
| Style | CSS-in-JS inline + variables CSS natives |
| Données | Statiques (fichier JSX) — pas de backend |
| Packaging cible | PyInstaller `.exe` (hors scope prototype) |

---

## Démarrage rapide

```bash
# 1. Créer le projet
npm create vite@latest factura -- --template react
cd factura
npm install

# 2. Remplacer le composant principal
cp factura-app.jsx src/App.jsx

# 3. Lancer en développement
npm run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173)

---

## Structure du fichier

```
factura-app.jsx
├── STATIC DATA          # Clients, Devis, BDC, BL, Attachements, Factures, Paiements
├── HELPERS              # fmt(), fmtDate(), getClientName(), StatusBadge
├── MODULES
│   ├── Dashboard        # KPIs + graphiques barres + alertes
│   ├── ClientsModule    # Liste + fiche détail + historique
│   ├── DevisModule
│   ├── BDCModule
│   ├── BLModule
│   ├── AttachementModule
│   ├── FacturesModule
│   ├── EncaissementsModule
│   ├── TraçabilitéModule  ← fonctionnalité principale
│   ├── TimelineModule
│   └── SearchModule
└── APP SHELL            # Sidebar + routing interne
```

---

## Modules

### Tableau de bord
KPIs en temps réel : nombre de clients, sociétés, devis, BDC, BL, factures, montants facturés / encaissés / restants, dossiers en cours. Barres de progression par statut des devis. Comparaison encaissé vs restant. Alertes automatiques (devis en attente > 7j, BL sans attachement, facture partiellement payée).

### Clients & Sociétés
Liste cliquable. Fiche détail avec coordonnées complètes (matricule fiscal, RC pour sociétés). Onglet historique par entité : tous les documents liés classés chronologiquement.

### Devis / BDC / BL / Attachements / Factures / Encaissements
Tableaux avec statuts colorés, références croisées entre documents, montants.

### Traçabilité ⭐
Vue roadmap horizontale cliquable :

```
Client → DV-001 → BDC-001 → BL-001 → ATT-001 → FAC-001 → PAY-001 → PAY-002
```

Un clic sur n'importe quel nœud ouvre un panneau de détail complet. Les nœuds manquants apparaissent en pointillés.

### Timeline interactive
Chronologie de tous les événements de toutes les transactions, triée par date, avec code couleur par type de document.

### Recherche & Filtres
Recherche multi-critères sur numéro, client, description. Filtres par type de document et par statut. Résultats en temps réel.

---

## Données de test incluses

| Entité | Quantité | Détail |
|--------|----------|--------|
| Clients | 2 | Karim Mansouri, Nadia Ben Salah |
| Sociétés | 2 | TechVision SARL, BTP Construct SA |
| Devis | 4 | Statuts variés : Accepté × 2, En attente, Refusé |
| BDC | 2 | Liés aux devis acceptés |
| BL | 2 | Dont 1 partiellement livré |
| Attachements | 1 | Validé (chaîne TechVision complète) |
| Factures | 1 | Partiellement payée |
| Paiements | 2 | Virement 25 000 DT + Chèque 15 000 DT |

---

## Cycle de vie métier

```
Devis (Accepté)
  └─→ BDC (Validé)
        └─→ BL (Livré)
              └─→ Attachement (Validé — accord mutuel)
                    └─→ Facture
                          └─→ Paiement(s)
```

Les transitions sont conditionnées par le statut de l'étape précédente.

---

## Statuts et codes couleur

| Couleur | Statuts |
|---------|---------|
| 🟢 Vert | Accepté, Validé, Livré, Payée |
| 🟡 Amber | En attente, En préparation, Partiellement livré, En attente d'accord, Partiellement payée |
| 🔴 Rouge | Refusé, Annulé, Contesté, En retard |
| 🔵 Bleu | Partiellement payée |

---

## Roadmap vers la version complète

- [ ] Connecter le backend Spring Boot (API REST)
- [ ] Authentification JWT (rôles : Admin, Comptable, Commercial, Lecture seule)
- [ ] Import des documents PDF Sage
- [ ] Stockage fichiers local (PyInstaller `.exe`)
- [ ] Base de données PostgreSQL 15+
- [ ] Notifications push desktop
- [ ] Export PDF des rapports

---

## Rôles utilisateurs (cible)

| Rôle | Accès |
|------|-------|
| Administrateur | Accès total + gestion utilisateurs |
| Comptable | Attachements, Factures, Encaissements |
| Commercial | Devis, suivi client |
| Lecture seule | Consultation sans modification |

---

## Licence

Prototype interne — données statiques uniquement. Aucune donnée réelle n'est stockée.
