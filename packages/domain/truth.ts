export const factStatuses = ["PROPOSED", "VERIFIED", "NEEDS_CONFIRMATION", "REJECTED", "FORBIDDEN"] as const;
export type FactStatus = (typeof factStatuses)[number];

export interface SourceRef { documentId: string; name: string; location: string }
export interface FactEvent { at: string; action: "CREATED" | "VERIFIED" | "REJECTED"; actor: "mock-extractor" | "gilles" }
export interface CandidateFact {
  id: string; category: string; key: string; canonical: string; structuredValue?: string;
  source: SourceRef; confidence: number; status: FactStatus; validatedAt?: string;
  validUntil?: string; allowedAlternatives: string[]; tags: string[]; privateNotes?: string;
  active: boolean; history: FactEvent[];
}
export interface Contradiction { key: string; factIds: string[]; values: string[] }
export interface Claim { text: string; factIds: string[] }

export function findContradictions(facts: readonly CandidateFact[]): Contradiction[] {
  const groups = new Map<string, CandidateFact[]>();
  for (const fact of facts.filter((item) => item.active && !["REJECTED", "FORBIDDEN"].includes(item.status))) {
    const key = `${fact.category}:${fact.key}`;
    groups.set(key, [...(groups.get(key) ?? []), fact]);
  }
  return [...groups.entries()].flatMap(([key, values]) => {
    const distinct = [...new Set(values.map((fact) => fact.structuredValue ?? fact.canonical))];
    return distinct.length > 1 ? [{ key, factIds: values.map((fact) => fact.id), values: distinct }] : [];
  });
}

export function decideFact(fact: CandidateFact, action: "verify" | "reject", at = new Date().toISOString()): CandidateFact {
  if (fact.status === "FORBIDDEN") throw new Error("Un fait interdit ne peut pas être validé.");
  const status: FactStatus = action === "verify" ? "VERIFIED" : "REJECTED";
  return { ...fact, status, ...(status === "VERIFIED" ? { validatedAt: at } : {}), history: [...fact.history, { at, action: status, actor: "gilles" }] };
}

export function assertClaimTraceable(claim: Claim, facts: readonly CandidateFact[]): void {
  if (claim.factIds.length === 0) throw new Error("NEEDS_USER_INPUT: affirmation sans source.");
  const byId = new Map(facts.map((fact) => [fact.id, fact]));
  for (const id of claim.factIds) {
    const fact = byId.get(id);
    if (!fact || !fact.active || fact.status !== "VERIFIED") throw new Error(`NEEDS_USER_INPUT: fait ${id} absent ou non vérifié.`);
  }
}
