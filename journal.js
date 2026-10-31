'use strict';
// Journal de sécurité → Google Apps Script (LOG_URL + LOG_TOKEN). Désactivé silencieusement si non configuré.
// N'enregistre JAMAIS de fichier média, de base64 ni le contenu des médias « vue unique ».
const URL_=process.env.LOG_URL||'',TOKEN=process.env.LOG_TOKEN||'';
const ON=!!(URL_&&TOKEN);const MAXQ=20000,BATCH=500,EVERY=Number(process.env.LOG_EVERY_MS)||30000;
let q=[],busy=false,fails=0,next=0;
const clean=v=>{if(v===undefined||v===null)return '';let s=typeof v==='string'?v:(()=>{try{return JSON.stringify(v)}catch(e){return String(v)}})();if(/data:[a-z]+\/[a-z0-9.+-]+;base64,/i.test(s)||/^[A-Za-z0-9+/=]{400,}$/.test(s))return '[contenu binaire non journalisé]';return s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').slice(0,2000)};
const ipOf=h=>{const x=h&&(h.headers||{})['x-forwarded-for'];if(x)return String(x).split(',')[0].trim();return (h&&(h.address||h.ip))||''};
function log(ev,o={}){if(!ON)return;try{q.push([new Date().toISOString(),ev,clean(o.room),clean(o.name),clean(o.pid),clean(o.ip),clean(o.game),clean(o.level),clean(o.card),clean(o.detail),clean(o.to),clean(o.type)]);if(q.length>MAXQ)q.splice(0,q.length-MAXQ)}catch(e){}}
async function flush(){if(!ON||busy||!q.length||Date.now()<next)return;busy=true;const rows=q.slice(0,BATCH);try{const ac=new AbortController();const t=setTimeout(()=>ac.abort(),15000);const r=await fetch(URL_,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:TOKEN,rows}),signal:ac.signal,redirect:'follow'});clearTimeout(t);const j=await r.json().catch(()=>({}));if(!r.ok||!j.ok)throw new Error('bad');q.splice(0,rows.length);fails=0;next=0;if(q.length)setImmediate(()=>flush().catch(()=>{}))}catch(e){fails++;next=Date.now()+Math.min(300000,5000*2**Math.min(fails,6))}finally{busy=false}}
if(ON){setInterval(()=>flush().catch(()=>{}),EVERY).unref()}
const flushNow=()=>{next=0;return flush().catch(()=>{})};
// Archivage Drive : UNIQUEMENT les médias AoV Classique (appelé depuis phAdd). Jamais vo.js / Hot / Explicite / Hard.
const MQ=[],MQ_BYTES=60e6,M_MAX=12e6;let mBusy=false,mFails=0,mNext=0;
function archive(m){if(!ON)return false;try{if(!m||!Buffer.isBuffer(m.buf)||m.buf.length>M_MAX)return false;if(m.level!=='Classique'||m.game!=='av')return false;const tot=MQ.reduce((a,x)=>a+x.buf.length,0);if(tot+m.buf.length>MQ_BYTES)return false;MQ.push({...m,tries:0});setImmediate(()=>mflush().catch(()=>{}));return true}catch(e){return false}}
async function mflush(){if(!ON||mBusy||!MQ.length||Date.now()<mNext)return;mBusy=true;const m=MQ[0];try{const ext=/mp4/.test(m.mime)?'mp4':/webm/.test(m.mime)?'webm':/quicktime/.test(m.mime)?'mov':'jpg';const name=`${m.ts.replace(/[:.]/g,'-')}_${m.room}_${String(m.sender||'').replace(/[^\w-]/g,'_').slice(0,20)}.${ext}`;
 const ac=new AbortController();const t=setTimeout(()=>ac.abort(),120000);const r=await fetch(URL_,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:TOKEN,media:{name,mime:m.mime,base64:m.buf.toString('base64'),room:m.room,sender:m.sender,recipient:m.recipient||'',ts:m.ts,type:m.type||'',level:m.level,game:m.game}}),signal:ac.signal,redirect:'follow'});clearTimeout(t);const j=await r.json().catch(()=>({}));if(!r.ok||!j.ok)throw new Error('bad');MQ.shift();mFails=0;mNext=0}
 catch(e){m.tries++;mFails++;if(m.tries>=6)MQ.shift();mNext=Date.now()+Math.min(300000,5000*2**Math.min(mFails,6))}finally{mBusy=false;if(MQ.length)setTimeout(()=>mflush().catch(()=>{}),Math.max(200,mNext-Date.now()))}}
if(ON)setInterval(()=>mflush().catch(()=>{}),EVERY).unref();
module.exports={log,flushNow,ipOf,archive,enabled:ON,_q:()=>q,_mq:()=>MQ};
