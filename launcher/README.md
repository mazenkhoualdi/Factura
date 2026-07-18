# ⚠️ Dossier obsolète (conservé pour référence)

Ce lanceur Python (`launcher.py`) était utilisé en tout début de projet, en mode
**développement uniquement**. Il suppose que Maven, npm et Java sont déjà installés
sur la machine qui l'exécute (`mvn spring-boot:run` + `npm run dev`).

**Il n'est plus utilisé pour produire l'application livrée au client.**

Le packaging officiel pour la distribution (installeur Windows autonome, sans
dépendance à installer côté utilisateur) se trouve maintenant dans :

- `electron-shell/` — la coquille desktop (Electron)
- `build-all.bat` (à la racine) — le script de build complet
- `license-tools/` — génération/renouvellement de licence
- `GUIDE_PACKAGING_WINDOWS.md` — la documentation complète du processus

Ce dossier est conservé uniquement à titre de référence historique / pour un usage
de développement rapide en local (sans passer par le build complet), pas pour la
livraison finale.
