import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CandidateFact } from "../domain/truth.js";

export const documentTypes = ["CV", "COMPETENCY_FILE", "WORK_CERTIFICATE", "DIPLOMA", "ATTESTATION"] as const;
export type DocumentType = typeof documentTypes[number];
export interface StoredDocument { id:string; originalName:string; type:DocumentType; mimeType:string; importedAt:string; status:"EXTRACTED"; extractedText:string; sections:Array<{label:string;text:string}>; storageName:string }
export interface PrivateData { documents:StoredDocument[]; facts:CandidateFact[] }
export interface Repository { read():Promise<PrivateData>; write(data:PrivateData):Promise<void>; saveOriginal(name:string, contents:Buffer):Promise<void>; deleteOriginal(name:string):Promise<void> }

export class LocalRepository implements Repository {
  constructor(private readonly root = process.env.SWISSAPPLY_STORAGE_DIR ?? path.resolve("storage/private")) {}
  private get database(){ return path.join(this.root, "data.json"); }
  async read():Promise<PrivateData>{ try { return JSON.parse(await readFile(this.database,"utf8")) as PrivateData; } catch(error) { if((error as NodeJS.ErrnoException).code === "ENOENT") return {documents:[],facts:[]}; throw error; } }
  async write(data:PrivateData){ await mkdir(this.root,{recursive:true}); const temporary=`${this.database}.${randomUUID()}.tmp`; await writeFile(temporary,JSON.stringify(data,null,2),{mode:0o600}); await rename(temporary,this.database); }
  async saveOriginal(name:string, contents:Buffer){ await mkdir(path.join(this.root,"originals"),{recursive:true}); await writeFile(path.join(this.root,"originals",path.basename(name)),contents,{mode:0o600}); }
  async deleteOriginal(name:string){ await rm(path.join(this.root,"originals",path.basename(name)),{force:true}); }
}
