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
const tot=(k,ls)=>ls.reduce((s,l)=>s+cnt[k][l],0);
const NEED={encheres:['Coquin','Hot','Explicite'],maitre:['Séduction','Hot','Extrême','Dominant / Soumis','Jeu de rôle'],fantasme:['Lieu','Tenue','Jeu de rôle','Ambiance'],chaudfroid:['Coquin','Hot','Explicite'],scenario:['Décors','Rebondissements']};
for(const[k,ls]of Object.entries(NEED))for(const l of ls)assert(cnt[k][l]>=150,`${k}/${l} : ${cnt[k][l]} < 150`);assert(cnt.encheres.Final>=30&&cnt.fantasme.Gages>=60);
// anti-doublons : identiques après normalisation, ou quasi identiques (Jaccard des mots ≥ 0,85) dans une même catégorie
const nz=t=>t.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\{q\}/g,'').replace(/[^a-z0-9 ]+/g,' ').split(/\s+/).filter(w=>w.length>2);
const all=new Map();for(const k of Object.keys(NEED)){const d=C(k);for(const[l,a]of Object.entries(d.levels)){const ks=a.map(t=>new Set(nz(t)));for(let i=0;i<a.length;i++){const n=[...ks[i]].sort().join(' ');assert(!all.has(n)||all.get(n)===k+'/'+l+'#'+i,'doublon : '+a[i]);all.set(n,k+'/'+l+'#'+i);for(let j=0;j<i;j++){const A=ks[i],B=ks[j];let x=0;for(const w of A)if(B.has(w))x++;const J=x/(A.size+B.size-x);assert(J<0.85,`quasi-doublon ${k}/${l} : « ${a[i]} » ~ « ${a[j]} »`)}}}
 const g=d.gold||{};for(const l of NEED[k]){if(k==='scenario'&&l==='Décors')continue;const p=(g[l]||[]).length/d.levels[l].length;assert(p>=0.05&&p<=0.12,`${k}/${l} : ${Math.round(p*100)}% d'or`)}}
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
  {const S=await room('maitre',2);await S.a(1,'setCat',{cats:['Hot']});assert(S[1].err);await S.a(0,'setCat',{cats:[]});assert(/au moins/.test(S[0].err));S[0].err=null;await S.a(0,'setCat',{cats:['Dominant / Soumis','Bidon']});assert.deepStrictEqual(S.x().cats,['Dominant / Soumis']);await S.a(0,'start',{cats:['Dominant / Soumis']});const DS=C('maitre').levels['Dominant / Soumis'];let x=S.x();assert.strictEqual(x.ph,'rules');await S.a(0,'ok');assert.strictEqual(S.x().ph,'rules');await S.a(1,'ok');x=S.x();assert.strictEqual(x.ph,'between');const M=x.master,R=S.ids.find(i=>i!==M);
   await S.a(R,'go');assert(S.by(R).err);await S.a(M,'go');x=S.x();assert.strictEqual(x.ph,'play');assert(S.by(M).me.sugg.length===3);assert(S.by(M).me.sugg.every(t=>DS.includes(t)));for(let k=0;k<5;k++){await S.a(M,'sugg');assert(S.by(M).me.sugg.every(t=>DS.includes(t)))}assert(!S.by(R).me.sugg);
   await S.a(M,'cons',{t:S.by(M).me.sugg[0]});assert(S.x().cons);await S.a(R,'fait');assert.strictEqual(S.x().okd,1);await S.a(M,'cons',{t:'Consigne perso'});await S.a(M,'stop');assert(S.by(M).err);
   await S.a(R,'stop');x=S.x();assert.strictEqual(x.cons,null);assert.strictEqual(x.msg,'Consigne passée');assert.strictEqual(x.ph,'play');assert.strictEqual(x.okd,1);
   await S.a(R,'stop');x=S.x();assert.strictEqual(x.ph,'between');assert.strictEqual(x.master,R);
   await S.a(R,'go');await w(180*1000*0.02+400);x=S.x();assert.strictEqual(x.ph,'between');assert.strictEqual(x.master,M);assert(/Temps/.test(x.why));await S.a(0,'stopgame');assert.strictEqual(S.x().ph,'end');end(S)}
  // Enchères : catégorie fixe
  {const S=await room('encheres',2);await S.a(0,'setCat',{cat:'Hot'});await S.a(0,'setN',{N:5});assert.strictEqual(S.x().cat,'Hot');await S.a(0,'start',{N:5,cat:'Hot'});for(let m=1;m<=5;m++){assert.strictEqual(S.x().dare.l,'Hot');await S.a(0,'bid',{v:1});await S.a(1,'bid',{v:0});await S.a(0,'pick',{t:S.ids[1]});await S.a(1,'done')}assert.strictEqual(S.x().ph,'final');end(S)}
  {const S=await room('encheres',2);await S.a(0,'setCat',{cat:'Explicite'});await S.a(0,'start',{N:5});assert.strictEqual(S.x().dare.l,'Explicite');end(S)}
  // Chaud ou Froid
  {const S=await room('chaudfroid',2);await S.a(0,'setN',{N:10});await S.a(0,'start',{N:10});let x=S.x();assert.strictEqual(x.N,10);const plan=[[8,9],[9,2],[1,3],[6,5],[7,7],[10,1],[2,2],[8,8],[5,5],[9,10]];
   for(const[a,b]of plan){await S.a(0,'rate',{v:a});x=S.x();assert.strictEqual(x.rt,null);assert(!('rt' in S[1].st.x&&S[1].st.x.rt));await S.a(1,'rate',{v:b});x=S.x();assert.strictEqual(x.ph,'reveal');assert.strictEqual(x.k,rateK(a,b));await S.a(1,'next')}
   x=S.x();assert.strictEqual(x.ph,'end');assert.strictEqual(x.hot.length,4);assert.strictEqual(x.res.length,10);end(S)}
  // Garde-fous
  {const S=await room('maitre',3);await S.a(0,'start');assert(/2 exactement/.test(S[0].err));end(S)}
  // Journal : les phrases/consignes sont loguées par le serveur (via J.log) — vérification statique du branchement
  const src=fs.readFileSync(__dirname+'/../x18.js','utf8');for(const ev of['phrase','question','proposition','consigne','final','notes'])assert(src.includes(`jl(r,'${ev}'`),'journal '+ev);
  console.log('couple18 OK',JSON.stringify(cnt));
 }finally{srv.kill()}process.exit(0)})().catch(e=>{console.error(e);process.exit(1)});
