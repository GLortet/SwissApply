import type { CandidateFact } from "./truth.js";

const created = "2026-07-29T06:00:00.000Z";
export const fictitiousFacts: CandidateFact[] = [
  { id: "fact_mock_001", category: "employment", key: "atelier-alpin:start", canonical: "Début chez Atelier Alpin en mars 2018", structuredValue: "2018-03", source: { documentId: "doc_mock_cv", name: "CV fictif Camille Exemple", location: "page 1" }, confidence: 0.93, status: "PROPOSED", allowedAlternatives: [], tags: ["industrie"], active: true, history: [{ at: created, action: "CREATED", actor: "mock-extractor" }] },
  { id: "fact_mock_002", category: "employment", key: "atelier-alpin:start", canonical: "Début chez Atelier Alpin en avril 2018", structuredValue: "2018-04", source: { documentId: "doc_mock_certificat", name: "Certificat fictif Camille Exemple", location: "section Période" }, confidence: 0.88, status: "NEEDS_CONFIRMATION", allowedAlternatives: [], tags: ["industrie"], active: true, history: [{ at: created, action: "CREATED", actor: "mock-extractor" }] },
  { id: "fact_mock_003", category: "skill", key: "lean:5s", canonical: "Animation d'ateliers 5S", source: { documentId: "doc_mock_cv", name: "CV fictif Camille Exemple", location: "page 2" }, confidence: 0.96, status: "PROPOSED", allowedAlternatives: ["Conduite d'ateliers 5S"], tags: ["lean", "amélioration-continue"], active: true, history: [{ at: created, action: "CREATED", actor: "mock-extractor" }] }
];
