# SwissApply Agent — bibliothèque privée

Jalon 1 réellement utilisable : import privé de PDF/DOCX, extraction de texte, propositions de faits et Base de vérité persistante. Le scan d'offres, la génération de CV/lettres et les candidatures ne sont pas implémentés.

## Installation et démarrage

Prérequis : Node.js 20 ou supérieur. Aucun compte, Docker, secret ou service payant n'est requis.

### Windows PowerShell

```powershell
git clone <URL_DU_DEPOT>
cd SwissApply
npm ci
npm run check
npm run build
$env:SWISSAPPLY_STORAGE_DIR="$env:LOCALAPPDATA\SwissApply\private"
npm start
```

Ouvrir <http://localhost:3000>. Arrêter avec `Ctrl+C`. Lors des démarrages suivants, exécuter `npm run build` après une mise à jour du code, puis `npm start`. Les documents et décisions restent dans `%LOCALAPPDATA%\SwissApply\private`.

### Linux / macOS

```bash
npm ci
npm run check
npm run build
SWISSAPPLY_STORAGE_DIR="$HOME/.local/share/swissapply/private" npm start
```

Sans variable, le stockage est `storage/private/`, toujours ignoré par Git.

## Parcours disponible

1. **Documents** : choisir CV, dossier de compétences, certificat de travail, diplôme ou attestation; déposer ou sélectionner plusieurs PDF/DOCX de 10 Mo maximum.
2. Consulter le statut, la date, le texte extrait et sa provenance par page PDF ou section DOCX.
3. **Base de vérité** : examiner les faits atomiques regroupés par catégorie, entité et champ; filtrer par statut/catégorie, rechercher, consulter toutes les sources, puis modifier, valider ou refuser. Une extraction demeure `PROPOSED` jusqu'à une validation humaine.
4. Les doublons exacts sont consolidés avec plusieurs sources. Une contradiction n'est signalée que pour deux valeurs différentes du même champ de la même entité; une fusion reste `PROPOSED` et doit être validée.
5. **Réanalyser les documents** reconstruit d'abord les propositions depuis les textes déjà conservés, puis affiche un bilan détaillé. Les faits manuels, `VERIFIED`, `REJECTED` et déjà archivés sont préservés. Les propositions devenues obsolètes ne sont archivées qu'après une analyse réussie; si aucun fait ne peut être produit depuis des documents non vides, la réanalyse échoue sans modifier la Base de vérité.
6. Exporter la Base de vérité en JSON ou supprimer un document après confirmation. La suppression retire aussi ses faits.

## Mode Démonstration séparé

Le mode privé est vide à la première utilisation. Pour afficher uniquement les anciennes fixtures fictives, sans les mélanger à la bibliothèque privée :

```powershell
$env:SWISSAPPLY_MODE="demo"
npm start
```

```bash
SWISSAPPLY_MODE=demo npm start
```

L'import et la suppression de documents sont désactivés dans ce mode.

## Sécurité et limites

- Validation du nom, extension, MIME, signature et taille; rejet des traversées de chemin et noms internes opaques.
- Écritures JSON atomiques et permissions privées quand le système les prend en charge; contenu affiché après échappement HTML.
- Le schéma persistant est versionné. Une migration crée une sauvegarde locale de `data.json` avant écriture et corrige les noms présentant un mojibake UTF-8 identifiable sans ambiguïté.
- Les fichiers importés sont des données non fiables. Aucun appel externe ou envoi n'est effectué.
- Seuls des faits `VERIFIED` pourront alimenter une candidature; cette version ne comporte aucune candidature.
- L'analyse est déterministe : elle normalise Unicode, espaces, puces et tirets, puis construit des blocs intermédiaires sourcés avant de produire les faits. Elle reconnaît les principales rubriques françaises et analyse des expériences sur deux à cinq lignes, y compris entreprise en casse normale ou avec suffixe, lieu géographique, poste et période sur la même ligne ou sur des lignes distinctes.
- Les périodes reconnues couvrent notamment les années, `MM/YYYY`, les mois français, `depuis`, `présent` et `aujourd’hui`. Les métriques reconnues incluent pourcentages, euros, CHF, effectifs, volumes et délais. Le texte extrait original reste consultable comme preuve et n’est pas remplacé par sa version normalisée.
- Elle ne déduit jamais une information absente. Les mises en page complexes, tableaux, colonnes PDF mal ordonnées, intitulés inhabituels et rattachements ambigus peuvent rester non extraits ou `NEEDS_CONFIRMATION` et exigent une relecture humaine.
- Une expérience ambiguë reçoit une entité `experience:unresolved:<document>:<ancre>` isolée et ne participe jamais aux contradictions. La rubrique Langues n'accepte que des langues et niveaux explicitement reconnus; elle s'arrête à la première ligne non linguistique.
- La correction d'un fait permet de modifier sa catégorie, son entité, son champ, sa valeur structurée et sa formulation. Toute correction revient à `PROPOSED` avant validation humaine.
- Pas d'OCR pour les PDF image, de chiffrement applicatif, d'accès concurrent, de sauvegarde automatique ou de restauration d'un export dans l'interface.
- Scan Internet, horaire de 06:00, génération documentaire, LinkedIn et soumission restent à construire.

## Docker facultatif

```bash
docker compose up --build
```

Le volume nommé conserve `/app/storage`. Docker n'est pas requis pour Windows.

## Vérification

`npm run check` compile en TypeScript strict, maintient les tests métier existants et teste de vrais PDF/DOCX fictifs : extraction, persistance après redémarrage, ajout/modification/validation/refus/fusion, contradiction, rejet, suppression, export et séparation Démonstration. La CI exécute ce contrôle sous Ubuntu et Windows.
