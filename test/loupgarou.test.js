// node test/loupgarou.test.js — parties complètes simulées (4, 6, 8, 12 joueurs) en Loup-Garou classique et Hot.
'use strict';const assert=require('assert'),http=require('http'),{spawn}=require('child_process'),io=require('socket.io-client');
const {dist}=require('../lg');const w=ms=>new Promise(r=>setTimeout(r,ms));const rnd=a=>a[Math.floor(Math.random()*a.length)];
const EXP={4:'loup voyante villageois villageois',6:'loup voyante sorciere chasseur villageois villageois',8:'loup loup voyante sorciere chasseur cupidon villageois villageois',12:'loup loup loup voyante sorciere chasseur cupidon petitefille villageois villageois villageois villageois'};
for(const n in EXP)assert.strictEqual(dist(+n).join(' '),EXP[n]);assert.strictEqual(dist(3),null);
async function game(U,n,game,lv,stats){const B=[];for(let i=0;i<n;i++){const s=io(U,{forceNew:true});const b={s,id:'p'+i+'_'+Math.random().toString(36).slice(2,6),S:null,o:null,did:{},errs:[]};s.on('state',x=>b.S=x);s.on('lgme',x=>{b.o=x;if(x&&x.al&&x.roles)b.leak=true});s.on('err2',e=>b.errs.push(e));B.push(b)}
 const H=B[0];H.s.emit('create',{name:'J0',game,levels:[lv],pid:H.id,len:30});for(let i=0;i<60&&!H.S;i++)await w(30);const code=H.S.code;
 for(let i=1;i<n;i++)B[i].s.emit('join',{code,name:'J'+i,pid:B[i].id});for(let i=0;i<100&&H.S.players.length<n;i++)await w(30);assert.strictEqual(H.S.players.length,n);
 await w(150);const D=H.S.lg.dist;assert.strictEqual(Object.values(D).reduce((a,b)=>a+b,0),n,'lobby distribution');
 H.s.emit('lg',{a:'start'});let sent=0;const t0=Date.now();
 while(Date.now()-t0<120000){await w(25);const v=H.S&&H.S.lg;if(!v)continue;if(v.ph==='end')break;assert(!v.roles,'roles never public before end');
  for(const b of B){const o=b.o,S=b.S;if(!o||!S||!S.lg)continue;const L=S.lg,me=b.id,al=o.al,A=Object.keys(L.alive||{}).filter(x=>L.alive[x]),oth=A.filter(x=>x!==me),em=(a,x={})=>b.s.emit('lg',{a,...x});
   const once=(k,f)=>{if(!b.did[k]){b.did[k]=1;f()}};const ph=L.ph+L.n+'_'+L.day;
   if(L.ph==='night'&&al){if(L.step==='cupid'&&o.role==='cupidon')once('c',()=>em('cupid',{ids:rnd([[oth[0],me],[oth[0],oth[1]]])}));
    if(L.step==='main'){if(o.role==='loup'&&!(me in (o.wv||{})))once('w'+ph,()=>{em('chat',{ch:'w',txt:'on mange qui ?'});em('wolf',{t:rnd(A.filter(x=>!o.mates.includes(x)&&x!==me))})});
     if(o.role==='voyante'&&!o.seerT)once('s'+ph,()=>em('seer',{t:rnd(oth)}));if(o.seerDare)once('so'+ph,()=>em('seerOk'));
     if(o.role==='salvateur'&&!o.guard)once('g'+ph,()=>em('guard',{t:rnd(A.filter(x=>x!==o.guardLast))}));if(o.ld&&!o.ld.done)once('l'+ph,()=>{em('loverOk');stats.ld++})}
    if(L.step==='witch'&&o.role==='sorciere')once('wi'+ph,()=>em('witch',{heal:Math.random()<.5,poison:Math.random()<.3?rnd(oth):null}))}
   if(L.ph==='hunter'&&L.actor===me)once('h'+ph,()=>{stats.hunter++;em('hunter',{t:rnd(oth)})});
   const c=S.card;if(c&&!c.revealed){if(c.send&&!c.sendTo&&c.target===me)once('st'+c.id,()=>{assert(c.vok,'send dare uses view-once circuit');b.s.emit('sendTo',rnd(S.players.filter(p=>p.id!==me)).id)});
    if(c.send&&c.sendTo&&c.target===me&&!sent)once('vo'+c.id,()=>{sent++;stats.vo++;b.s.emit('vophoto','data:image/jpeg;base64,'+Buffer.concat([Buffer.from([0xFF,0xD8,0xFF,0xE0]),Buffer.alloc(500,3)]).toString('base64'))});
    if((c.send?c.sendTo===me:c.target===me))once('d'+c.id,()=>{stats.cards++;setTimeout(()=>b.s.emit(Math.random()<.8?'done':'fail'),60)})}
   if(L.ph==='day'){if(al)once('r'+ph,()=>{em('chat',{ch:'d',txt:'je suis innocent'});em('ready')});else{once('gc'+ph,()=>em('chat',{ch:'g',txt:'bouh'}));if(L.v==='hot'&&!(S.card&&!S.card.revealed)&&Math.random()<.05)once('gg'+ph,()=>{stats.ghost++;em('gage',{t:rnd(A)})})}}
   if(L.ph==='vote'&&al&&o.myVote===undefined)once('v'+ph+(L.cand||[]).join(),()=>em('vote',{t:rnd((L.cand||oth).filter(x=>x!==me).concat(L.cand?[]:[]))||''}));
   if(L.ph==='final'&&al&&L.accused!==me&&o.myFinal===undefined)once('f'+ph,()=>{stats.plead++;em('final',{yes:Math.random()<.7})});}}
 await w(150);const v=H.S.lg;assert.strictEqual(v.ph,'end',`${game} ${n} joueurs : la partie doit se terminer`);
 const A=Object.keys(v.alive).filter(x=>v.alive[x]),wa=A.filter(x=>v.roles[x]==='loup').length;
 if(v.winner==='village')assert.strictEqual(wa,0);if(v.winner==='loups')assert(wa>=A.length-wa);if(v.winner==='amants')assert.strictEqual(A.length,2);
 for(const id of v.winners)assert(v.pts[id]>=15,'winners +15');assert(v.titles.length>0,'fun titles');
 for(const b of B){assert(!b.leak,'living player never sees all roles');assert(b.o&&b.o.role===v.roles[b.id])}
 const cnt={};Object.values(v.roles).forEach(k=>cnt[k]=(cnt[k]||0)+1);assert.deepStrictEqual(cnt,D,'roles match lobby distribution');
 H.s.emit('host',{act:'end'});B.forEach(b=>b.s.close());return v.winner}
(async()=>{const media=[],rows=[];const fake=http.createServer((q,r)=>{let b='';q.on('data',c=>b+=c);q.on('end',()=>{const j=JSON.parse(b);if(j.media)media.push(j.media);if(j.rows)rows.push(...j.rows);r.writeHead(200,{'Content-Type':'application/json'});r.end('{"ok":true}')})}).listen(0);
 const PORT=3100+Math.floor(Math.random()*800),U='http://localhost:'+PORT;
 const srv=spawn('node',['server.js'],{cwd:__dirname+'/..',env:{...process.env,PORT,LG_SPEED:'0.03',LOG_URL:'http://localhost:'+fake.address().port+'/exec',LOG_TOKEN:'T',LOG_EVERY_MS:'500',GOLD_P:'0.5'},stdio:['ignore','ignore','inherit']});await w(1500);
 const out=[];const stats={ld:0,hunter:0,cards:0,vo:0,ghost:0,plead:0};
 try{for(const[g,lv]of[['loupgarou','Classique'],['lghot','Hot']])for(const n of[4,6,8,12]){const W=await game(U,n,g,lv,stats);out.push(`${g} ${n}j → ${W}`)}}finally{await w(1500);srv.kill()}
 fake.close();const ev=new Set(rows.map(x=>x.event||x.ev||x[1]));const J=JSON.stringify(rows);
 for(const e of['lg_start','lg_role','lg_night','lg_elim','lg_end'])assert(J.includes(e),'journal row '+e);assert(J.includes('lg_vote'),'journal votes');
 assert.strictEqual(media.length,0,'aucun média Loup-Garou / vue unique archivé');assert(!/base64|\/9j\//.test(J),'no media content in journal');
 assert(stats.cards>0&&stats.plead>0,'hot dares + plea verdicts exercised');
 console.log(out.join('\n'));console.log('stats',JSON.stringify(stats));console.log('✅ loupgarou: tous les tests passent');process.exit(0)})().catch(e=>{console.error('❌',e.stack||e.message);process.exit(1)});
