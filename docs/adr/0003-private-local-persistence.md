# ADR 0003 — Persistance privée locale

## Décision

La persistance est exposée par l'interface `Repository`. L'implémentation locale écrit atomiquement les métadonnées et faits dans `storage/private/data.json` et conserve les originaux sous des noms UUID dans `storage/private/originals`. Le dossier `storage/` est ignoré par Git.

Le mode privé, utilisé par défaut, démarre vide. Le mode Démonstration est activé explicitement avec `SWISSAPPLY_MODE=demo`, utilise uniquement les fixtures fictives en mémoire et interdit l'import documentaire.

## Conséquences et limites

Cette solution fonctionne hors ligne, sous Windows et Linux, sans Docker ni service payant. Elle est destinée à un utilisateur et un processus. Elle ne fournit pas de chiffrement applicatif au repos, de verrouillage distribué ni de sauvegarde automatique. Une future implémentation de `Repository` pourra utiliser PostgreSQL et un stockage objet privé sans modifier les règles métier.
