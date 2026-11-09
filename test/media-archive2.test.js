// node test/media-archive2.test.js — a41 : archivage étendu aux Défis Fun non intimes ; jamais Coquin/Explicite/18+, jamais carte intime ; échec visible si le script n'archive pas.
'use strict';const assert=require('assert'),fs=require('fs'),http=require('http'),{spawn}=require('child_process'),io=require('socket.io-client');const w=ms=>new Promise(r=>setTimeout(r,ms));
const INTIM=/sous-v[eê]t|lingerie|culotte|string|soutien|caleçon|boxer|\bnue?s?\b|torse|d[ée]shabill|strip|sexy|sensuel|coquin|lascif|bisou|baiser|embrass|s[ée]duc|drague|flirt|lit\b|douche|bain\b|serviette|peau|corps|fesse|poitrine|intime|érot|sexe|crush|amour|chaud/i,SEND=/envoie|envoyer|écris à|messagerie/i;
async function run(ack){const media=[],rows=[];const fake=http.createServer((q,r)=>{let b='';q.on('data',c=>b+=c);q.on('end',()=>{const j=JSON.parse(b);if(j.media)media.push(j.media);if(j.rows)rows.push(...j.rows);r.writeHead(200,{'Content-Type':'application/json'});r.end(JSON.stringify(j.media?ack:{ok:true,n:(j.rows||[]).length}))})}).listen(0);
 const PORT=3100+Math.floor(Math.random()*800),U='http://localhost:'+PORT,CODE='archtest123';
 const srv=spawn('node',['server.js'],{cwd:__dirname+'/..',env:{...process.env,PORT,LOG_URL:'http://localhost:'+fake.address().port+'/exec',LOG_TOKEN:'TOK',LOG_EVERY_MS:'500',GOLD_P:'0',CREATOR_CODE:CODE},stdio:'ignore'});await w(1500);
 const D=JSON.parse(fs.readFileSync(__dirname+'/../content/defis.json'));const F=D.levels.Fun,nC=D.orig.Fun[0][1];
 const ok=F.findIndex((t,i)=>i<nC&&!INTIM.test(t)&&!SEND.test(t)),bad=F.findIndex(t=>INTIM.test(t)&&!SEND.test(t));assert(ok>=0&&bad>=0);
 const jpg=t=>Buffer.concat([Buffer.from([0xFF,0xD8,0xFF,0xE0]),Buffer.alloc(1500,t)]);const sent=[];
 const S=[io(U,{forceNew:true}),io(U,{forceNew:true})];let st=null,pid;S[0].on('state',x=>st=x);await w(300);
 async function room(game,levels){st=null;pid='aH'+game;S[0].emit('create',{name:'Hôte',game,levels,pid,len:0});for(let i=0;i<40&&!st;i++)await w(50);S[1].emit('join',{code:st.code,name:'Zoé',pid:'aZ'+game});await w(300);S[0].emit('crA',{c:CODE});await w(200)}
 async function nxt(){const id0=st.card&&st.card.id;if(st.card)S[0].emit('reveal');await w(100);S[0].emit('next');for(let k=0;k<40&&(!st.card||st.card.id===id0);k++)await w(25);return st.card}
 async function force(g,l,i){S[0].emit('crS',{p:pid,c:{g,l,i}});await w(150);return nxt()}
 async function shoot(t){const b=jpg(t);sent.push(b);S[0].emit('photo','data:image/jpeg;base64,'+b.toString('base64'));await w(150)}
 try{
  await room('defis',['Fun']);let c=await force('defis','Fun',ok);assert.strictEqual(c.target,pid);assert(c.photo,"Défis Fun non intime : photo autorisée");await shoot(1);
  c=await force('defis','Fun',bad);assert(!c.photo,'carte Défis intime : pas de photo');await shoot(2);
  for(const l of['Coquin','Explicite']){await room('defis',[l]);for(let k=0;k<6;k++){c=await force('defis',l,k*7);assert(!c.photo,'Défis '+l+' : jamais archivable');await shoot(3)}}
  for(const g of['av','hot']){const L=g==='av'?['Coquin','Explicite']:['Coquin','Explicite'];await room(g,L);for(let k=0;k<10;k++){c=await nxt();assert(!c.photo,g+' '+c.level+' : jamais archivable');if(c.target===pid)await shoot(4)}}
  await w(3000);S.forEach(s=>s.close())}finally{srv.kill();fake.close()}
 return{media,rows,sent}}
(async()=>{
 const a=await run({ok:true,id:'drive1'});assert.strictEqual(a.media.length,1,'un seul média archivé, reçu '+a.media.length);assert.deepStrictEqual([a.media[0].game,a.media[0].level],['defis','Classique']);
 const all=JSON.stringify(a.media)+JSON.stringify(a.rows);for(const b of a.sent.slice(1))assert(!all.includes(b.toString('base64').slice(0,80)),'média intime / 18+ jamais envoyé');
 assert(a.rows.some(r=>r[1]==='media_archive_ok'),'archivage confirmé dans le journal');
 // ancien script déployé (sans archivage : répond ok sans id) → échec visible dans le journal, jamais silencieux
 const b=await run({ok:true,n:0});assert.strictEqual(b.media.length,1,'pas de nouvel essai inutile');const f=b.rows.find(r=>r[1]==='media_archive_fail');assert(f,'échec journalisé');assert(!JSON.stringify(b.rows).includes(b.sent[0].toString('base64').slice(0,80)),'la ligne d’échec ne contient pas le média');
 console.log('✅ media-archive2: Défis Fun archivé, intime/Coquin/Explicite jamais, échec journalisé si le script déployé n’archive pas');process.exit(0)
})().catch(e=>{console.error('❌',e.message);process.exit(1)});
