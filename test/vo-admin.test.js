// node test/vo-admin.test.js — prouve que les photos « vue unique » ne sont jamais visibles par l'admin.
'use strict';const assert=require('assert'),fs=require('fs'),{spawn}=require('child_process'),io=require('socket.io-client');
const w=ms=>new Promise(r=>setTimeout(r,ms));const PORT=3000+Math.floor(Math.random()*900),U='http://localhost:'+PORT,KEY='k'+Math.random().toString(36).slice(2);
(async()=>{
 // 1) Statique : la route admin ne touche jamais au module VO, et VO n'expose aucune liste.
 const src=fs.readFileSync(__dirname+'/../server.js','utf8');const seg=k=>{const a=src.indexOf(k);return a<0?'':src.slice(a,src.indexOf('\n',a))};const a=src.indexOf("app.get('/admin/photos'");const adm=seg("app.get('/admin/photos'")+seg("app.get('/admin/media/");
 assert(a>0&&!/VO\b|vo\b/.test(adm.replace(/vou?s|avoir|vous/gi,'')),'admin route must not reference VO');
 const VO=require('../vo');assert.deepStrictEqual(Object.keys(VO).sort(),['TTL','count','has','purgeOld','purgeRoom','put','take']);
 assert(!/console\.|fs\./.test(fs.readFileSync(__dirname+'/../vo.js','utf8')),'vo.js must not log or touch disk');
 // 2) Module : lecture unique, destinataire seul, expiration 15 min.
 const jpg=Buffer.from([0xFF,0xD8,0xFF,0xE0,1,2,3]);let id=VO.put('R1','a','b',jpg);
 assert.strictEqual(VO.take(id,'c').status,403);assert.strictEqual(VO.take(id,'b').status,200);assert.strictEqual(VO.take(id,'b').status,410);
 id=VO.put('R1','a','b',jpg);const now=Date.now;Date.now=()=>now()+VO.TTL+1000;VO.purgeOld();Date.now=now;assert(!VO.has(id),'expired');
 id=VO.put('R2','a','b',jpg);VO.purgeRoom('R2');assert(!VO.has(id),'room purge');
 // 3) Intégration : photo vue unique envoyée, absente de /admin/photos, puis lecture unique.
 const srv=spawn('node',['server.js'],{cwd:__dirname+'/..',env:{...process.env,PORT,ADMIN_KEY:KEY},stdio:'ignore'});await w(1500);
 try{const H=io(U),A=io(U),B=io(U);let st=null;H.on('state',s=>st=s);H.on('room',s=>st=s);
  const grab=new Promise(res=>{H.onAny((ev,x)=>{if(x&&x.players&&x.code)st=x;if(st)res()})});
  H.emit('create',{name:'Hôte',game:'av',levels:['Hot'],pid:'pH'});await grab;const code=st.code;
  A.emit('join',{code,name:'Alice',pid:'pA'});B.emit('join',{code,name:'Bob',pid:'pB'});await w(400);H.emit('partner',{id:'pA'});await w(200);
  let c=null;for(let i=0;i<300;i++){H.emit('next');await w(40);c=st.card;if(c&&c.vok&&c.target==='pH'&&(!c.elig||c.elig.includes('pA')))break;H.emit('host',{act:'force'});await w(40)}
  assert(c&&c.vok,'found a Hot send card');H.emit('sendTo','pA');await w(200);
  const big=Buffer.concat([jpg,Buffer.alloc(2000,7)]);H.emit('vophoto','data:image/jpeg;base64,'+big.toString('base64'));await w(300);
  const vid=st.card.vo[0].id;
  const g=await (await fetch(U+'/admin/photos?key='+KEY)).text();assert(!g.includes(vid)&&!g.includes('data:image')&&!g.includes(big.toString('base64').slice(0,40)),'admin gallery must not contain view-once photo');
  assert.strictEqual((await fetch(U+'/admin/photos')).status,403);
  const f=p=>fetch(`${U}/vo/${code}/${vid}?pid=${p}`);
  assert.strictEqual((await f('pB')).status,403);assert.strictEqual((await f('pH')).status,403);assert.strictEqual((await f('zz')).status,403);
  const ok=await f('pA');assert.strictEqual(ok.status,200);assert.strictEqual(Buffer.from(await ok.arrayBuffer()).length,big.length);
  assert.strictEqual((await f('pA')).status,410);
  const g2=await (await fetch(U+'/admin/photos?key='+KEY)).text();assert(!g2.includes(vid));
  assert(!fs.existsSync(__dirname+'/../data/rooms.json')||!fs.readFileSync(__dirname+'/../data/rooms.json','utf8').includes(big.toString('base64').slice(0,40)),'never on disk');
  // Vidéo vue unique
  const clip=Buffer.concat([Buffer.from([0,0,0,0x18]),Buffer.from('ftypisom','latin1'),Buffer.alloc(50000,9)]);
  let up=await fetch(`${U}/up/vo/${code}?pid=pB`,{method:'POST',headers:{'Content-Type':'video/mp4'},body:clip});assert.strictEqual(up.status,400,'non-target cannot upload');
  up=await fetch(`${U}/up/vo/${code}?pid=pH`,{method:'POST',headers:{'Content-Type':'video/mp4'},body:clip});assert.strictEqual(up.status,200,'video upload');await w(300);
  const vv=st.card.vo.find(x=>x.v);assert(vv,'video meta');
  const gv=await (await fetch(U+'/admin/photos?key='+KEY)).text();assert(!gv.includes(vv.id)&&!gv.includes('<video'),'admin must not contain view-once video');
  assert.strictEqual((await fetch(`${U}/admin/media/${code}/${vv.id}?key=${KEY}`)).status,404,'admin media cannot read VO');
  const fv=p=>fetch(`${U}/vo/${code}/${vv.id}?pid=${p}`);assert.strictEqual((await fv('pB')).status,403);assert.strictEqual((await fv('pH')).status,403);
  const okv=await fv('pA');assert.strictEqual(okv.status,200);assert(/^video\/mp4/.test(okv.headers.get('content-type')));assert.strictEqual(Buffer.from(await okv.arrayBuffer()).length,clip.length);assert.strictEqual((await fv('pA')).status,410);
  const bad=await fetch(`${U}/up/vo/${code}?pid=pH`,{method:'POST',headers:{'Content-Type':'video/mp4'},body:Buffer.alloc(1000,3)});assert.strictEqual(bad.status,400,'fake video rejected');
  const huge=await fetch(`${U}/up/vo/${code}?pid=pH`,{method:'POST',headers:{'Content-Type':'video/mp4'},body:Buffer.concat([clip.subarray(0,12),Buffer.alloc(8.7e6)])});assert([400,413].includes(huge.status),'oversize rejected');
  [H,A,B].forEach(s=>s.close());console.log('✅ vo-admin: tous les tests passent');
 }finally{srv.kill()}process.exit(0)})().catch(e=>{console.error('❌',e.message);process.exit(1)});
