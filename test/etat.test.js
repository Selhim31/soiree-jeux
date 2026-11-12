// node test/etat.test.js — a42 : les classements de groupe (et les salles) survivent à un redémarrage avec disque effacé,
// grâce à la copie dans l'onglet « État » (Apps Script simulé) ; repli sur le fichier local si le script ne sait pas répondre.
'use strict';const assert=require('assert'),fs=require('fs'),os=require('os'),path=require('path'),http=require('http'),{spawn}=require('child_process'),io=require('socket.io-client');const w=ms=>new Promise(r=>setTimeout(r,ms));
function fakeScript(modern){const kv={},seen=[];const s=http.createServer((q,r)=>{let b='';q.on('data',c=>b+=c);q.on('end',()=>{const j=JSON.parse(b||'{}');let out={ok:true,n:0};
 if(j.token!=='TOK')out={ok:false,err:'forbidden'};else if(j.kv&&modern){seen.push(j.kv.op);if(j.kv.op==='set'){kv[j.kv.key]=j.kv.value;out={ok:true,key:j.kv.key,n:1}}else out={ok:true,value:kv[j.kv.key]===undefined?null:kv[j.kv.key]}}else if(j.kv)seen.push('old:'+j.kv.op);
 r.writeHead(200,{'Content-Type':'application/json'});r.end(JSON.stringify(out))})}).listen(0);s.kv=kv;s.seen=seen;return s}
async function boot(fake,dir){const PORT=String(4300+Math.floor(Math.random()*300));const p=spawn('node',['server.js'],{cwd:__dirname+'/..',env:{...process.env,PORT,DATA_DIR:dir,LOG_URL:'http://localhost:'+fake.address().port+'/exec',LOG_TOKEN:'TOK',LOG_EVERY_MS:'600000',STATE_EVERY_MS:'300'},stdio:'ignore'});await w(1500);return{p,U:'http://localhost:'+PORT}}
const stop=p=>new Promise(r=>{p.on('exit',r);p.kill('SIGTERM')});
async function room(U,grp,gsnap){const s=io(U,{forceNew:true});let st=null;s.on('state',x=>st=x);await w(300);const t=Date.now().toString(36);s.emit('create',{name:'Inès',game:'jamais',levels:['Fun'],pid:'P'+t,len:0,group:grp,gsnap});for(let i=0;i<60&&!st;i++)await w(50);await w(300);s.close();return st}
(async()=>{const tmp=d=>fs.mkdtempSync(path.join(os.tmpdir(),'etat-'+d+'-'));const GRP='Les Copains '+Date.now();
 const snap={a:{name:'Inès',pts:42,st:{}},b:{name:'Karim',pts:17,st:{}}};
 try{
  // 1) un serveur crée le classement du groupe ; à l'arrêt (SIGTERM) l'état part dans l'onglet « État »
  const F=fakeScript(true),d1=tmp('a');let S=await boot(F,d1);const st1=await room(S.U,GRP,snap);assert(st1&&st1.gboard&&st1.gboard.length===2,'classement créé');await w(800);await stop(S.p);
  assert(F.kv.etat,'état envoyé au script');const E=JSON.parse(F.kv.etat);assert(Object.keys(E.groups).length>=1&&Array.isArray(E.rooms)&&E.rooms.some(r=>r.code===st1.code),'groupes + salles sauvegardés');
  assert(!/base64|data:image/.test(F.kv.etat),'aucun média dans l\'état');
  // 2) redémarrage avec disque vide (comme Render) : le classement revient depuis l'onglet « État »
  const d2=tmp('b');S=await boot(F,d2);await w(500);const st2=await room(S.U,GRP,null);
  assert(st2.gboard&&st2.gboard.length===2,'classement restauré après effacement du disque');assert.deepStrictEqual(st2.gboard.map(e=>e.pts).sort((a,b)=>b-a),[42,17]);
  assert(JSON.parse(fs.readFileSync(path.join(d2,'groups.json'))),'copie locale réécrite');await stop(S.p);
  // 3) ancienne version du script (pas d'onglet État) : le serveur fonctionne, le fichier local reste la référence
  const O=fakeScript(false);S=await boot(O,d2);const st3=await room(S.U,GRP,null);assert(st3.gboard&&st3.gboard.length===2,'repli sur le fichier local');
  await stop(S.p);assert(O.seen.includes('old:get')&&O.seen.includes('old:set'),'le serveur a bien tenté le script : '+O.seen);assert(JSON.parse(fs.readFileSync(path.join(d2,'groups.json'))),'fichier local intact');O.close();
  // 4) script injoignable : démarrage normal
  const dead=http.createServer().listen(0);const port=dead.address().port;dead.close();const fakeDead={address:()=>({port})};S=await boot(fakeDead,tmp('c'));const st4=await room(S.U,'Autre '+Date.now(),null);assert(st4&&st4.code,'démarrage sans script');await stop(S.p);
  F.close();console.log('✅ etat: classements de groupe + salles restaurés après redéploiement, repli local OK')
 }catch(e){console.error('❌',e.message);process.exitCode=1}finally{setTimeout(()=>process.exit(),200)}})();
