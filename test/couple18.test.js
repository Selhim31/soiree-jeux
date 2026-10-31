// node test/couple18.test.js — les 5 jeux Couple & 18+ à moteur dédié : parties complètes simulées, secrets jamais diffusés, journal.
'use strict';const assert=require('assert'),fs=require('fs'),{spawn}=require('child_process'),io=require('socket.io-client');const w=ms=>new Promise(r=>setTimeout(r,ms));
const {rateK,levelFor}=require('../x18');
assert.strictEqual(rateK(8,9),'fire');assert.strictEqual(rateK(9,2),'talk');assert.strictEqual(rateK(1,3),'cold');assert.strictEqual(rateK(6,5),'mid');assert.strictEqual(rateK(7,5),'mid');
assert.deepStrictEqual([1,2,3,4,5,6,7,8,9,10].map(m=>levelFor(m,10)),['Coquin','Coquin','Coquin','Coquin','Hot','Hot','Hot','Explicite','Explicite','Explicite']);
// contenu : comptes, consentement, rien d'interdit
const C=k=>JSON.parse(fs.readFileSync(__dirname+'/../content/'+k+'.json'));const cnt={};
for(const k of['encheres','scenario','fantasme','maitre','chaudfroid']){const d=C(k);assert.strictEqual(d.kind,'x18');assert.strictEqual(d.adult,true,k+' adulte');assert(fs.existsSync(__dirname+'/../public'+d.img),k+' image');cnt[k]={};
 for(const[l,a]of Object.entries(d.levels)){assert.strictEqual(new Set(a).size,a.length,k+'/'+l+' doublon');cnt[k][l]=a.length;for(const t of a){assert(!/mineur|enfant|ado\b|lycéen|sans (son|ton|leur) accord|de force|forcer|étrangl|drogu|inconscient/i.test(t),k+': '+t);if(/envo|vocal|sexto|filme|prends(-toi)? en photo/i.test(t)&&!['Rebondissements','Décors'].includes(l))assert(/accord/i.test(t),'accord manquant : '+t)}}
 for(const[l,a]of Object.entries(d.gold||{}))for(const t of a)assert(d.levels[l].includes(t),'or inconnu '+t)}

// ---------- 3 nouveaux jeux : Le Bluffeur, Miroir miroir, La Roulette du Désir ----------
{const nz2=t=>t.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9 ]+/g,' ').split(/\s+/).filter(w=>w.length>2||/\d/.test(w));
 const jacc=(a,b)=>{const A=new Set(nz2(a)),B=new Set(nz2(b));let x=0;for(const w of A)if(B.has(w))x++;return x/(A.size+B.size-x||1)};
 const near=(a,lab,th)=>{const seen=new Set();for(let i=0;i<a.length;i++){const n=nz2(a[i]).sort().join(' ');assert(!seen.has(n),'doublon '+lab+' : '+a[i]);seen.add(n);for(let j=0;j<i;j++)assert(jacc(a[i],a[j])<th,`quasi-doublon ${lab} : « ${a[i]} » ~ « ${a[j]} »`)}};
 const SOFTBAN=/sexe|sexuel|orgasm|masturb|nu\(e\)|mineur|drogu|humili|insult|de force|forcer|étrangl|sans (son|ton|leur|mon) accord/i;
 const B=C('bluffeur');assert.strictEqual(B.kind,'x18');assert.strictEqual(B.adult,false);assert.strictEqual(B.min,3);assert.strictEqual(B.max,12);assert(fs.existsSync(__dirname+'/../public'+B.img));
 const pairs=['Éloignées','Proches','Très proches'].flatMap(l=>{assert(B.levels[l].length>=50,l);return B.levels[l]});assert(pairs.length>=150,'paires '+pairs.length);
 for(const t of pairs){const q=t.split('|');assert.strictEqual(q.length,2,'paire mal formée : '+t);assert(q[0]!==q[1]&&q.every(x=>x.trim().length>8&&/\?$/.test(x.trim())),'paire : '+t);assert(!SOFTBAN.test(t),'interdit : '+t)}
 near(pairs.map(t=>t.split('|')[0]),'bluffeur',0.85);near(pairs,'bluffeur paires',0.85);assert(B.levels.Gages.length>=30);near(B.levels.Gages,'gages bluffeur',0.85);B.levels.Gages.forEach(t=>assert(!SOFTBAN.test(t),t));
 const M=C('miroir');assert.strictEqual(M.adult,false);assert(fs.existsSync(__dirname+'/../public'+M.img));const MQ=M.levels['Qualités'],MD=M.levels['Défauts'];assert(MQ.length>=60&&MD.length>=50&&MQ.length+MD.length>=150,'miroir '+MQ.length+'+'+MD.length);
 const allM=[...MQ,...MD];assert.strictEqual(new Set(allM.map(t=>nz2(t).join(' '))).size,allM.length,'doublon miroir');allM.forEach(t=>assert(!SOFTBAN.test(t)&&!/idiot|nul\b|moche|gros|stupide|bête/i.test(t),'miroir pas bienveillant : '+t));
 assert(!C('cercle').gold&&!C('bluffeur').gold&&!C('miroir').gold,'or cosmétique');const R=C('roulette');assert(!R.gold);assert.strictEqual(R.adult,true);assert.strictEqual(R.min,2);assert.strictEqual(R.max,2);assert(fs.existsSync(__dirname+'/../public'+R.img));
 const RBAN=/mineur|enfant|\bados?\b|lycé|collég|écoli|\bécole\b|sans (son|ton|leur|mon) accord|de force|forcer|étrangl|drogu|inconscient|douleur|fouet|gifl|humili|insult|sang\b|brûl|bougie|\bcire\b|\bpince(r|s)?\b|mord(s|re) fort|photo|filme|enregistre(?!r rien)|upload|capture/i;
 for(const k of['Zones','Actions','Contraintes']){const a=R.levels[k];assert(a.length>=150,k+' '+a.length);const per={1:0,2:0,3:0,4:0};
  for(const t of a){const m=/^([1-4])\|(.+)$/.exec(t);assert(m,'format palier : '+t);per[m[1]]++;const tx=m[2];assert(!RBAN.test(tx.replace(/sans rien enregistrer|n'enregistre rien|sans enregistrer/g,'')),'roulette interdit : '+tx);if(/envo|sexto|vocal envoy/i.test(tx))assert(/accord/.test(tx),'accord manquant : '+tx)}
  for(const p of[1,2,3,4])assert(per[p]>=150,`${k} palier ${p} : ${per[p]}`);near(a.map(t=>t.slice(2)),'roulette '+k,0.85)}
 cnt.bluffeur={paires:pairs.length,gages:B.levels.Gages.length};cnt.miroir={qualites:MQ.length,defauts:MD.length};cnt.roulette=Object.fromEntries(['Zones','Actions','Contraintes'].map(k=>[k,R.levels[k].length]))}
const tot=(k,ls)=>ls.reduce((s,l)=>s+cnt[k][l],0);
const NEED={encheres:['Coquin','Hot','Explicite'],maitre:['Séduction','Hot','Extrême','Dominant / Soumis','Jeu de rôle'],fantasme:['Lieu','Tenue','Jeu de rôle','Ambiance'],chaudfroid:['Coquin','Hot','Explicite'],scenario:['Décors','Rebondissements']};
for(const[k,ls]of Object.entries(NEED))for(const l of ls)assert(cnt[k][l]>=150,`${k}/${l} : ${cnt[k][l]} < 150`);assert(cnt.encheres.Final>=30&&cnt.fantasme.Gages>=60);
// anti-doublons : identiques après normalisation, ou quasi identiques (Jaccard des mots ≥ 0,85) dans une même catégorie
const nz=t=>t.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\{q\}/g,'').replace(/[^a-z0-9 ]+/g,' ').split(/\s+/).filter(w=>w.length>2);
const all=new Map();for(const k of Object.keys(NEED)){const d=C(k);for(const[l,a]of Object.entries(d.levels)){const ks=a.map(t=>new Set(nz(t)));for(let i=0;i<a.length;i++){const n=[...ks[i]].sort().join(' ');assert(!all.has(n)||all.get(n)===k+'/'+l+'#'+i,'doublon : '+a[i]);all.set(n,k+'/'+l+'#'+i);for(let j=0;j<i;j++){const A=ks[i],B=ks[j];let x=0;for(const w of A)if(B.has(w))x++;const J=x/(A.size+B.size-x);assert(J<0.85,`quasi-doublon ${k}/${l} : « ${a[i]} » ~ « ${a[j]} »`)}}}
 const g=d.gold||{};if(k!=='encheres'){assert(!d.gold,k+' : Carte en Or sans effet de jeu, doit être retirée');continue}for(const l of NEED[k]){const p=(g[l]||[]).length/d.levels[l].length;assert(p>=0.05&&p<=0.12,`${k}/${l} : ${Math.round(p*100)}% d'or`)}}
// rôles explicitement adultes, rien d'interdit
const BAN=/mineur|enfant|\bados?\b|lycé|collégien|écoli|\bécole\b|sans (son|ton|leur|mon) accord|de force|forcer|étrangl|drogu|inconscient|douleur|fouet|gifl|humili|insult|sang\b|brûlure/i;
for(const k of Object.keys(NEED)){const d=C(k);for(const[l,a]of Object.entries(d.levels))for(const t of a){assert(!BAN.test(t),k+' interdit : '+t);if(/professeur|prof\b|élève|étudiant|apprenti/i.test(t))assert(/adulte|major|majeur|entre adultes/i.test(t),'rôle adulte non explicite : '+t)}}
(async()=>{const PORT=3100+Math.floor(Math.random()*800),U='http://localhost:'+PORT;const srv=spawn('node',['server.js'],{cwd:__dirname+'/..',env:{...process.env,PORT,X18_SPEED:'0.02',LOG_URL:'',LOG_TOKEN:''},stdio:['ignore','ignore','inherit']});await w(1500);
 const sent=[];
 async function room(game,n){const S=[];for(let i=0;i<n;i++){const s=io(U,{forceNew:true});s.st=null;s.me=null;s.on('state',x=>{s.st=x;sent.push(JSON.stringify(x))});s.on('x18me',x=>s.me=x);s.on('err2',e=>s.err=e);S.push(s)}await w(300);
  const t=Math.random().toString(36).slice(2,7);S[0].emit('create',{name:'A',game,levels:[],pid:'A'+t});await w(300);for(let i=1;i<n;i++){S[i].emit('join',{code:S[0].st.code,name:'P'+i,pid:'P'+i+t});await w(150)}await w(200);
  S.ids=S.map((s,i)=>i?'P'+i+t:'A'+t);S.by=id=>S[S.ids.indexOf(id)];S.x=()=>S[0].st.x;S.a=async(i,a,o={})=>{(typeof i==='number'?S[i]:S.by(i)).emit('x18',{a,...o});await w(60)};return S}
 const end=S=>S.forEach(s=>s.close());
 try{
  const gm=await (await fetch(U+'/api/games')).json(),fm=await (await fetch(U+'/api/families')).json();const ad=fm.find(f=>f.id==='adulte');
  for(const k of['encheres','scenario','fantasme','maitre','chaudfroid']){const g=gm.find(x=>x.id===k);assert(g&&g.adult&&g.kind==='x18',k);assert(ad.games.includes(k),'famille '+k)}assert(ad.games.length>8);
  // Enchères (3 joueurs, 5 manches)
  {const S=await room('encheres',3);await S.a(1,'start');assert(S[1].err);await S.a(0,'setN',{N:5});await S.a(0,'start',{N:5});let x=S.x();assert.strictEqual(x.N,5);assert.strictEqual(x.m,1);assert.deepStrictEqual(Object.values(x.tok),[100,100,100]);
   let refused=false;for(let m=1;m<=5;m++){x=S.x();assert.strictEqual(x.ph,'bid');assert.strictEqual(x.m,m);await S.a(0,'bid',{v:10});await S.a(1,'bid',{v:500});assert(/Mise/.test(S[1].err));S[1].err=null;
    assert(!('bids' in S[1].st.x)&&!JSON.stringify(S[1].st.x).includes('"bids"'));await S.a(1,'bid',{v:20});x=S.x();assert.strictEqual(x.ph,'bid');assert(!x.last);await S.a(2,'bid',{v:0});x=S.x();assert.strictEqual(x.ph,'pick');assert.strictEqual(x.win,S.ids[1]);
    await S.a(0,'pick',{t:S.ids[2]});assert(S[0].err);S[0].err=null;await S.a(1,'pick',{t:S.ids[2]});x=S.x();assert.strictEqual(x.ph,'do');assert(!x.dare.t.includes('{q}'));
    if(!refused){await S.a(2,'refuse');refused=true}else await S.a(2,'done')}
   x=S.x();assert.strictEqual(x.ph,'final');const t2=x.tok[S.ids[2]];assert(t2>=70&&(t2-70)%20===0,'jetons '+t2);assert.strictEqual(x.tok[S.ids[1]],0);assert.strictEqual(x.done[S.ids[2]],4);assert.strictEqual(x.score[S.ids[2]],t2+80);assert.strictEqual(x.champ,S.ids[2]);
   await S.a(2,'final',{t:'Massage de 5 minutes',to:S.ids[0]});x=S.x();assert.strictEqual(x.ph,'finaldo');await S.a(0,'finish');assert.strictEqual(S.x().ph,'end');end(S)}
  // Scénario : 36 phrases, alternance, minuteur
  {const S=await room('scenario',2);await S.a(0,'start');let x=S.x();assert(x.decor&&x.roles[S.ids[0]]&&x.roles[S.ids[1]]);const seen=[];
   for(let k=0;k<36;k++){x=S.x();if(x.ph!=='write')break;const w0=x.w;const o=S.ids.find(i=>i!==w0);await S.a(o,'write',{t:'triche'});assert(S.by(o).err);S.by(o).err=null;
    if(k===5){await w(90*1000*0.02+300);x=S.x();assert.strictEqual(x.w,w0,'pas de minuteur');assert(!x.dl);assert(!x.story.some(s=>s.skip))}
    await S.a(w0,'write',{t:'Phrase '+k});x=S.x();seen.push(w0);assert(S[1].st.x.story.some(s=>s.t==='Phrase '+k),'phrase visible des deux')}
   x=S.x();assert.strictEqual(x.ph,'end');assert.strictEqual(x.count,36);assert.strictEqual(x.story.filter(s=>s.k==='a').length,3);for(let i=0;i<6;i+=2)assert.notStrictEqual(seen[i],seen[i+1]);end(S)}
  // Devine mon fantasme
  {const S=await room('fantasme',2);await S.a(0,'start');let x=S.x();const H=x.holder,Gs=x.guesser;assert.strictEqual(x.ph,'choose');const op=S.by(H).me.opts;assert.strictEqual(op.length,5);assert(new Set(op.map(o=>o.th)).size>=3,'thèmes mélangés');assert.strictEqual(new Set(op.map(o=>o.t)).size,5);assert(!S.by(Gs).me.opts&&!x.opts);assert(!x.theme);
   await S.a(Gs,'choose',{i:0});assert(S.by(Gs).err);S.by(Gs).err=null;await S.a(H,'choose',{i:2});x=S.x();assert.strictEqual(x.ph,'ask');assert.strictEqual(x.theme,op[2].th);assert.strictEqual(S.by(H).me.card.t,op[2].t);assert(!S.by(Gs).me.card);const secret=op[2].t;
   for(let i=0;i<10;i++){await S.a(Gs,'ask',{q:'Question '+i+' ?'});await S.a(Gs,'ask',{q:'encore ?'});assert(S.by(Gs).err);S.by(Gs).err=null;await S.a(H,'ans',{v:['Oui','Non','Un peu'][i%3]})}
   await S.a(Gs,'ask',{q:'onzième ?'});assert(/Plus de questions/.test(S.by(Gs).err));await S.a(Gs,'guess',{t:'Une plage'});x=S.x();assert.strictEqual(x.ph,'judge');await S.a(H,'judge',{ok:true});x=S.x();assert.strictEqual(x.winner,Gs);assert(x.gage);assert.strictEqual(x.card.t,secret);
   await S.a(H,'tente',{v:true});x=S.x();assert.strictEqual(x.mutual,null);assert(!('tente' in x));await S.a(Gs,'tente',{v:true});x=S.x();assert.strictEqual(x.ph,'res');assert(x.mutual);assert(x.envies.includes(secret));
   await S.a(0,'next');x=S.x();assert.strictEqual(x.holder,Gs);assert.strictEqual(x.round,2);assert.strictEqual(x.ph,'choose');assert.strictEqual(S.by(Gs).me.opts.length,5);end(S)}
  // Le Maître du jeu
  {const S=await room('maitre',2);assert.strictEqual(S.x().dur,10,'durée par défaut');await S.a(1,'setDur',{dur:5});assert(S[1].err);S[1].err=null;await S.a(0,'setDur',{dur:7});assert(/invalide/.test(S[0].err));S[0].err=null;await S.a(0,'setDur',{dur:30});assert.strictEqual(S.x().dur,30);await S.a(0,'setDur',{dur:5});assert.strictEqual(S.x().dur,5);await S.a(1,'setCat',{cats:['Hot']});assert(S[1].err);await S.a(0,'setCat',{cats:[]});assert(/au moins/.test(S[0].err));S[0].err=null;await S.a(0,'setCat',{cats:['Dominant / Soumis','Bidon']});assert.deepStrictEqual(S.x().cats,['Dominant / Soumis']);await S.a(0,'start',{cats:['Dominant / Soumis']});const DS=C('maitre').levels['Dominant / Soumis'];let x=S.x();assert.strictEqual(x.ph,'rules');await S.a(0,'ok');assert.strictEqual(S.x().ph,'rules');await S.a(1,'ok');x=S.x();assert.strictEqual(x.ph,'between');const M=x.master,R=S.ids.find(i=>i!==M);assert.strictEqual(x.dur,5,'durée conservée');
   await S.a(R,'go');assert(S.by(R).err);await S.a(M,'go');x=S.x();assert.strictEqual(x.ph,'play');{const left=x.dl-x.now,exp=5*60*1000*0.02;assert(Math.abs(left-exp)<1500,'compte à rebours '+left+' vs '+exp)}assert(S.by(M).me.sugg.length===3);assert(S.by(M).me.sugg.every(t=>DS.includes(t)));for(let k=0;k<5;k++){await S.a(M,'sugg');assert(S.by(M).me.sugg.every(t=>DS.includes(t)))}assert(!S.by(R).me.sugg);
   await S.a(M,'cons',{t:S.by(M).me.sugg[0]});assert(S.x().cons);await S.a(R,'fait');assert.strictEqual(S.x().okd,1);await S.a(M,'cons',{t:'Consigne perso'});await S.a(M,'stop');assert(S.by(M).err);
   await S.a(R,'stop');x=S.x();assert.strictEqual(x.cons,null);assert.strictEqual(x.msg,'Consigne passée');assert.strictEqual(x.ph,'play');assert.strictEqual(x.okd,1);
   await S.a(R,'stop');x=S.x();assert.strictEqual(x.ph,'between');assert.strictEqual(x.master,R);
   await S.a(R,'go');await w(5*60*1000*0.02+400);x=S.x();assert.strictEqual(x.ph,'between');assert.strictEqual(x.master,M);assert(/Temps/.test(x.why));await S.a(0,'stopgame');assert.strictEqual(S.x().ph,'end');end(S)}
  // Enchères : catégorie fixe
  {const S=await room('encheres',2);await S.a(0,'setCat',{cat:'Hot'});await S.a(0,'setN',{N:5});assert.strictEqual(S.x().cat,'Hot');await S.a(0,'start',{N:5,cat:'Hot'});for(let m=1;m<=5;m++){assert.strictEqual(S.x().dare.l,'Hot');await S.a(0,'bid',{v:1});await S.a(1,'bid',{v:0});await S.a(0,'pick',{t:S.ids[1]});await S.a(1,'done')}assert.strictEqual(S.x().ph,'final');end(S)}
  {const S=await room('encheres',2);await S.a(0,'setCat',{cat:'Explicite'});await S.a(0,'start',{N:5});assert.strictEqual(S.x().dare.l,'Explicite');end(S)}
  // Chaud ou Froid
  {const S=await room('chaudfroid',2);await S.a(0,'setN',{N:10});await S.a(0,'start',{N:10});let x=S.x();assert.strictEqual(x.N,10);const plan=[[8,9],[9,2],[1,3],[6,5],[7,7],[10,1],[2,2],[8,8],[5,5],[9,10]];
   for(const[a,b]of plan){await S.a(0,'rate',{v:a});x=S.x();assert.strictEqual(x.rt,null);assert(!('rt' in S[1].st.x&&S[1].st.x.rt));await S.a(1,'rate',{v:b});x=S.x();assert.strictEqual(x.ph,'reveal');assert.strictEqual(x.k,rateK(a,b));await S.a(1,'next')}
   x=S.x();assert.strictEqual(x.ph,'end');assert.strictEqual(x.hot.length,4);assert.strictEqual(x.res.length,10);end(S)}
  // Garde-fous

  // Le Bluffeur : 3 joueurs, secret de la question, vote, points/gage
  {const S=await room('bluffeur',2);await S.a(0,'start');assert(/au moins 3/.test(S[0].err));end(S)}
  {const S=await room('bluffeur',3);await S.a(1,'setN',{N:5});assert(S[1].err);await S.a(0,'setN',{N:5});assert.strictEqual(S.x().N,5);await S.a(0,'start');let x=S.x();assert.strictEqual(x.ph,'answer');assert.strictEqual(x.lv,'Éloignées');await w(150);
   const qs=S.map(s=>s.me.q);assert(qs.every(Boolean));const maj=qs.find(q=>qs.filter(z=>z===q).length===2);const bi=qs.findIndex(q=>q!==maj);assert(bi>=0,'une seule question différente');
   assert(!JSON.stringify(S[0].st).includes(qs[bi])&&!JSON.stringify(S[0].st).includes(maj),'questions jamais dans l\'état public pendant les réponses');
   for(let i=0;i<3;i++)await S.a(i,'answer',{t:'réponse '+i});x=S.x();assert.strictEqual(x.ph,'debate');assert.strictEqual(x.qa,maj);assert(!x.bl&&!JSON.stringify(x).includes(qs[bi]),'bluffeur caché au débat');
   await S.a(1,'tovote');assert(S[1].err);await S.a(0,'tovote');assert.strictEqual(S.x().ph,'vote');await S.a(0,'vote',{t:S.ids[0]});assert(/autre/.test(S[0].err));
   const B=S.ids[bi];for(let i=0;i<3;i++)await S.a(i,'vote',{t:i===bi?S.ids[(i+1)%3]:B});x=S.x();assert.strictEqual(x.ph,'res');assert.strictEqual(x.bl,B);assert(x.out.caught);assert(x.gage);
   for(let i=0;i<3;i++)assert.strictEqual(x.sc[S.ids[i]],i===bi?0:1);
   for(let m=2;m<=5;m++){await S.a(0,'next');x=S.x();assert.strictEqual(x.m,m);if(m===5)assert.strictEqual(x.lv,'Très proches');await S.a(0,'force');await S.a(0,'tovote');await S.a(0,'force');assert.strictEqual(S.x().ph,'res');if(!S.x().out.caught)assert(S.x().sc[S.x().bl]>=3)}
   await S.a(0,'next');assert.strictEqual(S.x().ph,'end');end(S)}
  // Miroir, miroir : choix secrets, catégories de cartes, portraits
  {const S=await room('miroir',3);await S.a(0,'start');let x=S.x();assert.strictEqual(x.ph,'pick');assert.strictEqual(x.opt.Q.length,12);assert.strictEqual(x.opt.D.length,8);
   const mi=x.mi,ord=x.order;const Q=x.opt.Q,D=x.opt.D;await S.a(0,'sel',{q:Q.slice(0,2),d:D.slice(0,2)});assert(/exactement/.test(S[0].err));
   await S.a(mi,'sel',{q:[Q[0],Q[1],Q[2]],d:[D[0],D[1]]});assert(!JSON.stringify(S[0].st).includes('"sel"'));const ot=S.ids.filter(i=>i!==mi);
   for(const p of ot)await S.a(p,'sel',{q:[Q[0],Q[3],Q[4]],d:[D[1],D[2]]});x=S.x();assert.strictEqual(x.ph,'reveal');assert.strictEqual(x.cards.length,0);assert.strictEqual(x.nc,8);
   const nm=ot.find(p=>p!==S.ids[0]&&p!==mi);if(nm){await S.a(nm,'flip');assert(S.by(nm).err)}for(let i=0;i<8;i++)await S.a(mi,'flip');x=S.x();const K=Object.fromEntries(x.cards.map(c=>[c.t,c.k]));
   assert.strictEqual(K[Q[0]],'accord');assert.strictEqual(K[Q[3]],'angle');assert.strictEqual(K[Q[1]],'secret');assert.strictEqual(K[D[0]],'dur');assert.strictEqual(K[D[1]],'lucide');assert.strictEqual(K[D[2]],'vu');
   await S.a(ot[0],'anec',{t:'La fois où…'});assert.strictEqual(S.x().anec.length,1);assert(S.x().port[mi].angle.includes(Q[3]));
   for(let k=1;k<3;k++){await S.a(0,'next');x=S.x();assert.strictEqual(x.mi,ord[k]);for(const p of S.ids)await S.a(p,'sel',{q:x.opt.Q.slice(0,3),d:x.opt.D.slice(0,2)});for(let i=0;i<20;i++)await S.a(0,'flip')}
   await S.a(0,'next');x=S.x();assert.strictEqual(x.ph,'end');assert.strictEqual(Object.keys(x.port).length,3);end(S)}
  // La Roulette du Désir : 2 exactement, double accord, jackpot à deux, jokers, stop
  {const S=await room('roulette',3);await S.a(0,'start');assert(/2 exactement/.test(S[0].err));end(S)}
  {const S=await room('roulette',2);await S.a(0,'start');let x=S.x();assert.strictEqual(x.ph,'rules');await S.a(0,'spin');assert(S[0].err);await S.a(0,'ok');await S.a(1,'ok');x=S.x();assert.strictEqual(x.ph,'spin');assert.strictEqual(x.pal,1);
   const sp=x.sp,o=S.ids.find(i=>i!==sp);await S.a(o,'spin');assert(S.by(o).err);await S.a(sp,'spin');x=S.x();assert.strictEqual(x.ph,'do');assert.strictEqual(x.res.length,3);
   const lv=k=>C('roulette').levels[k].map(t=>t.slice(2));assert(lv('Zones').includes(x.res[0])&&lv('Actions').includes(x.res[1])&&lv('Contraintes').includes(x.res[2]));
   const r0=x.res[0];await S.a(sp,'joker',{c:0});x=S.x();assert.notStrictEqual(x.res[0],r0);assert.strictEqual(x.jok[sp],2);await S.a(o,'joker',{c:1});assert(S.by(o).err);
   await S.a(sp,'jp');assert(/Brûlant/.test(S.by(sp).err));await S.a(sp,'up');assert.strictEqual(S.x().pal,1);await S.a(o,'up');assert.strictEqual(S.x().pal,2,'double accord');
   await S.a(sp,'fait');x=S.x();assert.strictEqual(x.sp,o);assert.strictEqual(x.ph,'spin');assert.strictEqual(x.spins,1);
   await S.a(o,'up');await S.a(sp,'up');assert.strictEqual(S.x().pal,3);await S.a(o,'up');assert(/Jackpot/.test(S.by(o).err));
   await S.a(o,'jp');assert.strictEqual(S.x().pal,3,'jackpot seul : non');await S.a(sp,'jp');assert.strictEqual(S.x().pal,4,'jackpot à deux');
   await S.a(o,'spin');x=S.x();const p4=k=>C('roulette').levels[k].filter(t=>t[0]==='4').map(t=>t.slice(2));assert(p4('Zones').includes(x.res[0])&&p4('Actions').includes(x.res[1]),'tirage Jackpot');
   await S.a(sp,'stop');x=S.x();assert.strictEqual(x.ph,'spin');assert.strictEqual(x.res,null);assert.strictEqual(x.pal,3,'retour Brûlant après Jackpot');assert.strictEqual(x.stops,1);
   await S.a(o,'down');assert.strictEqual(S.x().pal,2,'baisser = un seul');end(S)}
  {const S=await room('maitre',3);await S.a(0,'start');assert(/2 exactement/.test(S[0].err));end(S)}
  // Journal : les phrases/consignes sont loguées par le serveur (via J.log) — vérification statique du branchement
  const src=fs.readFileSync(__dirname+'/../x18.js','utf8');for(const ev of['phrase','question','proposition','consigne','final','notes'])assert(src.includes(`jl(r,'${ev}'`),'journal '+ev);
  console.log('couple18 OK',JSON.stringify(cnt));
 }finally{srv.kill()}process.exit(0)})().catch(e=>{console.error(e);process.exit(1)});
