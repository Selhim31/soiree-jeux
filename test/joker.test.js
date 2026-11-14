// node test/joker.test.js — a42 : le Joker est réservé au joueur dont c'est le tour (refus serveur pour les autres).
'use strict';const assert=require('assert'),{spawn}=require('child_process'),io=require('socket.io-client');const w=ms=>new Promise(r=>setTimeout(r,ms));
const PORT=String(4600+Math.floor(Math.random()*300)),U='http://localhost:'+PORT;
const srv=spawn('node',['server.js'],{cwd:__dirname+'/..',env:{...process.env,PORT,LOG_URL:''},stdio:'ignore'});
(async()=>{try{await w(1500);
 for(const game of['defis','jamais']){const t=game+Date.now().toString(36),ids=['A'+t,'B'+t,'C'+t];
  const S=ids.map(()=>{const s=io(U,{forceNew:true});s.err=[];s.toast=[];s.on('state',x=>s.st=x);s.on('err',e=>s.err.push(e));s.on('toast',e=>s.toast.push(e));return s});await w(300);
  S[0].emit('create',{name:'Hôte',game,levels:['Fun'],pid:ids[0],len:0});for(let i=0;i<40&&!S[0].st;i++)await w(50);const code=S[0].st.code;
  S[1].emit('join',{code,name:'Bob',pid:ids[1]});S[2].emit('join',{code,name:'Cléo',pid:ids[2]});await w(400);
  for(let k=0;k<4;k++){const id0=S[0].st.card&&S[0].st.card.id;S[0].emit('next');for(let q=0;q<40&&(!S[0].st.card||S[0].st.card.id===id0);q++)await w(25);
   const c=S[0].st.card;assert(c&&c.target,game+' : carte avec un joueur ciblé');const ti=ids.indexOf(c.target);
   for(let j=0;j<3;j++){if(j===ti)continue;const s=S[j],e0=s.err.length,t0=s.toast.length;s.emit('joker');await w(200);
    assert.strictEqual(S[0].st.card.id,c.id,game+' : un autre joueur ne peut pas passer la carte');assert(s.err.length>e0&&/Seul le joueur/.test(s.err[s.err.length-1]),game+' : refus explicite');assert.strictEqual(s.toast.length,t0,game+' : pas de pénalité pour un refus')}
   const T=S[ti],t0=T.toast.length;T.emit('joker');for(let q=0;q<40&&S[0].st.card.id===c.id;q++)await w(25);
   assert.notStrictEqual(S[0].st.card.id,c.id,game+' : le joueur ciblé peut utiliser son Joker');assert(T.toast.length>t0&&/−10/.test(T.toast[T.toast.length-1]),game+' : −10 pts')}
  S.forEach(s=>s.close())}
 console.log('✅ joker: réservé au joueur dont c\'est le tour (Défis, Je n\'ai jamais)')}catch(e){console.error('❌',e.message);process.exitCode=1}finally{srv.kill();setTimeout(()=>process.exit(),100)}})();
