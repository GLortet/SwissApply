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
5. **Réanalyser les documents** examine chaque document présent, reconstruit d'abord les propositions depuis les textes déjà conservés, puis affiche les totaux présents/examinés/exploitables/contributeurs et un bilan par document (format, extraction, caractères, pages ou sections, blocs, faits générés/retenus et motif d'absence). Les faits manuels, `VERIFIED`, `REJECTED` et déjà archivés sont préservés. Les propositions devenues obsolètes ne sont archivées qu'après une analyse réussie; si aucun fait ne peut être produit, la réanalyse échoue sans modifier la Base de vérité.
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
- Les titres et sous-titres d'expérience sont exclus des entreprises. Les listes de méthodes sont distinguées des postes, les phrases descriptives ne deviennent pas des rôles, et les compétences trop fragmentaires sont ignorées. Les lignes `entreprise | lieu` sont séparées avant classification; `Cursus Universitaire` ouvre une rubrique de formation sans devenir un fait.
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

## Analyse IA structurée (optionnelle)

Le mode par défaut reste local et hors ligne. Pour demander explicitement l’analyse IA sous PowerShell :

```powershell
$env:SWISSAPPLY_ANALYSIS_MODE="ai"
$env:SWISSAPPLY_OPENAI_MODEL="gpt-5.6-terra"
$env:OPENAI_API_KEY="<clé côté serveur>"
npm start
```

Sous Linux/macOS :

```bash
SWISSAPPLY_ANALYSIS_MODE=ai SWISSAPPLY_OPENAI_MODEL=gpt-5.6-terra OPENAI_API_KEY='<clé>' npm start
```

L’analyse IA utilise le SDK officiel, la Responses API et un schéma Zod strict, avec `store: false`, raisonnement faible, aucun outil externe, un délai de 45 secondes et deux nouvelles tentatives maximum pour les erreurs transitoires. Le modèle est configurable; sa disponibilité doit être vérifiée sur le compte OpenAI concerné. Seuls le texte déjà extrait et ses libellés de sections sont transmis, jamais le PDF/DOCX original.

Chaque valeur doit fournir une section et une citation retrouvable. Le serveur refuse atomiquement une réponse invalide ou non prouvée, génère lui-même les identifiants stables, et conserve uniquement les faits validés avec la méthode, le modèle, la version du prompt et la date — jamais la réponse OpenAI brute. L’import conserve le document même si son analyse échoue. Le bouton **Analyse locale déterministe** impose explicitement le filet de secours hors ligne; aucun fallback silencieux n’existe.

Sans `OPENAI_API_KEY`, le mode `ai` démarre mais l’import/réanalyse affiche une erreur explicite sans modifier la Base de vérité. Les tests CI utilisent un faux fournisseur et ne réalisent aucun appel réseau. Aucun essai IA réel n’est inclus dans `npm run check`.

## Fiabilisation et maîtrise du coût des réanalyses

Une réanalyse possède désormais un verrou serveur mono-utilisateur et un verrou d’interface : une seconde requête reçoit HTTP 409, les boutons restent désactivés avec un compteur de durée, puis sont toujours réactivés. Les documents sans texte sont ignorés sans appel fournisseur.

Les analyses validées sont mises en cache par empreinte exacte du texte extrait, modèle, version de prompt et version de schéma. Une réanalyse ordinaire réutilise ce cache; le bouton de réanalyse forcée exige une confirmation explicite. Le cache persiste uniquement les faits structurés validés et leurs métadonnées, jamais la réponse brute OpenAI ni une clé. Le bilan distingue documents appelés, réutilisés et vides, ainsi que les tokens réellement consommés. Les doublons exacts sont signalés et une similarité textuelle déterministe signale les versions potentiellement redondantes sans suppression automatique.

Les expériences ne sont rapprochées que sur une entreprise normalisée et une période compatible. Les réalisations reçoivent d’abord un identifiant incluant le document; elles ne sont consolidées entre documents que si leurs ancres sémantiques normalisées sont identiques. Une collision de `localRef` entre deux réponses ne suffit jamais à les fusionner.
