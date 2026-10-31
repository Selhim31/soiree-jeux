// node test/games.test.js — chaque jeu du lobby, chaque niveau : tirage de cartes, couverture (aucune carte perdue), regroupements.
'use strict';const assert=require('assert'),fs=require('fs'),{spawn}=require('child_process'),io=require('socket.io-client');const w=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const PORT=3100+Math.floor(Math.random()*800),U='http://localhost:'+PORT;const srv=spawn('node',['server.js'],{cwd:__dirname+'/..',env:{...process.env,PORT,LOG_URL:'',LOG_TOKEN:''},stdio:['ignore','ignore','inherit']});await w(1500);
 try{const games=await (await fetch(U+'/api/games')).json(),fams=await (await fetch(U+'/api/families')).json();const ids=games.map(g=>g.id);
  for(const x of['rnp','pmu','verite','ask','connaitre','coquin','soft','hot','flirts','defis','mime','7sec'])assert(!ids.includes(x),x+' ne doit plus apparaître');
  for(const x of['confessions','seduction','gdefis','defi18','darkromance','loupgarou','lghot','tupreferes','ouinon','cestun10','excrush','qui','av','jamais','purete','quiz','estim','imposteur','duo','ecrit','equipe','cercle','couple','halloween'])assert(ids.includes(x),x+' manquant');
  assert(fams.find(f=>f.id==='adulte').games.includes('defi18'));for(const f of fams)for(const g of f.games)assert(ids.includes(g),'famille '+f.id+' → '+g);
  assert.deepStrictEqual(Object.keys(games.find(g=>g.id==='defi18').levels),['Coquin','Hot','Explicite']);assert.deepStrictEqual(Object.keys(games.find(g=>g.id==='gdefis').levels),['Classique','Délirant','Mime','7 secondes']);
  // couverture : toutes les cartes de content/*.json sont jouables via un jeu du lobby
  const src=fs.readFileSync(__dirname+'/../server.js','utf8');const GRP=eval('('+/const GRP=(\{[\s\S]*?\}\}\});\n/.exec(src)[1]+')');const cov=new Set();
  for(const k of ids)if(GRP[k])for(const L of Object.values(GRP[k].levels))for(const[f,l]of L)cov.add(f+'|'+l);else{const d=JSON.parse(fs.readFileSync(__dirname+`/../content/${k}.json`));for(const l in d.levels)cov.add(k+'|'+l)}
  for(const f of fs.readdirSync(__dirname+'/../content')){const k=f.replace('.json','');const d=JSON.parse(fs.readFileSync(__dirname+'/../content/'+f));for(const l in d.levels)assert(cov.has(k+'|'+l),`cartes perdues : ${k} / ${l}`);
   if(d.gold)for(const l in d.gold)assert(cov.has(k+'|'+l),'or perdu '+k)}
  let n=0;for(const g of games){if(g.kind==='lg'||g.kind==='x18')continue;for(const lv of Object.keys(g.levels)){const S=[io(U,{forceNew:true}),io(U,{forceNew:true}),io(U,{forceNew:true})];let st=null;S[0].on('state',x=>st=x);const t=Math.random().toString(36).slice(2,6);
   S[0].emit('create',{name:'Hôte',game:g.id,levels:[lv],pid:'h'+t,len:15,anon:true});for(let i=0;i<60&&!st;i++)await w(25);S[1].emit('join',{code:st.code,name:'Inès',pid:'a'+t});S[2].emit('join',{code:st.code,name:'Karim',pid:'b'+t});await w(120);
   for(let k=0;k<3;k++){const prev=st.card&&st.card.id;S[0].emit('host',{act:'force'});await w(40);S[0].emit('next');for(let i=0;i<60&&(!st.card||st.card.id===prev);i++)await w(25);const c=st.card;assert(c&&c.text,`${g.id}/${lv} : carte tirée`);
    if(GRP[g.id]){const ok=GRP[g.id].levels[lv].some(([f,l])=>f===c.game&&l===c.level);assert(ok,`${g.id}/${lv} : carte de ${c.game}/${c.level} hors catégorie`);assert.strictEqual(c.gname,g.name)}n++}
   S.forEach(s=>s.close())}}
  console.log(`✅ games: ${games.length} jeux, ${n} cartes tirées, aucune carte perdue`)}finally{srv.kill()}process.exit(0)})().catch(e=>{console.error('❌',e.message);process.exit(1)});
