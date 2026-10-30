const io=require('/workspace/tozgame/node_modules/socket.io-client');const U='http://localhost:3999';const w=ms=>new Promise(r=>setTimeout(r,ms));const fs=require('fs');
(async()=>{const mk=n=>{const s=io(U,{forceNew:true});s.on('state',st=>s.st=st);return s};const A=mk(),B=mk(),C=mk();await w(300);
A.emit('create',{name:'A',game:'soft',levels:['Classique'],pid:'ma'});await w(300);B.emit('join',{code:A.st.code,name:'B',pid:'mb'});C.emit('join',{code:A.st.code,name:'C',pid:'mc'});await w(300);
A.emit('settings',{mix:{defis:['Classique','Coquin'],tupreferes:['Classique'],connaitre:['Léger'],quiz:['Culture G'],pmu:['Classique']}});await w(200);
console.log('mix',JSON.stringify(A.st.mix));const P={ma:A,mb:B,mc:C};const seen={},cnt={};let rep=0,flow={};
for(let i=0;i<60;i++){A.emit('next');await w(50);const c=A.st.card;cnt[c.game]=(cnt[c.game]||0)+1;const k=c.game+c.level+c.text;if(seen[k]&&!c.send)rep++;seen[k]=1;
 if(c.kind==='dare'){if(c.send){const to=c.target==='ma'?'mb':'ma';P[c.target].emit('sendTo',to);await w(40);P[to].emit('done')}else P[c.target].emit('done')}
 else for(const s of[A,B,C])s.emit('answer',c.opts?c.opts[0]:'réponse');
 await w(70);const d=A.st.card;flow[d.kind]=flow[d.kind]||[0,0];flow[d.kind][d.revealed?0:1]++;if(!d.revealed)A.emit('host',{act:'force'});await w(20)}
console.log('games',JSON.stringify(cnt),'repeats',rep,'flow ok/stuck',JSON.stringify(flow));
A.emit('settings',{game:'cercle'});await w(100);const n=JSON.parse(fs.readFileSync('/workspace/tozgame/content/cercle.json')).levels.Classique.length;const s2=new Set();
for(let i=0;i<n;i++){A.emit('next');await w(25);s2.add(A.st.card.text)}console.log('cercle pool',n,'unique',s2.size,'mix after single game',A.st.mix);
await w(1200);const R=JSON.parse(fs.readFileSync('/workspace/tozgame/data/rooms.json')).find(r=>r.code===A.st.code);console.log('persisted used',Object.entries(R.used).map(([k,v])=>k+':'+v.length).join(' '));process.exit()})()
