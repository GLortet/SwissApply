export const factStatuses=["PROPOSED","VERIFIED","NEEDS_CONFIRMATION","REJECTED","FORBIDDEN"] as const;
export type FactStatus=typeof factStatuses[number];
export const factCategories=["IDENTITY","PREFERENCES","EXPERIENCE","ACHIEVEMENT","SKILL","EDUCATION","LANGUAGE"] as const;
export type FactCategory=typeof factCategories[number];
export interface SourceRef { documentId:string; name:string; location:string }
export interface FactEvent { at:string; action:"CREATED"|"VERIFIED"|"REJECTED"|"EDITED"|"ARCHIVED"|"MIGRATED"; actor:"extractor"|"mock-extractor"|"gilles"|"system" }
export interface CandidateFact {
  id:string; type:string; category:FactCategory|string; entityId:string; field:string; key:string; canonical:string; structuredValue?:string;
  source:SourceRef; sources:SourceRef[]; confidence:number; status:FactStatus; validatedAt?:string; validUntil?:string;
  allowedAlternatives:string[]; tags:string[]; privateNotes?:string; active:boolean; origin:"AUTOMATIC"|"MANUAL"; history:FactEvent[];
}
export interface Contradiction { key:string; entityId:string; field:string; factIds:string[]; values:string[] }
export interface Claim { text:string; factIds:string[] }
const valueOf=(fact:CandidateFact)=>fact.structuredValue??fact.canonical;
export function consolidateFacts(facts:readonly CandidateFact[]):CandidateFact[]{const result:CandidateFact[]=[];for(const fact of facts){const duplicate=!['REJECTED','FORBIDDEN'].includes(fact.status)?result.find(item=>!['REJECTED','FORBIDDEN'].includes(item.status)&&item.entityId===fact.entityId&&item.field===fact.field&&valueOf(item).toLocaleLowerCase("fr")===valueOf(fact).toLocaleLowerCase("fr")):undefined;if(duplicate){duplicate.sources=[...duplicate.sources,...fact.sources.filter(source=>!duplicate.sources.some(existing=>existing.documentId===source.documentId&&existing.location===source.location))];duplicate.confidence=Math.max(duplicate.confidence,fact.confidence);}else result.push(structuredClone(fact));}return result;}
export function findContradictions(facts:readonly CandidateFact[]):Contradiction[]{const groups=new Map<string,CandidateFact[]>();for(const fact of facts.filter(item=>item.active&&!['REJECTED','FORBIDDEN'].includes(item.status))){const key=`${fact.entityId}:${fact.field}`;groups.set(key,[...(groups.get(key)??[]),fact]);}return [...groups.entries()].flatMap(([key,items])=>{const values=[...new Set(items.map(valueOf))];return values.length>1?[{key,entityId:items[0]!.entityId,field:items[0]!.field,factIds:items.map(item=>item.id),values}]:[]});}
export function decideFact(fact:CandidateFact,action:"verify"|"reject",at=new Date().toISOString()):CandidateFact{if(fact.status==="FORBIDDEN")throw new Error("Un fait interdit ne peut pas être validé.");const status:FactStatus=action==="verify"?"VERIFIED":"REJECTED";return {...fact,status,...(status==="VERIFIED"?{validatedAt:at}:{}),history:[...fact.history,{at,action:status,actor:"gilles"}]};}
export function assertClaimTraceable(claim:Claim,facts:readonly CandidateFact[]):void{if(!claim.factIds.length)throw new Error("NEEDS_USER_INPUT: affirmation sans source.");const byId=new Map(facts.map(fact=>[fact.id,fact]));for(const id of claim.factIds){const fact=byId.get(id);if(!fact||!fact.active||fact.status!=="VERIFIED")throw new Error(`NEEDS_USER_INPUT: fait ${id} absent ou non vérifié.`);}}
