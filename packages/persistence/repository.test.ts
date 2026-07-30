import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readdir, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { LocalRepository, SCHEMA_VERSION } from "./repository.js";
test("migre avec sauvegarde, documents conservés et mojibake corrigé",async()=>{const root=await mkdtemp(path.join(tmpdir(),"swissapply-migration-"));try{await mkdir(root,{recursive:true});await writeFile(path.join(root,"data.json"),JSON.stringify({documents:[{id:"doc",originalName:"Dossier de compÃ©tences.docx",type:"COMPETENCY_FILE",mimeType:"x",importedAt:"2026-01-01",status:"EXTRACTED",extractedText:"preuve",sections:[],storageName:"opaque.docx"}],facts:[]}));const data=await new LocalRepository(root).read();assert.equal(data.schemaVersion,SCHEMA_VERSION);assert.deepEqual(data.analysisCache,[]);assert.equal(data.documents[0]?.originalName,"Dossier de compétences.docx");assert.ok((await readdir(root)).some(name=>name.includes("backup-v1")));}finally{await rm(root,{recursive:true,force:true})}});
