import assert from "node:assert/strict";
import test from "node:test";
import { consolidateFacts, findContradictions } from "./truth.js";
import { normalizeDocumentText, parseDocumentBlocks, proposeFacts } from "./proposals.js";
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
test("détecte une vraie contradiction de date pour la même expérience",()=>{const first=extract("a","EXPÉRIENCES\nATELIER ALPINA\nResponsable Lean\nGenève • 2021 – 2024"),second=extract("b","EXPÉRIENCES\nATELIER ALPINA\nResponsable Lean\nGenève • 2021 – 2025");const contradictions=findContradictions([...first,...second]);assert.equal(contradictions.length,1);assert.equal(contradictions[0]?.field,"endDate");});
test("parse les blocs représentatifs avec une classification stricte",()=>{const text=`EXPÉRIENCES
CABLERIES ALPINA SARL
Moselle, Forbach
Responsable Lean
09.2024 – 05.2025

ATELIER BETA
Ingénieur Méthodes Industrialisation | 05.2022 – 09.2024

LANGUES
Anglais : niveau professionnel opérationnel – TOEIC 815
Allemand : niveau scolaire / notions

CHALLENGES
Aligner les démarches d’amélioration continue avec les enjeux du site
Animer les démarches terrain et accompagner les équipes`;
 const blocks=parseDocumentBlocks("doc-a",[{label:"Page 1",text}]),facts=proposeFacts("doc-a","CV fictif.pdf",[{label:"Page 1",text}]);assert.ok(blocks.every(block=>block.documentId==="doc-a"&&block.startLine<=block.endLine));assert.ok(facts.some(f=>f.field==="company"&&f.structuredValue==="CABLERIES ALPINA SARL"));assert.ok(facts.some(f=>f.field==="company"&&f.structuredValue==="ATELIER BETA"));assert.ok(facts.some(f=>f.field==="role"&&f.structuredValue==="Responsable Lean"));assert.ok(facts.some(f=>f.field==="role"&&f.structuredValue==="Ingénieur Méthodes Industrialisation"));assert.ok(facts.some(f=>f.field==="location"&&f.structuredValue==="Moselle, Forbach"));assert.ok(!facts.some(f=>f.field==="location"&&/Responsable|Ingénieur/.test(f.canonical)));const languages=facts.filter(f=>f.category==="LANGUAGE");assert.equal(languages.length,2);assert.ok(languages.some(f=>/^Anglais/.test(f.canonical)));assert.ok(languages.some(f=>/^Allemand/.test(f.canonical)));assert.ok(!facts.some(f=>/Challenges|Aligner les démarches|Animer les démarches terrain/i.test(f.canonical)));assert.ok(!facts.some(f=>f.entityId.startsWith("experience:inconnue-")));});
test("isole les blocs unresolved et interdit leurs contradictions",()=>{const a=extract("doc-a","EXPÉRIENCES\nResponsable méthodes\n2021 – 2022"),b=extract("doc-b","EXPÉRIENCES\nFormateur certifié PCM\n2021 – 2023");const entities=[...new Set([...a,...b].filter(f=>f.category==="EXPERIENCE").map(f=>f.entityId))];assert.equal(entities.length,2);assert.ok(entities.every(id=>id.startsWith("experience:unresolved:")));assert.equal(findContradictions([...a,...b]).length,0);});
test("des formulations de postes proches ne créent pas de contradiction",()=>{const first=extract("a","EXPÉRIENCES\nALPINA SARL\nFormateur indépendant\nParis • 2020 – 2021"),second=extract("b","EXPÉRIENCES\nALPINA SARL\nFormateur certifié PCM\nParis • 2020 – 2021");assert.equal(findContradictions([...first,...second]).length,0);});
