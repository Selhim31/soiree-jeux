// Révélations : tests secrets (moteur type Pureté). Chacun coche en secret ; seuls scores / profils / % sont révélés.
'use strict';
const TIERS={redflag:[[10,'🟢 Green Flag'],[25,'🟡 Drapeau jaune'],[45,'🟠 Orange vif'],[70,'🔴 Red Flag'],[101,'🚩 Écarlate']],
 fetard:[[10,'😇 Sage comme une image'],[30,'🍹 Petit joueur'],[55,'🥂 Bon vivant'],[80,'🪩 Fêtard confirmé'],[101,'🌙 Légende de la nuit']],
 jaloux:[[10,'😌 Zen absolu'],[30,'🙂 Un brin possessif'],[55,'👀 Radar activé'],[80,'🔥 Jaloux passionné'],[101,'💚 Monstre aux yeux verts']],
 menteur:[[10,'😇 Honnête comme un ange'],[30,'🤭 Petits arrangements'],[55,'🎭 Comédien doué'],[80,'🦊 Menteur de compétition'],[101,'🤥 Pinocchio en personne']]};
const PROF={aventurier:'🧭 Aventurier·ère',dominant:'👑 Dominant·e',soumis:'🎀 Soumis·e',joueur:'🎲 Joueur·se',sensuel:'🕯️ Sensuel·le',exhib:'✨ Exhibitionniste',voyeur:'👁️ Voyeur·se',romantique:'🌹 Romantique coquin·e'};
const PROMPT={redflag:"Coche en secret ce que tu as déjà fait en couple ou en séduction. Seul ton niveau de drapeau sera révélé.",fetard:"Coche en secret ce que tu as déjà vécu en soirée. Seul ton titre de fêtard sera révélé.",jaloux:"Coche en secret ce qui t'est déjà arrivé… puis devine qui aura le score le plus haut !",menteur:"Coche en secret les mensonges que tu as déjà faits, puis devine le score de chacun.",kink:"🔞 Coche en secret ce qui t'attire (entre adultes consentants). Tes réponses restent privées : seul ton profil est révélé.",compat:"Coche ce que tu aimes. Les réponses de chaque duo sont comparées pour calculer votre compatibilité."};
const tier=(g,pc)=>(TIERS[g].find(t=>pc<=t[0])||TIERS[g][TIERS[g].length-1])[1];
module.exports=function({award,nm,log,rnd,shuf}){
 const IDS=['redflag','fetard','jaloux','menteur','kink','compat'];
 function draw(r,c,gid,pool,used){let av=pool.filter(x=>!used.has(x));if(av.length<10){used.clear();av=pool.slice()}const it=shuf(av).slice(0,10);it.forEach(x=>used.add(x));
  c.items=it.map(x=>x.split('|')[0]);c.secret={cats:it.map(x=>x.split('|')[1]||'')};c.test=gid;c.text=PROMPT[gid];c.opts=null;
  if(gid==='compat'){const P=r.pairs||{};c.duos=Object.keys(P).filter(a=>a<P[a]).map(a=>[a,P[a]])}}
 const clean=(c,v)=>{const T=c.items.length;const k=[...new Set((v&&Array.isArray(v.k)?v.k:[]).map(Number).filter(i=>Number.isInteger(i)&&i>=0&&i<T))];return{k,g:v&&typeof v.g==='string'?v.g:null,est:v&&v.est&&typeof v.est==='object'?v.est:{}}};
 function reveal(r,c){const g=c.test,T=c.items.length,A={};for(const[id,v]of Object.entries(r.ans))A[id]=clean(c,v);const ids=Object.keys(A);r.rv=r.rv||{};const C=r.rv[g]=r.rv[g]||{};
  for(const id of ids){const e=C[id]=C[id]||{k:0,T:0,cats:{}};e.k+=A[id].k.length;e.T+=T;for(const i of A[id].k){const ct=c.secret.cats[i];if(ct)e.cats[ct]=(e.cats[ct]||0)+1}}
  const out=[];c.rv=[];
  if(TIERS[g]){for(const id of ids){const k=A[id].k.length,pc=Math.round(k*100/T),e=C[id],cp=Math.round(e.k*100/e.T);c.rv.push({name:nm(r,id),pc,badge:tier(g,cp),cum:cp});award(r,id,0,'rt_'+g,pc)}
   c.rv.sort((a,b)=>b.pc-a.pc);out.push(c.rv.map(x=>`${x.name} ${x.pc}% → ${x.badge}`).join(' · '))}
  if(g==='jaloux'&&ids.length>1){const mx=Math.max(...ids.map(id=>A[id].k.length));const top=ids.filter(id=>A[id].k.length===mx);const ok=ids.filter(id=>top.includes(A[id].g));ok.forEach(id=>award(r,id,2,'detect'));c.bonus=`👑 Score le plus haut : ${top.map(id=>nm(r,id)).join(', ')} — ${ok.length?'bien vu par '+ok.map(id=>nm(r,id)).join(', ')+' (+2)':'personne ne l\'avait vu venir'}`;out.push(c.bonus)}
  if(g==='menteur'&&ids.length>1){const L=[];for(const t of ids){const real=A[t].k.length;let best=null;for(const id of ids){if(id===t)continue;const e=Number(A[id].est[t]);if(!isFinite(e))continue;const d=Math.abs(e-real);if(!best||d<best.d)best={d,ids:[id]};else if(d===best.d)best.ids.push(id)}if(best){best.ids.forEach(id=>award(r,id,2,'detect'));L.push(`${nm(r,t)} : ${real} — ${best.ids.map(id=>nm(r,id)).join(', ')} au plus près (+2)`)}}c.bonus='🔎 '+L.join(' · ');if(L.length)out.push(c.bonus)}
  if(g==='kink'){c.rv=ids.map(id=>{const e=C[id];const top=Object.entries(e.cats).sort((a,b)=>b[1]-a[1]);const prof=e.k<3||!top.length?'🔍 Curieux·se':PROF[top[0][0]]||'🔍 Curieux·se';const sec=top[1]&&top[1][1]>=2?PROF[top[1][0]]:null;return{name:nm(r,id),badge:prof+(sec?' · tendance '+sec:'')}});out.push(c.rv.map(x=>`${x.name} : ${x.badge}`).join(' · '))}
  if(g==='compat'){const duos=(c.duos&&c.duos.length?c.duos:[]).filter(([a,b])=>A[a]&&A[b]);const pairs=duos.length?duos:[];if(!pairs.length)for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++)pairs.push([ids[i],ids[j]]);
   r.rv.cp=r.rv.cp||{};c.rv=pairs.map(([a,b])=>{const sa=new Set(A[a].k),sb=new Set(A[b].k);let same=0;for(let i=0;i<T;i++)if(sa.has(i)===sb.has(i))same++;const key=[a,b].sort().join('|');const e=r.rv.cp[key]=r.rv.cp[key]||{s:0,T:0};e.s+=same;e.T+=T;return{name:`${nm(r,a)} 💞 ${nm(r,b)}`,a,b,pc:Math.round(same*100/T),cum:Math.round(e.s*100/e.T)}}).sort((x,y)=>y.pc-x.pc);
   if(c.rv.length){const b=c.rv[0];award(r,b.a,3,'sync');award(r,b.b,3,'sync');out.push(c.rv.map(x=>`${x.name} ${x.pc}%${x.cum!==x.pc?' (cumul '+x.cum+'%)':''}`).join(' · ')+` — duo le plus compatible : ${b.name} (+3 chacun)`)}c.rv.forEach(x=>{delete x.a;delete x.b})}
  c.result=out.join('\n');log(r,g==='kink'?ids.map(id=>`${nm(r,id)} : profil révélé`).join(', '):ids.map(id=>`${nm(r,id)} ${A[id].k.length}/${T}`).join(', '))}
 return{IDS,draw,reveal,PROMPT}};
module.exports.TIERS=TIERS;module.exports.PROF=PROF;
