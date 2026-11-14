'use strict';
// a42 — Sauvegarde gratuite de l'état durable (classements de groupe + salles) dans l'onglet « État » du Google Sheet du journal,
// via le même Apps Script (LOG_URL + LOG_TOKEN). Relu au démarrage ; écrit au plus toutes les STATE_EVERY_MS (20 s) après un changement,
// et immédiatement à l'arrêt (redéploiement / mise en veille Render). Le fichier local data/*.json reste le repli si le script ne répond pas.
// Aucune donnée média n'est envoyée ici.
const URL_=process.env.LOG_URL||'',TOKEN=process.env.LOG_TOKEN||'';const ON=!!(URL_&&TOKEN);
const EVERY=Number(process.env.STATE_EVERY_MS)||20000;
let pend=null,busy=false,tm=null,notBefore=0,fails=0,lastOk=0,lastErr='';
async function call(kv,ms){const ac=new AbortController();const t=setTimeout(()=>ac.abort(),ms);try{const r=await fetch(URL_,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:TOKEN,kv}),signal:ac.signal,redirect:'follow'});const j=await r.json().catch(()=>({}));return{ok:r.ok&&!!j.ok,j}}finally{clearTimeout(t)}}
// Renvoie l'objet sauvegardé, ou null (script absent, ancienne version sans onglet État, réseau…).
async function load(key){if(!ON)return null;try{const{ok,j}=await call({op:'get',key},15000);if(!ok||typeof j.value!=='string'||!j.value)return null;return JSON.parse(j.value)}catch(e){lastErr=String(e&&e.message||e);return null}}
function schedule(){if(tm||!pend)return;const wait=Math.max(1000,notBefore-Date.now());tm=setTimeout(()=>{tm=null;push().catch(()=>{})},wait);if(tm.unref)tm.unref()}
function save(key,getter){if(!ON)return;pend={key,getter};schedule()}
async function push(){if(!pend||busy)return;busy=true;const p=pend;pend=null;try{const value=JSON.stringify(p.getter());const{ok,j}=await call({op:'set',key:p.key,value},30000);
  // Une ancienne version du script répond {ok:true,n:0} sans « key » : ce n'est PAS une sauvegarde.
  if(!ok||j.key!==p.key)throw new Error(j&&j.err?String(j.err):'script sans onglet État (redéployer une nouvelle version)');lastOk=Date.now();fails=0;notBefore=Date.now()+EVERY}
 catch(e){lastErr=String(e&&e.message||e);fails++;if(!pend)pend=p;notBefore=Date.now()+Math.min(600000,EVERY*2**Math.min(fails,5))}
 finally{busy=false;schedule()}}
async function flushNow(){if(!ON||!pend)return;if(tm){clearTimeout(tm);tm=null}for(let i=0;i<40&&busy;i++)await new Promise(r=>setTimeout(r,50));notBefore=0;await push().catch(()=>{})}
module.exports={enabled:ON,load,save,flushNow,_st:()=>({pend:!!pend,lastOk,lastErr,fails})};
