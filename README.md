# SwissApply Agent

Application privée de préparation contrôlée de candidatures suisses. Cette première tranche verticale fournit un **jalon 0 exécutable** et le noyau du **jalon 1 (Truth Base en mode Mock)**, sans donnée personnelle réelle, clé API ou action externe.

## Démarrage

Prérequis : Node.js 20+ avec npm. TypeScript et les types Node sont verrouillés dans les dépendances de développement : aucune installation globale de `tsc` n'est nécessaire.

```bash
npm ci
npm run check
npm run build
npm start
```

Ouvrir <http://localhost:3000>. L'API de démonstration est disponible sur `GET /api/facts`. Les décisions sont acceptées par `POST /api/facts/:id/decision` avec `{ "action": "verify" | "reject" }`. Les données sont fictives et en mémoire : un redémarrage les réinitialise.

### Windows (PowerShell)

1. Installer [Node.js 20 LTS ou une version ultérieure](https://nodejs.org/), puis ouvrir un nouveau terminal PowerShell.
2. Depuis le dossier cloné, installer exactement les versions verrouillées, vérifier et lancer :

```powershell
node --version
npm --version
npm ci
npm run check
npm run build
npm start
```

3. Ouvrir `http://localhost:3000` dans le navigateur. Arrêter avec `Ctrl+C`. Les commandes ne nécessitent ni WSL, ni TypeScript global, ni variable secrète en mode Mock.

### Docker

Prérequis : Docker Desktop (Windows/macOS) ou Docker Engine avec le plugin Compose.

```bash
docker compose build --no-cache
docker compose up
```

Ouvrir <http://localhost:3000>, puis arrêter avec `Ctrl+C` et `docker compose down`. L'image installe les dépendances avec `npm ci` dans l'étape de compilation, n'embarque que le JavaScript compilé et exécute le serveur avec l'utilisateur non privilégié `node`.

## Ce qui fonctionne réellement

- modèle strict des faits avec provenance, confiance, statut et historique;
- interdiction de consommer un fait non vérifié dans une affirmation;
- détection déterministe de contradictions sur une même catégorie/clé;
- validation ou rejet humain via API et interface française responsive;
- mode Mock local, sans réseau, base ou service payant;
- page de santé honnête : couverture et scan sont marqués non configurés.

## Limites actuelles

Ce commit n'importe pas encore de PDF/DOCX, ne persiste pas les données, ne scanne aucune source et ne génère/soumet aucun document. Les boutons correspondants sont donc absents. Le choix Next.js/PostgreSQL reste la cible; le jalon 0 conserve temporairement le serveur HTTP natif de Node et une mémoire locale afin de stabiliser ce socle avant le jalon suivant. Voir [ADR-0001](docs/adr/0001-runtime-bootstrap.md).

## Données, sécurité et récupération

- Ne jamais déposer de CV réel, secret ou export dans Git. `storage/` et `.env*` sont ignorés.
- Les entrées sont traitées comme non fiables et rendues uniquement comme texte échappé.
- Cette version ne réalise aucune requête sortante et ne stocke aucun mot de passe.
- Sauvegarde/restauration : non applicable au stockage en mémoire. Le jalon PostgreSQL devra chiffrer les sauvegardes et tester la restauration.

## Feuille de route

1. **Jalon 1** : stockage PostgreSQL, import PDF/DOCX isolé, validation complète, fusion et export.
2. **Jalon 2** : worker durable, registre et trois adaptateurs autorisés, dédoublonnage, scoring et shortlist.
3. **Jalon 3** : dossier par offre, génération DOCX/PDF et contrôles de vérité/ATS/rendu.
4. **Jalon 4** : approbation immuable, formulaire de démonstration, extension MV3 et audit.
5. **Jalon 5** : préproduction, scan 06:00 Europe/Paris, stockage privé, monitoring et sauvegardes.

La voie d'hébergement recommandée est un conteneur web et un conteneur worker long-lived, PostgreSQL managé et stockage objet privé. Aucun déploiement ni achat n'est effectué par ce dépôt.
