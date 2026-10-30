const io=require('/workspace/tozgame/node_modules/socket.io-client');const U='http://localhost:3999';const w=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const mk=()=>{const s=io(U,{forceNew:true});s.on('state',st=>s.st=st);return s};const A=mk(),B=mk(),C=mk();await w(300);
A.emit('create',{name:'A',game:'ecrit',levels:['Classique'],pid:'na'});await w(300);B.emit('join',{code:A.st.code,name:'B',pid:'nb'});C.emit('join',{code:A.st.code,name:'C',pid:'nc'});await w(300);
const P={na:A,nb:B,nc:C},all=[A,B,C];
for(const g of['ecrit','excrush','estim','duo'])for(const l of['Classique','Coquin','Hot']){A.emit('settings',{game:g});await w(60);A.emit('settings',{levels:[l]});await w(60);
 let ok=0,bad=[];for(let i=0;i<4;i++){A.emit('next');await w(60);let c=A.st.card;
  if(c.kind==='whowrote'){A.emit('answer','réponse A');B.emit('answer','réponse B');C.emit('answer','réponse C');await w(60);c=A.st.card;if(c.phase!=='vote'||c.list.length!==3){bad.push('nophase');continue}
    const map=x=>Object.fromEntries(c.list.map(e=>[e.i,{'réponse A':'na','réponse B':'nb','réponse C':'nc'}[e.v]]));A.emit('votes',map());B.emit('votes',map());C.emit('votes',{});}
  else if(c.kind==='estimate'){P[c.target].emit('answer',i%2?'pass':'7');for(const s of all)if(s!==P[c.target])s.emit('answer',String(Math.random()*10|0))}
  else if(c.kind==='duo'){P[c.target].emit('answer',c.opts[0]);P[c.partner].emit('answer',c.opts[i%2]);for(const s of all)if(s!==P[c.target]&&s!==P[c.partner])s.emit('answer','Pareil')}
  else for(const s of all)s.emit('answer',c.opts?A.st.players[0].name:'texte');
  await w(80);c=A.st.card;if(c.revealed&&!/undefined|\{p\}|\{q\}/.test(c.text+c.result))ok++;else bad.push(c.kind+':'+c.phase)}
 const c=A.st.card;console.log(g,l,'ok',ok,bad.join(),'|',c.text,'|',c.result||'',c.duo?JSON.stringify(c.duo).slice(0,90):'',c.reveal?JSON.stringify(c.reveal).slice(0,120):'')}
console.log('scores',JSON.stringify(A.st.scores));
A.emit('settings',{mix:{ecrit:['Classique'],duo:['Classique'],estim:['Classique'],defis:['Classique'],tupreferes:['Classique']}});await w(80);const k={};for(let i=0;i<20;i++){A.emit('next');await w(40);k[A.st.card.game]=(k[A.st.card.game]||0)+1;A.emit('host',{act:'force'});await w(30);A.emit('host',{act:'force'});await w(30)}console.log('mix',JSON.stringify(k));process.exit()})()
