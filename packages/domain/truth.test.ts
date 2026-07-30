import test from "node:test";
import assert from "node:assert/strict";
import { fictitiousFacts } from "./fixtures.js";
import { assertClaimTraceable, decideFact, findContradictions } from "./truth.js";

test("détecte deux dates contradictoires avec leur provenance", () => {
  const contradictions = findContradictions(fictitiousFacts);
  assert.equal(contradictions.length, 1);
  assert.deepEqual(contradictions[0]?.factIds, ["fact_mock_001", "fact_mock_002"]);
});
test("une extraction proposée ne peut pas soutenir une affirmation", () => {
  assert.throws(() => assertClaimTraceable({ text: "Anime des ateliers 5S", factIds: ["fact_mock_003"] }, fictitiousFacts), /NEEDS_USER_INPUT/);
});
test("une validation humaine rend le fait traçable et historisé", () => {
  const verified = decideFact(fictitiousFacts[2]!, "verify", "2026-07-29T07:00:00.000Z");
  assert.doesNotThrow(() => assertClaimTraceable({ text: verified.canonical, factIds: [verified.id] }, [verified]));
  assert.equal(verified.history.at(-1)?.actor, "gilles");
});
