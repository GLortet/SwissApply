# Threat model initial

| Menace | Contrôle présent | Suite requise |
|---|---|---|
| Prompt injection dans un document/offre | contenu traité en donnée, rendu échappé, aucune exécution d'outil | délimitation des prompts et tests fournisseur |
| Invention de faits | garde `assertClaimTraceable` sur faits vérifiés | contrôle de chaque phrase générée |
| Fuite de données/secret | fixtures fictives, ignores Git, aucun appel sortant | chiffrement objet/base, rétention, logs expurgés |
| Envoi non autorisé | aucune route d'envoi dans ce jalon | approbation hashée, allowlist, audit et idempotence |
| Fichier hostile | import absent | limites MIME/taille, analyse isolée, refus de macros |
| SSRF/XSS/SQL | aucune récupération URL/SQL; échappement HTML | allowlist URL, requêtes paramétrées, CSP/CSRF |

Frontières : navigateur non fiable → API; document/offre non fiable → extracteur; fournisseur IA externe; worker → sources publiques autorisées. Toute authentification, CAPTCHA, question sensible ou divergence matérielle impose l'arrêt.
