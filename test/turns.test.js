// node test/turns.test.js — a39 : tour de jeu « Au hasard » (sac mélangé), jamais deux fois de suite, déconnexions, forçage créateur, cartes réservées aux couples.
'use strict';const assert=require('assert'),{spawn}=require('child_process'),io=require('socket.io-client');const w=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const PORT=3100+Math.floor(Math.random()*800),U='http://localhost:'+PORT,CODE='testcode123';const srv=spawn('node',['server.js'],{cwd:__dirname+'/..',env:{...process.env,PORT,LOG_URL:'',LOG_TOKEN:'',CREATOR_CODE:CODE},stdio:['ignore','ignore','inherit']});await w(1500);
 const T='t'+Date.now()%1e6;const mk=()=>{const s=io(U,{forceNew:true});s.on('state',x=>s.st=x);return s};
 async function room(game,levels,n){const S=[];for(let i=0;i<n;i++)S.push(mk());await w(300);S[0].emit('create',{name:'P0',game,levels,pid:T+game+0,len:0});for(let k=0;k<40&&!S[0].st;k++)await w(50);for(let i=1;i<n;i++)S[i].emit('join',{code:S[0].st.code,name:'P'+i,pid:T+game+i});await w(500);return S}
 const H=S=>S[0];async function next(S){const h=H(S);const id0=h.st.card&&h.st.card.id;if(h.st.card){h.emit('host',{act:'force'});await w(60)}h.emit('next');for(let k=0;k<60&&(!h.st.card||h.st.card.id===id0);k++)await w(25);return h.st.card}
 try{
 // 1) équité sur 30 cartes, jamais deux fois de suite
 {const S=await room('av',['Fun'],4);const seq=[];for(let i=0;i<30;i++)seq.push((await next(S)).target);
  for(let i=1;i<seq.length;i++)assert.notStrictEqual(seq[i],seq[i-1],'même joueur deux fois de suite');
  for(let r=0;r+4<=seq.length;r+=4)assert.strictEqual(new Set(seq.slice(r,r+4)).size,4,'chaque tour : tout le monde joue une fois '+seq.slice(r,r+4));
  const C={};for(const x of seq)C[x]=(C[x]||0)+1;const v=Object.values(C);assert(v.length===4&&Math.max(...v)-Math.min(...v)<=1,'équité '+JSON.stringify(C));
  // {q} : jamais deux fois de suite quand c'est possible
  // 2) déconnexion / reconnexion
  const off=T+'av3';S[3].close();await w(400);const s2=[];for(let i=0;i<9;i++)s2.push((await next(S)).target);assert(!s2.includes(off),'joueur hors ligne tiré');for(let i=1;i<s2.length;i++)assert.notStrictEqual(s2[i],s2[i-1]);
  const R=mk();await w(200);R.emit('join',{code:S[0].st.code,name:'P3',pid:off});await w(500);const s3=[];for(let i=0;i<8;i++)s3.push((await next(S)).target);assert(s3.includes(off),'joueur reconnecté jamais tiré');R.close();S.forEach(s=>s.close())}
 // 3) forçage créateur : le joueur forcé joue, puis le sac continue
 {const S=await room('av',['Fun'],4);S[0].emit('crA',{c:CODE});await w(300);await next(S);const seq=[];for(let i=0;i<12;i++){if(i===5){S[0].emit('crS',{p:T+'av2'});await w(200)}const c=await next(S);seq.push(c.target);if(i===5)assert.strictEqual(c.target,T+'av2','joueur forcé')}
  const C={};for(const x of seq)C[x]=(C[x]||0)+1;assert(Math.max(...Object.values(C))<=4,'forçage : sac déséquilibré '+JSON.stringify(C));
  // forçage de la personne visée {q}
  for(let k=0;k<3;k++){S[0].emit('crS',{p:T+'av1',q:T+'av3'});await w(200);const c=await next(S);assert.strictEqual(c.target,T+'av1');assert.strictEqual(c.partner,T+'av3','{q} forcé')}
  S[0].emit('crS',{p:T+'av1',q:T+'av1'});await w(200);{const c=await next(S);assert.notStrictEqual(c.partner,T+'av1','{q} = joueur refusé')}
  S.forEach(s=>s.close())}
 // 4) {q} équitable + cartes réservées aux couples : la carte change, pas le joueur
 {const S=await room('av',['Fun'],4);const qs=[];for(let i=0;i<20;i++){const c=await next(S);if(c.partner)qs.push(c.partner)}for(let i=1;i<qs.length;i++)assert.notStrictEqual(qs[i],qs[i-1],'{q} deux fois de suite');S.forEach(s=>s.close())}
 {const S=await room('couple',['Coquin'],4);const id=i=>T+'couple'+i;S[0].emit('partner',{id:id(1)});await w(200);S[2].emit('partner',{id:id(3)});await w(300);assert.strictEqual(Object.keys(S[0].st.pairs||{}).length,4,'couples déclarés');
  const seq=[];for(let i=0;i<16;i++){const c=await next(S);seq.push(c.target);const P={[id(0)]:id(1),[id(1)]:id(0),[id(2)]:id(3),[id(3)]:id(2)};if(c.partner&&c.elig)assert.strictEqual(c.partner,P[c.target],'couple : partenaire autorisé')}
  for(let i=1;i<seq.length;i++)assert.notStrictEqual(seq[i],seq[i-1]);for(let r=0;r+4<=seq.length;r+=4)assert.strictEqual(new Set(seq.slice(r,r+4)).size,4,'couples : le joueur ne change pas');
  S[0].emit('crA',{c:CODE});await w(300);for(let k=0;k<4;k++){S[0].emit('crS',{p:id(0),q:id(2)});await w(200);const c=await next(S);assert.strictEqual(c.target,id(0));if(c.elig)assert.notStrictEqual(c.partner,id(2),'{q} forcé hors couple refusé')}
  // un seul couple + un célibataire : jamais de carte à deux pour le célibataire sans partenaire possible
  S.forEach(s=>s.close())}
 console.log('✅ turns: équité, pas deux fois de suite, déconnexion, forçage créateur, couples OK')}
 catch(e){console.error('❌',e.message);srv.kill();process.exit(1)}srv.kill();process.exit(0)})();
