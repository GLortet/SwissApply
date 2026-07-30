import type { CandidateFact } from "../domain/truth.js";
import { parseDocumentBlocks, proposeFacts } from "../domain/proposals.js";

export type AnalysisMode="deterministic"|"ai";
export interface AnalysisDocument { id:string; name:string; sections:readonly {label:string;text:string}[] }
export interface TokenUsage { input:number; output:number }
export interface AnalysisResult { facts:CandidateFact[]; blocksDetected:number; method:"DETERMINISTIC"|"OPENAI"; model?:string; promptVersion:string; usage?:TokenUsage }
export interface DocumentAnalyzer { readonly mode:AnalysisMode; analyze(document:AnalysisDocument):Promise<AnalysisResult> }
export class DeterministicAnalyzer implements DocumentAnalyzer {readonly mode="deterministic" as const;async analyze(document:AnalysisDocument):Promise<AnalysisResult>{return {facts:proposeFacts(document.id,document.name,document.sections),blocksDetected:parseDocumentBlocks(document.id,document.sections).length,method:"DETERMINISTIC",promptVersion:"deterministic-v2"};}}
