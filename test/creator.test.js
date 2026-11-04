// node test/creator.test.js — mode créateur : auth, forçage du prochain tirage uniquement, aucune fuite.
'use strict';const assert=require('assert'),{spawn}=require('child_process'),io=require('socket.io-client'),crypto=require('crypto');const w=ms=>new Promise(r=>setTimeout(r,ms));
const CODE=crypto.randomBytes(12).toString('hex'),PORT=String(4100+Math.floor(Math.random()*500)),U='http://localhost:'+PORT;
const srv=spawn('node',['server.js'],{cwd:__dirname+'/..',env:{...process.env,PORT,CREATOR_CODE:CODE,LOG_URL:''},stdio:['ignore','ignore','inherit']});
const G=JSON.parse(require('fs').readFileSync(__dirname+'/../content/defis.json'));
(async()=>{try{await w(1500);const S=[0,1,2].map(()=>{const s=io(U,{forceNew:true});s.ev=[];s.onAny((e,...a)=>s.ev.push([e,JSON.stringify(a)]));s.on('state',x=>s.st=x);return s});await w(400);
 const t=Date.now().toString(36);S[0].emit('create',{name:'Inès',game:'defis',levels:[Object.keys(G.levels)[0]],pid:'A'+t});await w(400);S[1].emit('join',{code:S[0].st.code,name:'Karim',pid:'B'+t});S[2].emit('join',{code:S[0].st.code,name:'Léa',pid:'C'+t});await w(500);
 const ids=['A'+t,'B'+t,'C'+t],lv=Object.keys(G.levels)[0],pool=G.levels[lv];
 const once=(s,e)=>new Promise(r=>s.once(e,r));
 const nxt=async()=>{const id0=S[0].st.card&&S[0].st.card.id;S[0].emit('reveal');await w(150);S[0].emit('next');for(let k=0;k<30&&(!S[0].st.card||S[0].st.card.id===id0);k++)await w(50);return S[0].st.card};
 const tplOf=c=>pool.find(x=>{const re=new RegExp('^'+x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/\\\{p\\\}|\\\{q\\\}/g,'.+?')+'$');return re.test(c.text)||re.test(c.tpl||'')});
 // 1) mauvais code puis limite d'essais
 S[1].emit('crA',{c:'mauvais'});assert.match(await once(S[1],'crE'),/invalide/);
 for(let i=0;i<4;i++){S[1].emit('crA',{k:'v1.x'+i});await once(S[1],'crE')}S[1].emit('crA',{c:CODE});assert.match(await once(S[1],'crE'),/Trop d'essais/,'limite par session');
 // un socket non authentifié ne peut rien forcer
 S[1].emit('crS',{p:ids[2],c:{g:'defis',l:lv,i:5}});S[1].emit('crG');await w(200);assert(!S[1].ev.some(e=>e[0]==='crP'),'pas de panneau sans code');
 // 2) bon code
 S[0].emit('crA',{c:CODE});const OK=await once(S[0],'crOk');assert(OK.fresh&&/^v1\./.test(OK.k)&&!OK.k.includes(CODE),'jeton signé, pas le code');S[0].emit('crG');const P=await once(S[0],'crP');
 {const z=io(U,{forceNew:true});await w(200);z.emit('crA',{k:OK.k});const o2=await once(z,'crOk');assert(!o2.fresh&&o2.k===OK.k,'jeton accepté après rechargement');const z2=io(U,{forceNew:true});await w(200);z2.emit('crA',{k:OK.k.slice(0,-2)+'xx'});assert.match(await once(z2,'crE'),/invalide/,'jeton modifié refusé');z2.emit('crA',{c:OK.k});await once(z2,'crE');z.emit('crX');await w(100);z.emit('crG');await w(200);z.close();z2.close()}assert(P.cards.length===pool.length&&P.players.length===3,'panneau');assert(P.cards.every(c=>c.g==='defis'&&c.l===lv),'cartes du palier seulement');
 // carte hors palier / texte libre refusés
 S[0].emit('crS',{c:{g:'defis',l:'NOPE',i:0}});let P2=await once(S[0],'crP');assert(!P2.f.c,'hors palier refusé');S[0].emit('crS',{c:{t:'texte libre'}});P2=await once(S[0],'crP');assert(!P2.f.c,'texte libre refusé');
 await nxt();
 // 3) forçage du prochain tirage uniquement
 const I=17%pool.length;S.forEach(s=>s.ev=[]);S[0].emit('crS',{p:ids[2],c:{g:'defis',l:lv,i:I}});await once(S[0],'crP');
 const c1=await nxt();assert.strictEqual(c1.target,ids[2],'joueur forcé');assert.strictEqual(tplOf(c1),pool[I],'carte forcée');
 // aucune fuite : B et C ne reçoivent ni panneau ni trace du forçage avant/pendant
 for(const s of [S[1],S[2]]){assert(!s.ev.some(e=>/^cr/.test(e[0])),'aucun évènement créateur');assert(!s.ev.some(e=>/crS|forc|creator|"f":/.test(e[1])),'aucune trace dans les données')}
 assert.deepStrictEqual(Object.keys(S[1].st.card).sort(),Object.keys(S[0].st.card).sort(),'même forme de carte');
 const c2=await nxt();assert(!(c2.target===ids[2]&&tplOf(c2)===pool[I]),'forçage consommé après 1 tirage');
 // 4) aléatoire sans forçage
 const T=new Set(),C=new Set();for(let k=0;k<14;k++){const c=await nxt();T.add(c.target);C.add(tplOf(c))}assert(T.size>=2&&C.size>=8,'tirage aléatoire : '+T.size+' joueurs, '+C.size+' cartes');
 // 5) forcer seulement le joueur
 S[0].emit('crS',{p:ids[1]});await once(S[0],'crP');assert.strictEqual((await nxt()).target,ids[1]);
 // 6) jeu groupé (Défis = plusieurs jeux mélangés) : carte d'un sous-jeu forcée
 const X=[0,1].map(()=>{const s=io(U,{forceNew:true});s.on('state',x=>s.st=x);return s});await w(300);X[0].emit('create',{name:'H',game:'gdefis',levels:['Classique','Mime'],pid:'GH'+t});await w(400);X[1].emit('join',{code:X[0].st.code,name:'Z',pid:'GZ'+t});await w(300);
 X[0].emit('crA',{c:CODE});await once(X[0],'crOk');X[0].emit('crG');const GP=await once(X[0],'crP');const gs=[...new Set(GP.cards.map(c=>c.g))];assert(GP.multi&&gs.length>=2,'plusieurs sous-jeux : '+gs);
 for(const g0 of gs){const cc=GP.cards.filter(c=>c.g===g0)[3];X[0].emit('crS',{p:'GZ'+t,c:cc});await once(X[0],'crP');const id0=X[0].st.card&&X[0].st.card.id;X[0].emit('reveal');await w(100);X[0].emit('next');for(let k=0;k<30&&(!X[0].st.card||X[0].st.card.id===id0);k++)await w(50);const c=X[0].st.card;assert.strictEqual(c.game,g0,'sous-jeu forcé');assert.strictEqual(c.level,cc.l);if(c.kind!=='circle')assert.strictEqual(c.target,'GZ'+t)}
 X.forEach(s=>s.close());
 // 7) sans CREATOR_CODE : désactivé (vérifié via module)
 const CRm=require('../creator')({G:{},GRP:{},grpMix:()=>null,mapLv:(g,l)=>l,kindOf:()=>'dare'});const sv=process.env.CREATOR_CODE;delete process.env.CREATOR_CODE;const fk={h:{},on(e,f){this.h[e]=f},emit(e,v){this.out=[e,v]}};CRm.attach(fk,()=>null);fk.h.crA('');assert.strictEqual(fk.out[0],'crE','désactivé sans variable');process.env.CREATOR_CODE=sv;
 S.forEach(s=>s.close());console.log('creator ok');srv.kill();process.exit(0)}catch(e){console.error(e);srv.kill();process.exit(1)}})();
