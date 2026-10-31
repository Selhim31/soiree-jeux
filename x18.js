// Jeux Couple & 18+ à moteur dédié : Enchères coquines, Scénario à deux voix, Devine mon fantasme, Le Maître du jeu, Chaud ou Froid.
// Le serveur garde les secrets (mises, fantasme tiré, notes, « ça te tenterait ? ») et n'envoie à chacun que sa vue privée via 'x18me'.
'use strict';
const ECAT=['Progressif','Coquin','Hot','Explicite'],MCAT=['Séduction','Hot','Extrême','Dominant / Soumis','Jeu de rôle'];
const GAMES=['encheres','scenario','fantasme','maitre','chaudfroid'];
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
 function ensure(r){if(!r.x||r.x.game!==r.game){clearTimeout(TM[r.code]);r.x={game:r.game,ph:'lobby',N:r.game==='chaudfroid'?15:10,cat:'Progressif',cats:['Séduction','Hot'],envies:[],hot:[]}}return r.x}
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
 function mTurn(r){const x=r.x;x.ph='play';x.cons=null;x.stops=0;x.msg='';x.okd=0;x.sugg=mSug(r);arm(r,T.maitre,()=>mEnd(r,'⏱️ Temps écoulé'))}
 const mPool=r=>(r.x.cats||MCAT).flatMap(c=>(G(r).levels[c]||[]).map(t=>({t,c})));
 function mSug(r){return shuf(mPool(r)).slice(0,3).map(o=>o.t)}
 function mEnd(r,why){const x=r.x;stopT(r);x.turns=(x.turns||0)+1;x.hist.push({m:x.master,done:x.okd,why});x.master=other(x,x.master);x.ph='between';x.why=why;x.cons=null}
 const cfL=(x,i)=>x.cat&&x.cat!=='Progressif'?x.cat:levelFor(i,x.N);
 function start(r,me,o){const x=ensure(r);const P=on(r);const g=G(r);if(P.length<(g.min||2))return `Il faut au moins ${g.min||2} joueurs connectés.`;if(g.max&&P.length>g.max)return `Ce jeu se joue à ${g.max} exactement : ${P.length} joueurs connectés.`;
  stopT(r);const keep={envies:x.envies||[],hot:x.hot||[],N:x.N,used:x.used,cat:x.cat||'Progressif',cats:x.cats||['Séduction','Hot']};r.x={game:r.game,...keep,P,ph:'',log:[]};const y=r.x;
  if(r.game==='encheres'){if(ECAT.includes(o.cat))y.cat=o.cat;const N=[5,10,15].includes(+o.N)?+o.N:(+x.N||10);y.N=N;y.m=1;y.tok={};y.done={};y.ref={};P.forEach(p=>{y.tok[p]=100;y.done[p]=0;y.ref[p]=0});eDraw(r)}
  if(r.game==='scenario'){const[d,a,b]=pick(r,'Décors').split('|');const o2=shuf(P);Object.assign(y,{decor:d,roles:{[o2[0]]:a,[o2[1]]:b},order:o2,act:1,tour:1,i:0,w:o2[0],story:[{k:'a',act:1}],ph:'write'});sArm(r)}
  if(r.game==='fantasme')fRound(r);
  if(r.game==='maitre'){if(Array.isArray(o.cats)){const c=o.cats.filter(k=>MCAT.includes(k));if(c.length)y.cats=c}if(!y.cats||!y.cats.length)return 'Choisis au moins une catégorie.';y.ph='rules';y.ok={};y.hist=[]}
  if(r.game==='chaudfroid'){if(ECAT.includes(o.cat))y.cat=o.cat;const N=[10,15,20].includes(+o.N)?+o.N:(+x.N||15);y.N=N;y.i=1;const l0=cfL(y,1);y.prop=pick(r,l0);y.pgold=gold(r,l0,y.prop);y.rt={};y.ph='rate';y.res=[]}
  jl(r,'start',me,`${g.name} · ${P.map(p=>nm(r,p)).join(', ')}${y.N&&['encheres','chaudfroid'].includes(r.game)?' · '+y.N+' manches':''}`)}
 function act(r,me,o){if(!r)return 'Pas de salle.';const x=ensure(r);const a=o.a;const isH=r.host===me;
  if(a==='setCat'){if(!isH)return "Seul l'hôte choisit.";if((r.game==='encheres'||r.game==='chaudfroid')&&ECAT.includes(o.cat))x.cat=o.cat;if(r.game==='maitre'&&Array.isArray(o.cats)){const c=o.cats.filter(k=>MCAT.includes(k));if(!c.length)return 'Choisis au moins une catégorie.';x.cats=c}return}
  if(a==='setN'){if(!isH)return "Seul l'hôte choisit.";const v=+o.N;if(r.game==='encheres'&&[5,10,15].includes(v))x.N=v;if(r.game==='chaudfroid'&&[10,15,20].includes(v))x.N=v;return}
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
  if(g==='chaudfroid'){
   if(a==='rate'&&x.ph==='rate'){const v=Math.round(+o.v);if(!(v>=1&&v<=10))return 'Note de 1 à 10.';x.rt[me]=v;if(x.P.every(p=>p in x.rt)){const[A,B]=x.P.map(p=>x.rt[p]);const k=rateK(A,B);x.k=k;x.res.push({t:x.prop,k,n:{...x.rt}});if(k==='fire'&&!x.hot.includes(x.prop))x.hot.push(x.prop);x.ph='reveal';jl(r,'notes',null,`${x.prop} · ${x.P.map(p=>nm(r,p)+'='+x.rt[p]).join(', ')} · ${k}`)}return}
   if(a==='next'&&x.ph==='reveal'){if(x.i>=x.N){x.ph='end';return}x.i++;const l1=cfL(x,x.i);x.prop=pick(r,l1);x.pgold=gold(r,l1,x.prop);x.rt={};x.ph='rate';return}
  }
  return 'Action impossible maintenant.'}
 function pubView(r){const x=ensure(r);const v={game:x.game,ph:x.ph||'lobby',N:x.N,cat:x.cat,cats:x.cats,P:x.P||null,dl:x.dl||null,now:Date.now(),envies:x.envies,hot:x.hot};const g=r.game;
  if(g==='encheres'&&x.P)Object.assign(v,{m:x.m,tok:x.tok,done:x.done,ref:x.ref,dare:x.dare?{t:x.dare.txt||x.dare.t.replaceAll('{q}','le gagnant de l\'enchère'),l:x.dare.l,gold:x.dare.gold}:null,bidders:Object.keys(x.bids||{}),win:x.win,tgt:x.tgt,last:x.ph==='bid'?null:x.last,score:x.score,champ:x.champ,fin:x.fin,sugg:x.ph==='final'?x.sugg:null});
  if(g==='scenario'&&x.P)Object.assign(v,{decor:x.decor,roles:x.roles,act:x.act,tour:x.tour,w:x.w,story:x.story,count:(x.story||[]).filter(s=>s.k==='s').length});
  if(g==='fantasme'&&x.P)Object.assign(v,{round:x.round,holder:x.holder,guesser:x.guesser,theme:x.theme,qs:x.qs,guess:x.guess,found:x.found,winner:x.winner,gage:x.gage,card:['tente','res'].includes(x.ph)?x.card:null,tented:Object.keys(x.tente||{}),mutual:x.ph==='res'?x.mutual:null});
  if(g==='maitre'&&x.P)Object.assign(v,{ok:x.ok?Object.keys(x.ok):[],master:x.master,cons:x.cons,stops:x.stops||0,msg:x.msg||'',okd:x.okd||0,why:x.why||'',turns:x.turns||0,hist:x.hist||[]});
  if(g==='chaudfroid'&&x.P)Object.assign(v,{i:x.i,prop:x.prop,pgold:x.pgold,rated:Object.keys(x.rt||{}),rt:x.ph==='reveal'?x.rt:null,k:x.ph==='reveal'?x.k:null,res:x.res});
  return v}
 function priv(r,id){const x=r.x;if(!x||!x.P||!x.P.includes(id))return null;const o={me:id};
  if(r.game==='encheres')o.bid=x.bids&&id in x.bids?x.bids[id]:null;
  if(r.game==='fantasme'){if(id===x.holder&&x.card)o.card=x.card;if(id===x.holder&&x.opts)o.opts=x.opts;o.tente=x.tente&&id in x.tente?x.tente[id]:null}
  if(r.game==='maitre'&&x.ph==='play'&&id===x.master)o.sugg=x.sugg;
  if(r.game==='chaudfroid')o.rate=x.rt&&id in x.rt?x.rt[id]:null;return o}
 function privAll(r){if(!r.x||!r.x.P)return;for(const p of r.players)X.io.to('p:'+p.id).emit('x18me',priv(r,p.id))}
 return {act,pubView,priv,privAll,ensure,GAMES};
};
module.exports.GAMES=GAMES;module.exports.rateK=rateK;module.exports.levelFor=levelFor;
