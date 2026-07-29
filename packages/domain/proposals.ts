import { randomUUID } from "node:crypto";
import type { CandidateFact } from "./truth.js";

export function proposeFacts(documentId:string, name:string, sections:readonly {label:string;text:string}[]):CandidateFact[]{
  return sections.flatMap(section=>section.text.split(/\r?\n/).map(line=>({line:line.trim(),location:section.label}))).filter(({line})=>line.length>=5&&line.length<=300).slice(0,60).map(({line,location})=>{
    const separator=line.indexOf(":"); const label=(separator<0?line.split(/\s+/).slice(0,2).join(" "):line.slice(0,separator)).toLocaleLowerCase("fr").replace(/\W+/g,"-");
    return {id:randomUUID(),category:"DOCUMENT_STATEMENT",key:`statement:${label}`,canonical:line,structuredValue:separator<0?line:line.slice(separator+1).trim(),source:{documentId,name,location},confidence:.65,status:"PROPOSED",allowedAlternatives:[],tags:[],active:true,history:[{at:new Date().toISOString(),action:"CREATED",actor:"mock-extractor"}]};
  });
}
