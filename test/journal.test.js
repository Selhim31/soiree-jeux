// node test/journal.test.js — vérifie le journal : lots envoyés, jeton, aucune donnée média/base64, désactivé sans config, pas de blocage si l'URL échoue.
'use strict';const assert=require('assert'),http=require('http'),{spawn}=require('child_process'),io=require('socket.io-client');
const w=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 // faux Apps Script
 const got=[];let fail=true;const fake=http.createServer((q,r)=>{let b='';q.on('data',c=>b+=c);q.on('end',()=>{const j=JSON.parse(b);if(fail){fail=false;r.writeHead(500);return r.end('{}')}assert.strictEqual(j.token,'TOKTEST');got.push(...j.rows);r.writeHead(200,{'Content-Type':'application/json'});r.end(JSON.stringify({ok:true,n:j.rows.length}))})}).listen(0);
 const LP=fake.address().port,PORT=3100+Math.floor(Math.random()*800),U='http://localhost:'+PORT;
 const srv=spawn('node',['server.js'],{cwd:__dirname+'/..',env:{...process.env,PORT,LOG_URL:'http://localhost:'+LP+'/exec',LOG_TOKEN:'TOKTEST',LOG_EVERY_MS:'1000',GOLD_P:'0'},stdio:'ignore'});await w(1500);
 try{
  const o={extraHeaders:{'x-forwarded-for':'203.0.113.7, 10.0.0.1'}};const H=io(U,o),A=io(U),B=io(U);let st=null;H.onAny((e,x)=>{if(x&&x.players&&x.code)st=x});
  H.emit('create',{name:'Hôte',game:'av',levels:['Hot'],pid:'jH'});for(let i=0;i<40&&!st;i++)await w(50);const code=st.code;
  A.emit('join',{code,name:'Alice',pid:'jA'});B.emit('join',{code,name:'Bob',pid:'jB'});await w(300);H.emit('partner',{id:'jA'});
  let c;for(let i=0;i<300;i++){H.emit('next');await w(30);c=st.card;if(c&&c.vok&&c.target==='jH'&&(!c.elig||c.elig.includes('jA')))break;H.emit('host',{act:'force'});await w(30)}
  H.emit('sendTo','jA');await w(150);const jpg=Buffer.concat([Buffer.from([0xFF,0xD8,0xFF,0xE0]),Buffer.alloc(3000,5)]);const b64=jpg.toString('base64');
  H.emit('vophoto','data:image/jpeg;base64,'+b64);await w(200);
  const t0=Date.now();const r1=await fetch(U+'/api/version');assert(Date.now()-t0<1000,'game not slowed');assert.strictEqual(r1.status,200);
  // réponse écrite sur une autre carte
  H.emit('settings',{game:'verite',levels:['Hot']});await w(150);H.emit('next');await w(200);const tg=st.card.target;({jH:H,jA:A,jB:B})[tg].emit('answer','Ma réponse hot secrète');await w(150);
  H.emit('end');await w(6000);
  const ev=got.map(r=>r[1]);
  for(const e of['join','card','media','answer','end'])assert(ev.includes(e),'missing '+e);
  const join=got.find(r=>r[1]==='join'&&r[3]==='Hôte');assert.strictEqual(join[5],'203.0.113.7','X-Forwarded-For respected');
  const med=got.find(r=>r[1]==='media');assert(/vue unique/.test(med[11])&&med[10]==='Alice','media event sender/recipient/type');
  assert(got.some(r=>r[1]==='answer'&&r[9]==='Ma réponse hot secrète'),'written answer logged');
  const all=JSON.stringify(got);assert(!all.includes(b64.slice(0,40))&&!/base64/.test(all),'no media content/base64 in logs');
  assert(fail===false,'first batch failed and was retried');
  [H,A,B].forEach(s=>s.close());
 }finally{srv.kill('SIGTERM')}
 // désactivé sans config
 delete process.env.LOG_URL;delete process.env.LOG_TOKEN;const Jn=require('../journal');assert.strictEqual(Jn.enabled,false);Jn.log('x',{});assert.strictEqual(Jn._q().length,0);
 fake.close();console.log('✅ journal: tous les tests passent ('+got.length+' lignes reçues)');process.exit(0)
})().catch(e=>{console.error('❌',e.message);process.exit(1)});
