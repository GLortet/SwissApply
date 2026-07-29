# ADR-0002 — Truth Base comme frontière de confiance

**Statut :** accepté — 2026-07-29

Les préférences de recherche, contenus importés, offres et faits candidat sont des domaines séparés. Une extraction crée uniquement des faits `PROPOSED`. Une affirmation de candidature est valide si tous ses identifiants pointent vers des faits actifs `VERIFIED`. Les transitions sont historisées et les faits ne sont jamais supprimés silencieusement.
