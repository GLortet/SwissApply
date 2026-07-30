# ADR 0004 — Fournisseurs d’analyse documentaire

## Décision

Le serveur dépend de l’interface `DocumentAnalyzer`, jamais du SDK OpenAI. `DeterministicAnalyzer` encapsule le parseur local existant. `OpenAIAnalyzer` demande un objet professionnel strict à la Responses API puis vérifie côté serveur chaque section et citation avant de créer un fait.

Le mode est explicite (`SWISSAPPLY_ANALYSIS_MODE=deterministic|ai`). Une clé absente, une réponse invalide, une citation introuvable ou zéro fait valide interrompt la réanalyse sans fallback ni mutation. Les identifiants sont produits par le serveur à partir du contenu validé, et non par le modèle.

## Conséquences

Le mode déterministe reste gratuit et hors ligne mais limité par les mises en page. Le mode IA transmet uniquement le texte déjà extrait à OpenAI, peut occasionner coût et latence, et nécessite une relecture humaine : aucun fait automatique n’est `VERIFIED`. Le schéma persistant v3 ajoute provenance exacte et métadonnées d’extraction; la migration sauvegarde le fichier précédent.

## Complément — cache et consolidation

Le schéma v4 ajoute un cache de résultats métier dérivés indexé par empreinte exacte du texte, modèle, prompt et schéma. Il ne contient ni réponse brute ni secret. Les documents vides ne traversent pas le fournisseur. Une exécution forcée est une action séparée confirmée explicitement.

Les identifiants locaux du modèle sont délimités au document. Les expériences ont une signature forte entreprise+période; les réalisations ne changent d’entité qu’après égalité déterministe de leurs ancres normalisées. Les rapprochements flous restent seulement signalés au niveau documentaire.
