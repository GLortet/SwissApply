# ADR-0001 — Amorçage sans dépendance externe

**Statut :** accepté temporairement, contrainte de registre levée — 2026-07-29

## Décision
Conserver TypeScript strict et la séparation `apps`/`packages`, mais stabiliser la première tranche avec le serveur HTTP natif Node et un dépôt mémoire. TypeScript et les types Node sont maintenant verrouillés localement. Next.js, React, Zod et l'ORM seront évalués au jalon concerné plutôt que mélangés à ce travail de reproductibilité.

## Contexte et conséquences
Le dépôt était vide et le registre était initialement inaccessible. L'accès à `registry.npmjs.org` est désormais fonctionnel; un lockfile et les outils locaux rendent la compilation reproductible sans `tsc` global. Le noyau métier reste indépendant du framework et migrable. L'interface est réellement exécutable, mais il n'y a encore ni App Router, ni persistance, ni authentification de production.
