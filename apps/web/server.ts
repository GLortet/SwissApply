import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { fictitiousFacts } from "../../packages/domain/fixtures.js";
import { decideFact, findContradictions, type CandidateFact } from "../../packages/domain/truth.js";

let facts: CandidateFact[] = structuredClone(fictitiousFacts);
const json = (res: ServerResponse, status: number, body: unknown) => { res.statusCode = status; res.setHeader("Content-Type", "application/json; charset=utf-8"); res.end(JSON.stringify(body)); };
const readBody = (req: IncomingMessage) => new Promise<string>((resolve) => { let body = ""; req.on("data", (chunk) => body += String(chunk)); req.on("end", () => resolve(body)); });

async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? "/", "http://localhost");
  if (req.method === "GET" && url.pathname === "/api/facts") return json(res, 200, { facts, contradictions: findContradictions(facts) });
  const decision = url.pathname.match(/^\/api\/facts\/([^/]+)\/decision$/);
  if (req.method === "POST" && decision) {
    try {
      const body = JSON.parse(await readBody(req)) as { action?: unknown };
      if (body.action !== "verify" && body.action !== "reject") return json(res, 400, { error: "Action invalide" });
      const index = facts.findIndex((fact) => fact.id === decision[1]);
      if (index < 0) return json(res, 404, { error: "Fait introuvable" });
      facts[index] = decideFact(facts[index]!, body.action);
      return json(res, 200, facts[index]);
    } catch { return json(res, 400, { error: "Corps JSON invalide" }); }
  }
  if (req.method === "GET" && url.pathname === "/") { res.statusCode = 200; res.setHeader("Content-Type", "text/html; charset=utf-8"); return res.end(page); }
  return json(res, 404, { error: "Route inconnue" });
}

const page = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SwissApply — Base de vérité</title><style>
:root{font-family:Inter,system-ui,sans-serif;color:#17211b;background:#f4f6f4}*{box-sizing:border-box}body{margin:0}header{background:#173f35;color:white;padding:1rem max(1rem,calc((100% - 1100px)/2))}header b{font-size:1.25rem}main{max-width:1100px;margin:auto;padding:2rem 1rem}.eyebrow{color:#527267;font-weight:700;text-transform:uppercase;font-size:.75rem;letter-spacing:.08em}h1{font-size:clamp(1.7rem,4vw,2.5rem);margin:.4rem 0}.notice{background:#fff4cf;border-left:4px solid #d39700;padding:1rem;margin:1.5rem 0}.grid{display:grid;grid-template-columns:2fr 1fr;gap:1rem}.panel,.fact{background:white;border:1px solid #dce3df;border-radius:10px;padding:1rem}.facts{display:grid;gap:.75rem}.meta{color:#5d6b65;font-size:.88rem}.status{display:inline-block;padding:.25rem .5rem;border-radius:99px;background:#e8ecea;font-size:.75rem;font-weight:700}.actions{display:flex;gap:.5rem;margin-top:.75rem}button{border:0;border-radius:6px;padding:.6rem .85rem;font-weight:700;cursor:pointer}button.verify{background:#176b51;color:white}button.reject{background:#f0e6e4;color:#7d2920}button:focus{outline:3px solid #f0bd3d;outline-offset:2px}.metric{font-size:1.8rem;font-weight:800}.danger{color:#9c3529}@media(max-width:760px){.grid{grid-template-columns:1fr}main{padding-top:1rem}}</style></head><body>
<header><b>SwissApply</b> <span>· environnement Mock privé</span></header><main><div class="eyebrow">Jalon 1 · Vérité candidat</div><h1>Valider avant d'utiliser</h1><p>Les extractions ci-dessous sont fictives. Aucun fait proposé ne peut alimenter une candidature sans validation humaine.</p><div class="notice" role="status"><b>Couverture du scan non configurée.</b> Aucune source externe n'est interrogée et aucune candidature ne peut être envoyée dans cette version.</div><div class="grid"><section class="panel"><h2>Faits à examiner</h2><div id="facts" class="facts" aria-live="polite">Chargement…</div></section><aside class="panel"><h2>Contradictions</h2><div id="contradictions"></div><hr><div class="eyebrow">Santé</div><p><span class="metric">0</span><br>source surveillée</p><p>Dernier scan : jamais</p></aside></div></main><script>
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function load(){const data=await fetch('/api/facts').then(r=>r.json());document.querySelector('#facts').innerHTML=data.facts.map(f=>'<article class="fact"><span class="status">'+escapeHtml(f.status)+'</span><h3>'+escapeHtml(f.canonical)+'</h3><div class="meta">Source : '+escapeHtml(f.source.name)+' · '+escapeHtml(f.source.location)+' · confiance '+Math.round(f.confidence*100)+' %</div>'+(f.status==='PROPOSED'||f.status==='NEEDS_CONFIRMATION'?'<div class="actions"><button class="verify" onclick="decide(\''+f.id+'\',\'verify\')">Valider</button><button class="reject" onclick="decide(\''+f.id+'\',\'reject\')">Refuser</button></div>':'')+'</article>').join('');document.querySelector('#contradictions').innerHTML=data.contradictions.length?data.contradictions.map(c=>'<p class="danger"><b>À résoudre</b><br>'+c.values.map(escapeHtml).join(' ↔ ')+'</p>').join(''):'<p>Aucune contradiction active.</p>'}
async function decide(id,action){await fetch('/api/facts/'+encodeURIComponent(id)+'/decision',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action})});await load()}load();</script></body></html>`;

const port = Number(process.env.PORT ?? 3000);
createServer(handler).listen(port, "0.0.0.0", () => console.log(`SwissApply Mock: http://localhost:${port}`));
