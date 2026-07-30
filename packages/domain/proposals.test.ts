import assert from "node:assert/strict";
import test from "node:test";
import { consolidateFacts, findContradictions } from "./truth.js";
import { normalizeDocumentText, proposeFacts } from "./proposals.js";
const realistic=`EXPÉRIENCE PROFESSIONNELLE
ATELIER ALPINA
Responsable amélioration continue
Genève • Septembre 2021 – Avril 2025

• Déploiement du 5S auprès de 120 collaborateurs
• Réduction des rebuts de 25 %
• Animation de chantiers SMED et résolution de problèmes

FORMATION
Diplôme d’ingénieur industriel – Institut fictif – 2018

LANGUES
Français – langue maternelle
Anglais – professionnel`;
const extract=(id:string,text=realistic)=>proposeFacts(id,`CV fictif ${id}.docx`,[{label:"Section 1",text}]);
test("normalise sans perdre accents, puces ni limites logiques",()=>{assert.deepEqual(normalizeDocumentText("  Compétences\u00a0\n\n▪ 5S — SMED "),["Compétences","• 5S – SMED"]);});
test("extrait un CV multiligne réaliste sans titres ni invention",()=>{const facts=extract("a"),experience=facts.find(f=>f.field==="company");assert.equal(experience?.structuredValue,"ATELIER ALPINA");assert.ok(facts.some(f=>f.field==="role"&&f.structuredValue==="Responsable amélioration continue"));assert.ok(facts.some(f=>f.field==="location"&&f.structuredValue==="Genève"));assert.ok(facts.some(f=>f.field==="startDate"&&f.structuredValue==="Septembre 2021"));assert.ok(facts.some(f=>f.field==="endDate"&&f.structuredValue==="Avril 2025"));assert.ok(facts.some(f=>f.field==="metric"&&f.structuredValue==="25 %"));assert.ok(facts.some(f=>f.field==="metric"&&f.structuredValue==="120 collaborateurs"));assert.ok(facts.some(f=>f.category==="SKILL"&&f.structuredValue==="5S"));assert.ok(facts.some(f=>f.category==="SKILL"&&f.structuredValue==="SMED"));assert.ok(facts.some(f=>f.category==="EDUCATION"));assert.ok(facts.some(f=>f.category==="LANGUAGE"));assert.ok(!facts.some(f=>/^(EXPÉRIENCE PROFESSIONNELLE|FORMATION|LANGUES)$/.test(f.canonical)));assert.ok(!facts.some(f=>f.structuredValue==="Entreprise inventée"));assert.ok(facts.filter(f=>f.category==="ACHIEVEMENT"&&f.field==="experienceId").every(f=>f.structuredValue===experience?.entityId));});
test("classe le rattachement multiligne ambigu en NEEDS_CONFIRMATION",()=>{const facts=extract("a","EXPÉRIENCES\nResponsable méthodes\nLausanne – 2020 – 2023");assert.ok(facts.length);assert.ok(facts.every(f=>f.status==="NEEDS_CONFIRMATION"));assert.ok(!facts.some(f=>f.field==="company"));});
test("consolide deux sources et ne confond pas deux expériences",()=>{const duplicate=consolidateFacts([...extract("a"),...extract("b")]);assert.equal(duplicate.find(f=>f.field==="company")?.sources.length,2);const other=extract("c",`PARCOURS
FABRIQUE BETA
Ingénieur méthodes
Vaud • 2018 – 2020`);assert.equal(findContradictions([...duplicate,...other]).length,0);});
test("détecte une vraie contradiction de date pour la même expérience",()=>{const first=extract("a","Fin ATELIER ALPINA : avril 2025"),second=extract("b","Fin ATELIER ALPINA : mai 2025");const contradictions=findContradictions([...first,...second]);assert.equal(contradictions.length,1);assert.equal(contradictions[0]?.field,"endDate");});
