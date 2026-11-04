// Mode créateur : forçages côté serveur uniquement (jamais dans 'state' ni dans la sauvegarde).
const crypto=require('crypto');
let TH=[];try{TH=require('./themes.json').themes.map(([n,p])=>[n,new RegExp(p)])}catch(e){}
const NRM=t=>String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const thOf=t=>{const x=NRM(t);for(const[n,re]of TH)if(re.test(x))return n;return 'Autre'};
const VG=['jamais','verite','excrush','ecrit','estim','cestun10','qui','ask','connaitre','tupreferes','ouinon','debats','quiz'];
const tyOf=(g,t)=>/^(Action|Défi)\s*:/.test(t)?'Action':/^Vérité\s*:/.test(t)||/\?\s*$/.test(t)||t.includes(' ||| ')||VG.includes(g)?'Vérité':g==='imposteur'?'Autre':'Action';
const META=new Map();const meta=(g,t)=>{const k=g+'\u0001'+t;let m=META.get(k);if(!m){m={th:thOf(t),ty:tyOf(g,t)};META.set(k,m)}return m};
module.exports=({G,GRP,grpMix,mapLv,kindOf})=>{
 const F=new Map();// code salle -> {p,g,l,t}
 const NOCARD=new Set(['purity','rtest','pmu']);
 const key=()=>{const k=process.env.CREATOR_CODE||'';return k.length>=6?k:null};
 const eq=(a,b)=>{const x=crypto.createHash('sha256').update(String(a)).digest(),y=crypto.createHash('sha256').update(String(b)).digest();return crypto.timingSafeEqual(x,y)};
 const tokOf=k=>'v1.'+crypto.createHmac('sha256',k).update('soiree-jeux:createur:v1').digest('base64url');
 // c = code (lien secret) ou k = jeton signé stocké sur le téléphone ; renvoie le jeton si valide
 const ok=o=>{const k=key();if(!k||!o||typeof o!=='object')return null;if(typeof o.c==='string'&&o.c&&eq(o.c,k))return tokOf(k);if(typeof o.k==='string'&&o.k&&eq(o.k,tokOf(k)))return tokOf(k);return null};
 const sets=r=>{const MX=r.mix||(GRP[r.game]?grpMix(r.game,r.levels):null);const S=MX?Object.entries(MX):[[r.game,r.levels]];const o=[];for(const[g,ls]of S){if(!G[g]||NOCARD.has(kindOf(g)))continue;let lv=mapLv(g,ls).filter(l=>G[g].levels[l]);if(!lv.length)lv=[Object.keys(G[g].levels)[0]];for(const l of lv)o.push([g,l])}return o};
 const label=t=>String(t).replace(/\{p\}/g,'[joueur]').replace(/\{q\}/g,'[partenaire]').replace(/\|/g,' / ').replace(/\s+\/\s+\/\s+\//g,' /');
 function panel(r){const cards=[];for(const[g,l]of sets(r))G[g].levels[l].forEach((t,i)=>{const m=meta(g,t);cards.push({g,l,i,s:label(t).slice(0,160),th:m.th,ty:m.ty})});const f=F.get(r.code)||{};return{players:r.players.filter(p=>p.online!==false).map(p=>({id:p.id,name:p.name})),cards,multi:new Set(cards.map(c=>c.g)).size>1,f:{p:f.p||null,c:f.t?{g:f.g,l:f.l,i:G[f.g].levels[f.l].indexOf(f.t)}:null},supported:kindOf(r.game)!=='x18'&&kindOf(r.game)!=='lg'}}
 function attach(so,getR,me){let tries=[],auth=false;const send=()=>{const r=getR();if(auth&&r)so.emit('crP',panel(r))};
  so.on('crA',c=>{const now=Date.now();tries=tries.filter(t=>now-t<10*60e3);if(tries.length>=5)return so.emit('crE','Trop d\'essais, réessaie plus tard.');tries.push(now);const tk=ok(c);if(!tk)return so.emit('crE','Code invalide.');auth=true;tries=[];so.emit('crOk',{k:tk,fresh:!!(c&&c.c)})});
  so.on('crX',()=>{if(!auth)return;auth=false;F.delete((getR()||{}).code)});
  so.on('crG',()=>send());
  so.on('crS',o=>{const r=getR();if(!auth||!r||!o||typeof o!=='object')return;const f={};if(o.p&&r.players.some(p=>p.id===o.p))f.p=String(o.p);if(o.c&&typeof o.c==='object'){const{g,l,i}=o.c;if(sets(r).some(([a,b])=>a===g&&b===l)&&Number.isInteger(i)&&G[g].levels[l][i]!==undefined){f.g=g;f.l=l;f.t=G[g].levels[l][i]}}if(f.p||f.t)F.set(r.code,f);else F.delete(r.code);send()});
  return{isAuth:()=>auth,refresh:send}}
 const take=r=>{const f=F.get(r.code);if(f)F.delete(r.code);return f||null};
 return{attach,take,_F:F}};
