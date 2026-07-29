import mammoth from "mammoth";

export async function extractDocument(buffer:Buffer, extension:"pdf"|"docx"):Promise<{text:string;sections:Array<{label:string;text:string}>}>{
  if(extension === "docx") { const result=await mammoth.extractRawText({buffer}); const text=result.value.trim(); return {text,sections:text.split(/\n{2,}/).filter(Boolean).map((section,index)=>({label:`Section ${index+1}`,text:section}))}; }
  const pdf=await import("pdfjs-dist/legacy/build/pdf.mjs"); const document=await pdf.getDocument({data:new Uint8Array(buffer),useSystemFonts:true}).promise; const sections:Array<{label:string;text:string}>=[];
  for(let page=1; page<=document.numPages; page++){ const content=await (await document.getPage(page)).getTextContent(); const text=content.items.flatMap(item=>"str" in item?[item.str]:[]).join(" ").trim(); sections.push({label:`Page ${page}`,text}); }
  return {text:sections.map(({text})=>text).join("\n\n"),sections};
}
