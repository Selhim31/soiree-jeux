// Jeux Couple & 18+ à moteur dédié : Enchères coquines, Scénario à deux voix, Devine mon fantasme, Le Maître du jeu, Chaud ou Froid.
// Le serveur garde les secrets (mises, fantasme tiré, notes, « ça te tenterait ? ») et n'envoie à chacun que sa vue privée via 'x18me'.
'use strict';
const ECAT=['Progressif','Coquin','Hot','Explicite'],MCAT=['Séduction','Hot','Extrême','Dominant / Soumis','Jeu de rôle'];
const GAMES=['encheres','scenario','fantasme','maitre','chaudfroid','bluffeur','miroir','roulette'];
const BLV=['Éloignées','Proches','Très proches'],PAL=['','💗 Frisson','🔥 Chaud','🌶️ Brûlant','🎰 Jackpot'],RCR=['Zones','Actions','Contraintes'];
const bLv=(m,N)=>BLV[Math.min(2,Math.floor((m-1)*3/N))];
const SP=()=>Math.max(0.01,Number(process.env.X18_SPEED)||1);
const T={write:90,maitre:180};
const rnd=a=>a[Math.random()*a.length|0],shuf=a=>a.map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
const clip=(s,n)=>String(s==null?'':s).replace(/\s+/g,' ').trim().slice(0,n);
const levelFor=(m,N)=>m<=Math.ceil(N/3)?'Coquin':m<=Math.ceil(2*N/3)?'Hot':'Explicite';
const rateK=(a,b)=>a>=7&&b>=7?'fire':(Math.max(a,b)>=7&&Math.min(a,b)<=4)?'talk':(a<=4&&b<=4)?'cold':'mid';
module.exports=function(X){// X={io,log(r,ev,o),nm(r,id),content(k)}
 const TM={};const nm=(r,id)=>X.nm(r,id);
 const jl=(r,ev,id,detail)=>X.log(r,'x18_'+ev,{name:id?nm(r,id):'',pid:id||'',detail:clip(detail,600),card:''});
 const on=r=>r.players.filter(p=>p.online!==false).map(p=>p.id);
 const G=r=>X.content(r.game);
 const gold=(r,l,t)=>!!((G(r).gold||{})[l]||[]).includes(t);
 function pick(r,l){const x=r.x;x.used=x.used||{};const pool=G(r).levels[l]||[];const u=x.used[l]=x.used[l]||[];let av=pool.filter(t=>!u.includes(t));if(!av.length){u.length=0;av=pool}const t=rnd(av);u.push(t);return t}
 function ensure(r){if(!r.x||r.x.game!==r.game){clearTimeout(TM[r.code]);r.x={game:r.game,ph:'lobby',N:r.game==='chaudfroid'?15:r.game==='bluffeur'?8:10,cat:'Progressif',cats:['Séduction','Hot'],dur:10,envies:[],hot:[]}}return r.x}
 function arm(r,sec,fn){const x=r.x;clearTimeout(TM[r.code]);x.dl=Date.now()+sec*1000*SP();TM[r.code]=setTimeout(()=>{if(r.x===x){fn();X.pub(r)}},sec*1000*SP())}
 const stopT=r=>{clearTimeout(TM[r.code]);if(r.x)r.x.dl=null};
 const other=(x,id)=>x.P.find(p=>p!==id);
 // ---------- Enchères coquines ----------
 function eDraw(r){const x=r.x;const l=x.cat&&x.cat!=='Progressif'?x.cat:levelFor(x.m,x.N);const t=pick(r,l);x.dare={t,l,gold:gold(r,l,t)};x.bids={};x.win=null;x.tgt=null;x.ph='bid';x.last=null}
 function eResolve(r){const x=r.x;const mx=Math.max(...x.P.map(p=>x.bids[p]||0));const top=x.P.filter(p=>(x.bids[p]||0)===mx);const w=rnd(top);x.tok[w]-=mx;x.win=w;x.last={bids:{...x.bids},w,amt:mx,tie:top.length>1};x.ph='pick';jl(r,'bid',w,`Manche ${x.m}/${x.N} · mises ${x.P.map(p=>nm(r,p)+'='+(x.bids[p]||0)).join(', ')} · gagnant ${nm(r,w)}`)}
 function eNext(r){const x=r.x;if(x.m>=x.N){x.ph='final';x.score={};for(const p of x.P)x.score[p]=x.tok[p]+20*(x.done[p]||0);const mx=Math.max(...x.P.map(p=>x.score[p]));x.champ=rnd(x.P.filter(p=>x.score[p]===mx));x.fin=null;x.sugg=shuf(G(r).levels.Final||[]).slice(0,3);return}x.m++;eDraw(r)}
 // ---------- Scénario ----------
 function sAdvance(r){const x=r.x;x.i++;if(x.i>=2){x.i=0;x.tour++;if(x.tour>6){x.tour=1;x.act++;if(x.act>3){x.ph='end';stopT(r);jl(r,'scenario_end',null,`${x.story.filter(s=>s.k==='s').length} phrases`);return}x.story.push({k:'a',act:x.act})}
   if(x.tour===4&&x.i===0&&(x.act===2||Math.random()<.6)){const t=pick(r,'Rebondissements');x.story.push({k:'r',t,gold:gold(r,'Rebondissements',t)})}}
  x.w=x.order[(x.i+x.act-1)%2];sArm(r)}
 function sArm(r){stopT(r)}
 // ---------- Fantasme ----------
 const THEMES=['Lieu','Tenue','Jeu de rôle','Ambiance'];
 function fRound(r){const x=r.x;x.round=(x.round||0)+1;x.holder=x.round===1?rnd(x.P):other(x,x.holder);x.guesser=other(x,x.holder);x.opts=shuf(THEMES.flatMap(th=>[th,th])).slice(0,5).map(th=>{const t=pick(r,th);return{th,t,gold:gold(r,th,t)}});x.theme=null;x.card=null;x.qs=[];x.guess=null;x.found=null;x.tente={};x.ph='choose';x.gage=null;x.winner=null;x.mutual=null}
 // ---------- Maître ----------
 function mTurn(r){const x=r.x;x.ph='play';x.cons=null;x.stops=0;x.msg='';x.okd=0;x.sugg=mSug(r);arm(r,(r.x.dur||10)*60,()=>mEnd(r,'⏱️ Temps écoulé'))}
 const mPool=r=>(r.x.cats||MCAT).flatMap(c=>(G(r).levels[c]||[]).map(t=>({t,c})));
 function mSug(r){return shuf(mPool(r)).slice(0,3).map(o=>o.t)}
 function mEnd(r,why){const x=r.x;stopT(r);x.turns=(x.turns||0)+1;x.hist.push({m:x.master,done:x.okd,why});x.master=other(x,x.master);x.ph='between';x.why=why;x.cons=null}
 const cfL=(x,i)=>x.cat&&x.cat!=='Progressif'?x.cat:levelFor(i,x.N);
 // ---------- Le Bluffeur ----------
 function bRound(r){const x=r.x;const l=bLv(x.m,x.N);const t=pick(r,l);let[a,b]=t.split('|');if(Math.random()<.5)[a,b]=[b,a];Object.assign(x,{lv:l,qa:a,qb:b,bl:rnd(x.P),ans:{},votes:{},ph:'answer',out:null,gage:null})}
 function bResolve(r){const x=r.x;const cnt={};for(const v of Object.values(x.votes))cnt[v]=(cnt[v]||0)+1;const mx=Math.max(0,...Object.values(cnt));const top=Object.keys(cnt).filter(k=>cnt[k]===mx);const caught=mx>0&&top.length===1&&top[0]===x.bl;
  for(const[p,v]of Object.entries(x.votes))if(v===x.bl&&p!==x.bl)x.sc[p]+=1;if(caught)x.gage=pick(r,'Gages');else x.sc[x.bl]+=3;x.out={caught,cnt};x.ph='res';
  jl(r,'bluff',x.bl,`Manche ${x.m}/${x.N} · ${caught?'démasqué':'non démasqué'} · votes ${x.P.map(p=>nm(r,p)+'→'+(x.votes[p]?nm(r,x.votes[p]):'—')).join(', ')}`)}
 // ---------- Miroir, miroir ----------
 function mrRound(r){const x=r.x;x.mi=x.order[x.k];x.opt={Q:shuf(G(r).levels['Qualités']||[]).slice(0,12),D:shuf(G(r).levels['Défauts']||[]).slice(0,8)};x.sel={};x.cards=null;x.fi=0;x.anec=[];x.ph='pick'}
 function mrBuild(r){const x=r.x;const oth=x.P.filter(p=>p!==x.mi);const me=x.sel[x.mi];const items=[...new Set([...me.q,...me.d,...oth.flatMap(p=>[...x.sel[p].q,...x.sel[p].d])])];
  x.cards=shuf(items).map(t=>{const q=x.opt.Q.includes(t);const self=(q?me.q:me.d).includes(t);const by=oth.filter(p=>(q?x.sel[p].q:x.sel[p].d).includes(t));const n=by.length;
   const k=q?(self&&n?'accord':n?'angle':'secret'):(self&&!n?'dur':self?'lucide':'vu');return{t,q,self,n,by,k}});x.ph='reveal';x.fi=0}
 function mrPortrait(r){const x=r.x;const P={};for(const c of x.cards)(P[c.k]=P[c.k]||[]).push(c.t);x.port=x.port||{};x.port[x.mi]=P;jl(r,'miroir',x.mi,Object.entries(P).map(([k,v])=>k+': '+v.join(', ')).join(' · '))}
 // ---------- La Roulette du Désir ----------
 function rDraw(r,c,avoid){const x=r.x;const k=RCR[c];const all=(G(r).levels[k]||[]).map(t=>{const i=t.indexOf('|');return{p:+t.slice(0,i),t:t.slice(i+1)}});const p=x.pal;let pool=all.filter(o=>o.p===p);if(p<4&&p>1&&Math.random()<.3)pool=all.filter(o=>o.p<=p);
  x.ru=x.ru||{};let u=x.ru[k]=x.ru[k]||[];let av=pool.filter(o=>!u.includes(o.t)&&o.t!==avoid);if(!av.length){u=x.ru[k]=[];av=pool.filter(o=>o.t!==avoid)}const o=rnd(av);u.push(o.t);return o.t}
 function rEnd(r,msg){const x=r.x;x.res=null;x.ph='spin';x.up={};if(x.pal===4){x.pal=3;x.jp={}}x.msg=msg}
 function start(r,me,o){const x=ensure(r);const P=on(r);const g=G(r);if(P.length<(g.min||2))return `Il faut au moins ${g.min||2} joueurs connectés.`;if(g.max&&P.length>g.max)return `Ce jeu se joue à ${g.max} exactement : ${P.length} joueurs connectés.`;
  stopT(r);const keep={envies:x.envies||[],hot:x.hot||[],N:x.N,used:x.used,cat:x.cat||'Progressif',cats:x.cats||['Séduction','Hot'],dur:x.dur||10};r.x={game:r.game,...keep,P,ph:'',log:[]};const y=r.x;
  if(r.game==='encheres'){if(ECAT.includes(o.cat))y.cat=o.cat;const N=[5,10,15].includes(+o.N)?+o.N:(+x.N||10);y.N=N;y.m=1;y.tok={};y.done={};y.ref={};P.forEach(p=>{y.tok[p]=100;y.done[p]=0;y.ref[p]=0});eDraw(r)}
  if(r.game==='scenario'){const[d,a,b]=pick(r,'Décors').split('|');const o2=shuf(P);Object.assign(y,{decor:d,roles:{[o2[0]]:a,[o2[1]]:b},order:o2,act:1,tour:1,i:0,w:o2[0],story:[{k:'a',act:1}],ph:'write'});sArm(r)}
  if(r.game==='fantasme')fRound(r);
  if(r.game==='maitre'){if(Array.isArray(o.cats)){const c=o.cats.filter(k=>MCAT.includes(k));if(c.length)y.cats=c}if(!y.cats||!y.cats.length)return 'Choisis au moins une catégorie.';y.ph='rules';y.ok={};y.hist=[]}
  if(r.game==='bluffeur'){const N=[5,8,10].includes(+o.N)?+o.N:([5,8,10].includes(+x.N)?+x.N:8);y.N=N;y.m=1;y.sc={};P.forEach(p=>y.sc[p]=0);bRound(r)}
  if(r.game==='miroir'){y.order=shuf(P);y.k=0;y.port={};mrRound(r)}
  if(r.game==='roulette'){Object.assign(y,{ph:'rules',ok:{},pal:1,sp:rnd(P),jok:Object.fromEntries(P.map(p=>[p,3])),up:{},jp:{},spins:0,res:null,msg:'',stops:0})}
  if(r.game==='chaudfroid'){if(ECAT.includes(o.cat))y.cat=o.cat;const N=[10,15,20].includes(+o.N)?+o.N:(+x.N||15);y.N=N;y.i=1;const l0=cfL(y,1);y.prop=pick(r,l0);y.pgold=gold(r,l0,y.prop);y.rt={};y.ph='rate';y.res=[]}
  jl(r,'start',me,`${g.name} · ${P.map(p=>nm(r,p)).join(', ')}${y.N&&['encheres','chaudfroid'].includes(r.game)?' · '+y.N+' manches':''}`)}
 function act(r,me,o){if(!r)return 'Pas de salle.';const x=ensure(r);const a=o.a;const isH=r.host===me;
  if(a==='setDur'){if(!isH)return "Seul l'hôte choisit.";const d=+o.dur;if(![5,10,15,20,25,30].includes(d))return 'Durée invalide.';x.dur=d;return}
  if(a==='setCat'){if(!isH)return "Seul l'hôte choisit.";if((r.game==='encheres'||r.game==='chaudfroid')&&ECAT.includes(o.cat))x.cat=o.cat;if(r.game==='maitre'&&Array.isArray(o.cats)){const c=o.cats.filter(k=>MCAT.includes(k));if(!c.length)return 'Choisis au moins une catégorie.';x.cats=c}return}
  if(a==='setN'){if(!isH)return "Seul l'hôte choisit.";const v=+o.N;if(r.game==='encheres'&&[5,10,15].includes(v))x.N=v;if(r.game==='chaudfroid'&&[10,15,20].includes(v))x.N=v;if(r.game==='bluffeur'&&[5,8,10].includes(v))x.N=v;return}
  if(a==='start'){if(!isH)return "Seul l'hôte lance la partie.";if(x.ph&&!['lobby','end'].includes(x.ph))return 'Partie déjà en cours.';return start(r,me,o)}
  if(a==='stopgame'){if(!isH)return "Seul l'hôte peut terminer.";stopT(r);if(r.game==='encheres'&&x.P&&!['final','finaldo','end'].includes(x.ph)){x.m=x.N;eNext(r);jl(r,'end',me,'fin anticipée');return}x.ph='end';jl(r,'end',me,'fin demandée par l\'hôte');return}
  if(!x.P||!x.P.includes(me))return "Tu n'es pas dans cette partie.";
  const g=r.game;
  if(g==='encheres'){
   if(a==='bid'&&x.ph==='bid'){const v=Math.floor(+o.v);if(!(v>=0&&v<=x.tok[me]))return `Mise entre 0 et ${x.tok[me]} jetons.`;x.bids[me]=v;if(x.P.every(p=>p in x.bids))eResolve(r);return}
   if(a==='pick'&&x.ph==='pick'){if(me!==x.win)return "C'est le gagnant de l'enchère qui choisit.";if(!x.P.includes(o.t))return 'Joueur inconnu.';x.tgt=o.t;const q=o.t===x.win?nm(r,rnd(x.P.filter(p=>p!==x.win))):nm(r,x.win);x.dare.txt=x.dare.t.replaceAll('{q}',q);x.ph='do';jl(r,'dare',o.t,`Choisi par ${nm(r,x.win)} · ${x.dare.l} · ${x.dare.txt}`);return}
   if(a==='done'&&x.ph==='do'){if(me!==x.tgt&&me!==x.win)return 'Non autorisé.';x.done[x.tgt]++;if(x.dare.gold)x.tok[x.tgt]+=20;x.last={...x.last,res:'ok'};jl(r,'dare_ok',x.tgt,x.dare.txt);eNext(r);return}
   if(a==='refuse'&&x.ph==='do'){if(me!==x.tgt)return 'Seule la personne désignée peut refuser.';x.tok[me]=Math.max(0,x.tok[me]-30);x.ref[me]++;jl(r,'dare_refus',me,x.dare.txt);eNext(r);return}
   if(a==='final'&&x.ph==='final'){if(me!==x.champ)return 'Le gagnant impose le défi final.';const t=clip(o.t,300);if(!t)return 'Écris ou choisis un défi.';if(!x.P.includes(o.to)||o.to===me)return 'Choisis à qui.';x.fin={t,to:o.to};x.ph='finaldo';jl(r,'final',me,`→ ${nm(r,o.to)} : ${t}`);return}
   if(a==='finish'&&x.ph==='finaldo'){x.ph='end';return}
  }
  if(g==='scenario'){
   if(a==='write'&&x.ph==='write'){if(me!==x.w)return "Ce n'est pas ton tour d'écrire.";const t=clip(o.t,300);if(t.length<2)return 'Écris au moins quelques mots.';x.story.push({k:'s',w:me,t,act:x.act});jl(r,'phrase',me,`Acte ${x.act} · tour ${x.tour} · ${t}`);sAdvance(r);return}
  }
  if(g==='fantasme'){
   if(a==='choose'&&x.ph==='choose'){if(me!==x.holder)return "C'est l'autre qui choisit son fantasme.";const c=x.opts[+o.i];if(!c)return 'Choix invalide.';x.card={t:c.t,gold:c.gold};x.theme=c.th;x.opts=null;x.ph='ask';jl(r,'fantasme_choix',me,`Thème ${c.th} · ${c.t}`);return}
   const pend=x.qs&&x.qs.length&&x.qs[x.qs.length-1].a==null;
   if(a==='ask'&&x.ph==='ask'){if(me!==x.guesser)return "C'est l'autre qui devine.";if(pend)return 'Attends la réponse.';if(x.qs.length>=10)return 'Plus de questions : propose ta réponse !';const q=clip(o.q,160);if(q.length<3)return 'Question trop courte.';x.qs.push({q,a:null});jl(r,'question',me,q);return}
   if(a==='ans'&&x.ph==='ask'){if(me!==x.holder)return 'Seul le détenteur du fantasme répond.';if(!pend)return 'Pas de question en attente.';if(!['Oui','Non','Un peu'].includes(o.v))return 'Réponse invalide.';x.qs[x.qs.length-1].a=o.v;return}
   if(a==='guess'&&x.ph==='ask'){if(me!==x.guesser)return 'Non autorisé.';if(pend)return 'Attends la réponse.';const t=clip(o.t,200);if(t.length<2)return 'Écris ta proposition.';x.guess=t;x.ph='judge';jl(r,'proposition',me,t);return}
   if(a==='judge'&&x.ph==='judge'){if(me!==x.holder)return 'Seul le détenteur juge.';x.found=!!o.ok;x.winner=x.found?x.guesser:x.holder;x.gage=pick(r,'Gages');x.ph='tente';jl(r,'verdict',me,`${x.found?'trouvé':'pas trouvé'} · gage pour ${nm(r,other(x,x.winner))}`);return}
   if(a==='tente'&&x.ph==='tente'){x.tente[me]=!!o.v;if(x.P.every(p=>p in x.tente)){x.mutual=x.P.every(p=>x.tente[p]);if(x.mutual&&!x.envies.includes(x.card.t))x.envies.push(x.card.t);x.ph='res';jl(r,'tente',null,x.mutual?'envie commune ajoutée':'pas d\'envie commune')}return}
   if(a==='next'&&x.ph==='res'){fRound(r);return}
  }
  if(g==='maitre'){
   const rec=x.master?other(x,x.master):null;
   if(a==='ok'&&x.ph==='rules'){x.ok[me]=1;if(x.P.every(p=>x.ok[p])){x.master=rnd(x.P);x.ph='between';x.why='';jl(r,'maitre',x.master,'premier Maître (tirage)')}return}
   if(a==='go'&&x.ph==='between'){if(me!==x.master)return "C'est au nouveau Maître de lancer son tour.";mTurn(r);jl(r,'tour',me,'début du tour de Maître');return}
   if(a==='sugg'&&x.ph==='play'){if(me!==x.master)return 'Non autorisé.';x.sugg=mSug(r);return}
   if(a==='cons'&&x.ph==='play'){if(me!==x.master)return 'Seul le Maître donne les consignes.';if(x.cons)return 'Une consigne est déjà en cours.';const t=clip(o.t,200);if(t.length<2)return 'Consigne vide.';x.cons={t,gold:(r.x.cats||MCAT).some(c=>gold(r,c,t))};x.msg='';jl(r,'consigne',me,t);return}
   if(a==='fait'&&x.ph==='play'){if(me!==rec)return 'Non autorisé.';if(!x.cons)return;x.cons=null;x.okd++;x.msg='✅ Consigne réalisée';return}
   if(a==='stop'&&x.ph==='play'){if(me!==rec)return 'Seul celui ou celle qui reçoit les consignes peut arrêter.';x.stops++;jl(r,'stop',me,`stop n°${x.stops}`);if(x.stops>=2){mEnd(r,'🛑 Tour arrêté');return}x.cons=null;x.msg='Consigne passée';return}
  }
  if(g==='bluffeur'){
   if(a==='answer'&&x.ph==='answer'){const t=clip(o.t,120);if(!t)return 'Écris une réponse.';x.ans[me]=t;jl(r,'bluff_rep',me,(me===x.bl?'[Bluffeur] '+x.qb:x.qa)+' → '+t);if(x.P.every(p=>p in x.ans))x.ph='debate';return}
   if(a==='force'){if(!isH)return "Seul l'hôte peut forcer.";if(x.ph==='answer'){x.P.forEach(p=>{if(!(p in x.ans))x.ans[p]='— (pas de réponse)'});x.ph='debate';return}if(x.ph==='vote'){bResolve(r);return}return 'Rien à forcer.'}
   if(a==='tovote'&&x.ph==='debate'){if(!isH)return "C'est l'hôte qui lance le vote.";x.ph='vote';return}
   if(a==='vote'&&x.ph==='vote'){if(!x.P.includes(o.t)||o.t===me)return 'Vote pour un autre joueur.';x.votes[me]=o.t;if(x.P.every(p=>p in x.votes))bResolve(r);return}
   if(a==='next'&&x.ph==='res'){if(!isH)return "C'est l'hôte qui passe à la suite.";if(x.m>=x.N){x.ph='end';jl(r,'end',null,x.P.map(p=>nm(r,p)+'='+x.sc[p]).join(', '));return}x.m++;bRound(r);return}
  }
  if(g==='miroir'){
   if(a==='sel'&&x.ph==='pick'){const q=[...new Set((o.q||[]).map(String))],d=[...new Set((o.d||[]).map(String))];if(q.length!==3||d.length!==2)return 'Choisis exactement 3 qualités et 2 défauts.';if(!q.every(t=>x.opt.Q.includes(t))||!d.every(t=>x.opt.D.includes(t)))return 'Choix invalide.';x.sel[me]={q,d};jl(r,'miroir_choix',me,(me===x.mi?'[au miroir] ':'pour '+nm(r,x.mi)+' : ')+[...q,...d].join(', '));if(x.P.every(p=>x.sel[p]))mrBuild(r);return}
   if(a==='force'&&x.ph==='pick'){if(!isH)return "Seul l'hôte peut forcer.";if(!x.sel[x.mi])return "La personne au miroir doit d'abord choisir.";if(!x.P.some(p=>p!==x.mi&&x.sel[p]))return 'Il faut au moins un autre avis.';x.P=x.P.filter(p=>x.sel[p]);mrBuild(r);return}
   if(a==='flip'&&x.ph==='reveal'){if(me!==x.mi&&!isH)return "C'est la personne au miroir qui retourne les cartes.";if(x.fi<x.cards.length){x.fi++;if(x.fi===x.cards.length)mrPortrait(r)}return}
   if(a==='anec'&&x.ph==='reveal'){if(!x.fi)return 'Retourne d\'abord une carte.';const t=clip(o.t,200);if(t.length<2)return 'Anecdote vide.';x.anec.push({by:me,i:x.fi-1,t});jl(r,'anecdote',me,t);return}
   if(a==='next'&&x.ph==='reveal'){if(x.fi<x.cards.length)return 'Retourne toutes les cartes d\'abord.';if(me!==x.mi&&!isH)return 'Non autorisé.';x.k++;if(x.k>=x.order.length){x.ph='end';return}mrRound(r);return}
  }
  if(g==='roulette'){
   const oth=other(x,me);
   if(a==='ok'&&x.ph==='rules'){x.ok[me]=1;if(x.P.every(p=>x.ok[p]))x.ph='spin';return}
   if(x.ph==='rules')return 'Lisez et acceptez les règles d\'abord.';
   if(a==='spin'&&x.ph==='spin'){if(me!==x.sp)return "C'est à l'autre de lancer la roue.";x.res=[0,1,2].map(c=>rDraw(r,c));x.ph='do';x.msg='';jl(r,'roue',me,`${PAL[x.pal]} · ${x.res.join(' · ')}`);return}
   if(a==='joker'&&x.ph==='do'){if(me!==x.sp)return 'Seul celui ou celle qui a lancé peut relancer une couronne.';const c=+o.c;if(![0,1,2].includes(c))return 'Couronne inconnue.';if(!(x.jok[me]>0))return 'Plus de Joker.';x.jok[me]--;x.res[c]=rDraw(r,c,x.res[c]);x.msg=`🃏 Joker : ${['zone','action','contrainte'][c]} relancée`;return}
   if(a==='fait'&&x.ph==='do'){if(me!==x.sp)return 'Non autorisé.';x.spins++;x.sp=oth;rEnd(r,'✅ Réalisé ! À l\'autre de lancer.');return}
   if(a==='stop'){if(x.ph==='end')return;x.stops++;jl(r,'stop',me,'🛑 stop roulette');if(x.ph==='do')x.sp=other(x,x.sp);rEnd(r,'🛑 Stop : on passe, sans justification. Palier conservé, ou baissez-le d\'un geste.');x.jp={};return}
   if(a==='up'){if(x.pal>=3)return 'Palier maximum. Le 🎰 Jackpot s\'active seulement si vous appuyez tous les deux.';x.up[me]=!x.up[me];if(x.P.every(p=>x.up[p])){x.pal++;x.up={};x.msg=`⬆️ Double accord : palier ${PAL[x.pal]}`;jl(r,'palier',null,PAL[x.pal])}return}
   if(a==='down'){if(x.pal<=1)return 'Déjà au palier le plus doux.';x.pal=x.pal===4?3:x.pal-1;x.up={};x.jp={};x.msg=`⬇️ ${nm(r,me)} a baissé le palier : ${PAL[x.pal]}`;return}
   if(a==='jp'){if(x.pal!==3)return 'Le Jackpot se débloque au palier 🌶️ Brûlant.';if(x.ph!=='spin')return 'Le Jackpot s\'active avant de lancer la roue.';x.jp[me]=!x.jp[me];if(x.P.every(p=>x.jp[p])){x.pal=4;x.jp={};x.msg='🎰 JACKPOT activé par vous deux pour le prochain lancer !';jl(r,'jackpot',null,'activé')}return}
  }
  if(g==='chaudfroid'){
   if(a==='rate'&&x.ph==='rate'){const v=Math.round(+o.v);if(!(v>=1&&v<=10))return 'Note de 1 à 10.';x.rt[me]=v;if(x.P.every(p=>p in x.rt)){const[A,B]=x.P.map(p=>x.rt[p]);const k=rateK(A,B);x.k=k;x.res.push({t:x.prop,k,n:{...x.rt}});if(k==='fire'&&!x.hot.includes(x.prop))x.hot.push(x.prop);x.ph='reveal';jl(r,'notes',null,`${x.prop} · ${x.P.map(p=>nm(r,p)+'='+x.rt[p]).join(', ')} · ${k}`)}return}
   if(a==='next'&&x.ph==='reveal'){if(x.i>=x.N){x.ph='end';return}x.i++;const l1=cfL(x,x.i);x.prop=pick(r,l1);x.pgold=gold(r,l1,x.prop);x.rt={};x.ph='rate';return}
  }
  return 'Action impossible maintenant.'}
 function pubView(r){const x=ensure(r);const v={game:x.game,ph:x.ph||'lobby',N:x.N,cat:x.cat,cats:x.cats,dur:x.dur||10,P:x.P||null,dl:x.dl||null,now:Date.now(),envies:x.envies,hot:x.hot};const g=r.game;
  if(g==='encheres'&&x.P)Object.assign(v,{m:x.m,tok:x.tok,done:x.done,ref:x.ref,dare:x.dare?{t:x.dare.txt||x.dare.t.replaceAll('{q}','le gagnant de l\'enchère'),l:x.dare.l,gold:x.dare.gold}:null,bidders:Object.keys(x.bids||{}),win:x.win,tgt:x.tgt,last:x.ph==='bid'?null:x.last,score:x.score,champ:x.champ,fin:x.fin,sugg:x.ph==='final'?x.sugg:null});
  if(g==='scenario'&&x.P)Object.assign(v,{decor:x.decor,roles:x.roles,act:x.act,tour:x.tour,w:x.w,story:x.story,count:(x.story||[]).filter(s=>s.k==='s').length});
  if(g==='fantasme'&&x.P)Object.assign(v,{round:x.round,holder:x.holder,guesser:x.guesser,theme:x.theme,qs:x.qs,guess:x.guess,found:x.found,winner:x.winner,gage:x.gage,card:['tente','res'].includes(x.ph)?x.card:null,tented:Object.keys(x.tente||{}),mutual:x.ph==='res'?x.mutual:null});
  if(g==='maitre'&&x.P)Object.assign(v,{ok:x.ok?Object.keys(x.ok):[],master:x.master,cons:x.cons,stops:x.stops||0,msg:x.msg||'',okd:x.okd||0,why:x.why||'',turns:x.turns||0,hist:x.hist||[]});
  if(g==='chaudfroid'&&x.P)Object.assign(v,{i:x.i,prop:x.prop,pgold:x.pgold,rated:Object.keys(x.rt||{}),rt:x.ph==='reveal'?x.rt:null,k:x.ph==='reveal'?x.k:null,res:x.res});
  if(g==='bluffeur'&&x.P){const sh=['debate','vote','res','end'].includes(x.ph);Object.assign(v,{m:x.m,lv:x.lv,answered:Object.keys(x.ans||{}),qa:sh?x.qa:null,ans:sh?x.ans:null,voted:Object.keys(x.votes||{}),sc:x.sc});if(x.ph==='res')Object.assign(v,{bl:x.bl,qb:x.qb,votes:x.votes,out:x.out,gage:x.gage})}
  if(g==='miroir'&&x.P)Object.assign(v,{mi:x.mi,k:x.k,nk:(x.order||[]).length,order:x.order,opt:x.opt,picked:Object.keys(x.sel||{}),cards:x.cards?x.cards.slice(0,x.fi):null,nc:x.cards?x.cards.length:0,fi:x.fi,anec:x.anec,port:x.port});
  if(g==='roulette'&&x.P)Object.assign(v,{ok:x.ok?Object.keys(x.ok):[],pal:x.pal,palN:PAL[x.pal],sp:x.sp,res:x.res,jok:x.jok,up:Object.keys(x.up||{}).filter(k=>x.up[k]),jp:Object.keys(x.jp||{}).filter(k=>x.jp[k]),spins:x.spins,msg:x.msg,stops:x.stops});
  return v}
 function priv(r,id){const x=r.x;if(!x||!x.P||!x.P.includes(id))return null;const o={me:id};
  if(r.game==='encheres')o.bid=x.bids&&id in x.bids?x.bids[id]:null;
  if(r.game==='fantasme'){if(id===x.holder&&x.card)o.card=x.card;if(id===x.holder&&x.opts)o.opts=x.opts;o.tente=x.tente&&id in x.tente?x.tente[id]:null}
  if(r.game==='maitre'&&x.ph==='play'&&id===x.master)o.sugg=x.sugg;
  if(r.game==='bluffeur'&&x.qa&&['answer','debate','vote'].includes(x.ph)){o.q=id===x.bl?x.qb:x.qa;o.myAns=x.ans[id]||null;o.vote=x.votes[id]||null}
  if(r.game==='miroir'&&x.sel)o.sel=x.sel[id]||null;
  if(r.game==='chaudfroid')o.rate=x.rt&&id in x.rt?x.rt[id]:null;return o}
 function privAll(r){if(!r.x||!r.x.P)return;for(const p of r.players)X.io.to('p:'+p.id).emit('x18me',priv(r,p.id))}
 return {act,pubView,priv,privAll,ensure,GAMES};
};
module.exports.GAMES=GAMES;module.exports.rateK=rateK;module.exports.levelFor=levelFor;
