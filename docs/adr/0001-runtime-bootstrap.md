# ADR-0001 — Amorçage sans dépendance externe

**Statut :** accepté temporairement — 2026-07-29

## Décision
Conserver TypeScript strict et la séparation `apps`/`packages`, mais exécuter la première tranche avec le serveur HTTP natif Node et un dépôt mémoire. Next.js, React, Zod et l'ORM seront introduits après accès à un registre de paquets approuvé.

## Contexte et conséquences
Le dépôt était vide et `npm view next version` retourne HTTP 403. Forcer des versions non vérifiées nuirait à la reproductibilité. Le noyau métier reste indépendant du framework et migrable. L'interface est réellement exécutable, mais il n'y a encore ni App Router, ni persistance, ni authentification de production.
