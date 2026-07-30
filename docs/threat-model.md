# Threat model initial

| Menace | Contrôle présent | Suite requise |
|---|---|---|
| Injection dans un document | prompt système traitant le document comme donnée non fiable, aucune instruction/outils web, Structured Outputs stricts | évaluations adversariales fictives |
| Invention ou preuve fabriquée | section et citation vérifiées côté serveur; réponse entière refusée si preuve introuvable; jamais `VERIFIED` automatiquement | revue humaine obligatoire |
| Fuite de document/secret | seuls textes/sections extraits envoyés en mode IA explicite; `store:false`; clé serveur; aucune réponse brute persistée/loguée | chiffrement objet/base et politique de rétention |
| Panne/coût du fournisseur | délai 45 s, deux retries SDK pour erreurs transitoires, tokens affichés, aucune mutation/fallback silencieux | quotas configurables |
| Envoi non autorisé | aucune route d’envoi ni outil externe | approbation hashée future |
| Fichier hostile | MIME, extension, signature, nom et limite 10 Mo; noms opaques | analyse antivirus future |
| SSRF/XSS/SQL | aucune récupération URL/SQL; texte échappé | CSP/CSRF avant hébergement |

Frontières : navigateur non fiable → API; document non fiable → extracteur/analyseur; fournisseur IA externe. Les clés, réponses brutes et documents complets ne sont jamais journalisés.
