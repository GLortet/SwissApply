# ADR 0004 — Fournisseurs d’analyse documentaire

## Décision

Le serveur dépend de l’interface `DocumentAnalyzer`, jamais du SDK OpenAI. `DeterministicAnalyzer` encapsule le parseur local existant. `OpenAIAnalyzer` demande un objet professionnel strict à la Responses API puis vérifie côté serveur chaque section et citation avant de créer un fait.

Le mode est explicite (`SWISSAPPLY_ANALYSIS_MODE=deterministic|ai`). Une clé absente, une réponse invalide, une citation introuvable ou zéro fait valide interrompt la réanalyse sans fallback ni mutation. Les identifiants sont produits par le serveur à partir du contenu validé, et non par le modèle.

## Conséquences

Le mode déterministe reste gratuit et hors ligne mais limité par les mises en page. Le mode IA transmet uniquement le texte déjà extrait à OpenAI, peut occasionner coût et latence, et nécessite une relecture humaine : aucun fait automatique n’est `VERIFIED`. Le schéma persistant v3 ajoute provenance exacte et métadonnées d’extraction; la migration sauvegarde le fichier précédent.
