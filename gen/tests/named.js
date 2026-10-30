const io=require('/workspace/tozgame/node_modules/socket.io-client');const w=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const mk=()=>{const s=io('http://localhost:3999',{forceNew:true});s.on('state',st=>s.st=st);return s};const A=mk(),B=mk(),C=mk();await w(300);
A.emit('create',{name:'A',game:'verite',levels:['Classique'],pid:'na1'});await w(300);B.emit('join',{code:A.st.code,name:'B',pid:'nb1'});C.emit('join',{code:A.st.code,name:'C',pid:'nc1'});await w(300);
const P={na1:A,nb1:B,nc1:C};
for(const[g,l]of[['verite','Classique'],['soft','Classique'],['excrush','Classique'],['halloween','Halloween'],['av','Classique'],['connaitre','Léger'],['debats','Classique'],['estim','Classique'],['duo','Classique'],['qui','Classique'],['defis','Classique'],['7sec','Classique'],['cercle','Classique'],['mime','Classique'],['flirts','Duo']]){
 A.emit('settings',{game:g});await w(50);A.emit('settings',{levels:[l]});await w(50);const st={};
 for(let i=0;i<12;i++){A.emit('host',{act:'force'});await w(15);A.emit('next');await w(40);const c=A.st.card;const k=c.kind+(c.named?':named':'');st[k]=st[k]||{n:0,exp:new Set(),ok:0};st[k].n++;st[k].exp.add(c.expected.length);
  if(c.kind==='input'&&c.named){const o=Object.values(P).find(s=>s!==P[c.target]);o.emit('answer','intrus');await w(40);const rej=!A.st.card.answered.length;P[c.target].emit('answer','ma réponse');await w(50);if(rej&&A.st.card.revealed&&A.st.card.answers.length===1)st[k].ok++}}
 console.log(g,l,Object.entries(st).map(([k,v])=>`${k} x${v.n} expected=${[...v.exp]}${k.includes('named')?' flowOK='+v.ok:''}`).join(' | '))}
// target offline: skip works
A.emit('settings',{game:'verite'});await w(50);for(let i=0;i<10;i++){A.emit('host',{act:'force'});await w(15);A.emit('next');await w(40);if(A.st.card.target==='nc1')break}
C.disconnect();await w(200);A.emit('host',{act:'force'});await w(40);A.emit('next');await w(60);console.log('after target offline, next card target:',A.st.card.target,'revealedPrev ok');process.exit()})()
