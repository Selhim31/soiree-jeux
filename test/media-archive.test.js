// node test/media-archive.test.js — archivage Drive : seuls les médias AoV Classique partent ; jamais vo.js / Hot.
'use strict';const assert=require('assert'),fs=require('fs'),http=require('http'),{spawn}=require('child_process'),io=require('socket.io-client');
const w=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 // statique
 const src=fs.readFileSync(__dirname+'/../server.js','utf8');const vi=src.indexOf('function voAdd(');assert(!src.slice(vi,src.indexOf('\n',vi)).includes('archive'),'voAdd must never archive');
 assert.strictEqual((src.match(/J\.archive\(/g)||[]).length,1,'single archive call site (phAdd)');assert(!/require\(['"]\.\/journal/.test(fs.readFileSync(__dirname+'/../vo.js','utf8')),'vo.js independent');
 const media=[],rows=[];const fake=http.createServer((q,r)=>{let b='';q.on('data',c=>b+=c);q.on('end',()=>{const j=JSON.parse(b);assert.strictEqual(j.token,'TOK');if(j.media)media.push(j.media);if(j.rows)rows.push(...j.rows);r.writeHead(200,{'Content-Type':'application/json'});r.end(JSON.stringify({ok:true,id:'x'}))})}).listen(0);
 const PORT=3100+Math.floor(Math.random()*800),U='http://localhost:'+PORT;
 const srv=spawn('node',['server.js'],{cwd:__dirname+'/..',env:{...process.env,PORT,LOG_URL:'http://localhost:'+fake.address().port+'/exec',LOG_TOKEN:'TOK',LOG_EVERY_MS:'1000',GOLD_P:'0'},stdio:'ignore'});await w(1500);
 try{const H=io(U),A=io(U),B=io(U);let st=null;H.onAny((e,x)=>{if(x&&x.players&&x.code)st=x});
  H.emit('create',{name:'Hôte',game:'av',levels:['Classique'],pid:'mH',len:0});for(let i=0;i<40&&!st;i++)await w(50);const code=st.code;
  A.emit('join',{code,name:'Alice',pid:'mA'});B.emit('join',{code,name:'Bob',pid:'mB'});await w(300);H.emit('partner',{id:'mA'});
  const find=async f=>{for(let i=0;i<300;i++){H.emit('next');await w(25);const c=st.card;if(c&&f(c))return c;H.emit('host',{act:'force'});await w(25)}};
  const jpg=t=>Buffer.concat([Buffer.from([0xFF,0xD8,0xFF,0xE0]),Buffer.alloc(2000,t)]);const mp4=t=>Buffer.concat([Buffer.from([0,0,0,0x18]),Buffer.from('ftypisom','latin1'),Buffer.alloc(40000,t)]);
  // Classique public photo + vidéo
  await find(c=>c.photo&&c.target==='mH'&&!c.send);H.emit('photo','data:image/jpeg;base64,'+jpg(1).toString('base64'));await w(150);
  let up=await fetch(`${U}/up/ph/${code}?pid=mH`,{method:'POST',headers:{'Content-Type':'video/mp4'},body:mp4(2)});assert.strictEqual(up.status,200);
  // Hot vue unique photo + vidéo
  H.emit('settings',{levels:['Hot']});await w(150);await find(c=>c.vok&&c.target==='mH'&&(!c.elig||c.elig.includes('mA')));H.emit('sendTo','mA');await w(150);
  const VOJ=jpg(7),VOV=mp4(8);H.emit('vophoto','data:image/jpeg;base64,'+VOJ.toString('base64'));await w(150);
  up=await fetch(`${U}/up/vo/${code}?pid=mH`,{method:'POST',headers:{'Content-Type':'video/mp4'},body:VOV});assert.strictEqual(up.status,200);
  // tentative Classique-type photo sur carte Hot : refusée
  H.emit('photo','data:image/jpeg;base64,'+jpg(9).toString('base64'));await w(150);
  await w(4000);
  assert.strictEqual(media.length,2,'exactly the 2 Classique media archived, got '+media.length);
  for(const m of media){assert.strictEqual(m.game,'av');assert.strictEqual(m.level,'Classique')}
  const all=JSON.stringify(media)+JSON.stringify(rows);for(const b of[VOJ,VOV,jpg(9)])assert(!all.includes(b.toString('base64').slice(0,60)),'vo/Hot media must never be sent');
  assert(media.some(m=>m.mime==='video/mp4')&&media.some(m=>m.mime==='image/jpeg'),'photo + video');
  assert(media.every(m=>m.sender==='Hôte'&&m.room===code),'metadata');
  [H,A,B].forEach(s=>s.close())}finally{srv.kill()}
 fake.close();console.log('✅ media-archive: tous les tests passent (Classique archivés : '+media.length+', vue unique : 0)');process.exit(0)
})().catch(e=>{console.error('❌',e.message);process.exit(1)});
