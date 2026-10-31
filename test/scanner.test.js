// node test/scanner.test.js — famille « Le Scanner » : 6 tests secrets + Pureté.
'use strict';const assert=require('assert'),http=require('http'),{spawn}=require('child_process'),io=require('socket.io-client');const w=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const rows=[];const fake=http.createServer((q,r)=>{let b='';q.on('data',c=>b+=c);q.on('end',()=>{const j=JSON.parse(b);if(j.rows)rows.push(...j.rows);r.end('{"ok":true}')})}).listen(0);
 const PORT=3100+Math.floor(Math.random()*800),U='http://localhost:'+PORT;const srv=spawn('node',['server.js'],{cwd:__dirname+'/..',env:{...process.env,PORT,LOG_URL:'http://localhost:'+fake.address().port+'/x',LOG_TOKEN:'T',LOG_EVERY_MS:'400'},stdio:['ignore','ignore','inherit']});await w(1500);
 try{const fam=(await (await fetch(U+'/api/families')).json()).find(f=>f.id==='revelations');assert.strictEqual(fam.name,'Le Scanner');assert.deepStrictEqual(fam.games,['purete','redflag','fetard','jaloux','menteur','kink','compat']);
  const games=await (await fetch(U+'/api/games')).json();for(const id of fam.games.slice(1)){const g=games.find(x=>x.id===id);assert(g&&g.kind==='rtest',id);const n=Object.values(g.levels)[0];assert(n>=95,id+' ~100 items : '+n)}
  assert(games.find(x=>x.id==='kink').adult,'kink 18+');
  for(const id of fam.games.slice(1)){const S=[0,1,2].map(()=>io(U,{forceNew:true}));const st=[null,null,null];S.forEach((s,i)=>s.on('state',x=>st[i]=x));const t=Math.random().toString(36).slice(2,6);const pid=['h','a','b'].map(x=>x+t);
   S[0].emit('create',{name:'Hôte',game:id,levels:[Object.keys(games.find(x=>x.id===id).levels)[0]],pid:pid[0],len:15});for(let i=0;i<60&&!st[0];i++)await w(25);S[1].emit('join',{code:st[0].code,name:'Inès',pid:pid[1]});S[2].emit('join',{code:st[0].code,name:'Karim',pid:pid[2]});await w(200);
   if(id==='compat')S[0].emit('partner',{who:pid[0],id:pid[1]});await w(100);
   for(let round=0;round<2;round++){S[0].emit('next');for(let i=0;i<60&&!(st[0].card&&st[0].card.kind==='rtest'&&!st[0].card.revealed);i++)await w(25);const c=st[0].card;assert.strictEqual(c.items.length,10);assert(!c.secret,'catégories kink jamais envoyées');
    const K=[[0,1,2,3,4,5,6],[0,1],[0,1,2,3]];S.forEach((s,i)=>s.emit('answer',{k:K[i],g:pid[0],est:{[pid[0]]:7,[pid[1]]:3,[pid[2]]:1}}));for(let i=0;i<80&&!st[0].card.revealed;i++)await w(25);
    const r=st[0].card;assert(r.revealed,id+' révélé');assert(!r.answers,'réponses brutes jamais publiques');assert(r.rv&&r.rv.length,id+' résultats');
    if(['redflag','fetard','jaloux','menteur'].includes(id)){assert.strictEqual(r.rv[0].name,'Hôte');assert.strictEqual(r.rv[0].pc,70);assert(r.rv[0].badge)}
    if(id==='redflag')assert.strictEqual(r.rv.find(x=>x.name==='Inès').badge,round?'🟡 Drapeau jaune':'🟡 Drapeau jaune');
    if(id==='jaloux')assert(/bien vu par Hôte, Inès, Karim/.test(r.bonus),r.bonus);
    if(id==='menteur')assert(/Hôte : 7/.test(r.bonus),r.bonus);
    if(id==='kink'){assert(r.rv.every(x=>x.badge&&x.pc===undefined),'profil seulement');assert(!JSON.stringify(r).includes('/10'))}
    if(id==='compat'){assert.strictEqual(r.rv.length,1,'duo déclaré uniquement');assert.strictEqual(r.rv[0].pc,50)}
    S[0].emit('host',{act:'force'});await w(50)}
   const b=st[0].board||[];assert(b.length&&b.every(e=>e.pts>=2),id+' points participation');S.forEach(s=>s.close())}
  await w(1500);const J=JSON.stringify(rows);assert(J.includes('rtest'),'lignes journal');assert(J.includes('profil révélé'));assert(!/"k":\[/.test(J),'pas de réponses détaillées dans le journal');
  console.log('✅ scanner: 6 tests + famille OK')}finally{srv.kill();fake.close()}process.exit(0)})().catch(e=>{console.error('❌',e.stack||e.message);process.exit(1)});
