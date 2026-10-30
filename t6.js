const io=require('socket.io-client');const U=process.argv[2]||'http://localhost:3000';const w=ms=>new Promise(r=>setTimeout(r,ms));
let S={};const mk=(k)=>{const s=io(U,{forceNew:true});s.on('state',x=>S[k]=x);return s};
(async()=>{let a=mk('a'),b=mk('b');await w(1500);a.emit('create',{name:'Selim',game:'defis',levels:['Classique'],pid:'P-A'});await w(1500);const code=S.a.code;b.emit('join',{code,name:'Ami',pid:'P-B'});await w(600);
a.emit('next');await w(400);(S.a.card.target==='P-A'?a:b).emit('done');await w(400);console.log('dares',JSON.stringify(S.a.dares));
a.disconnect();await w(800);console.log('host offline shown:',S.b.players.find(p=>p.id==='P-A').online,'host still',S.b.host);
a=mk('a');a.emit('join',{code,name:'Selim',pid:'P-A'});await w(800);console.log('after reconnect host',S.a.host,'online',S.a.players.map(p=>p.name+':'+p.online).join(','),'dares kept',JSON.stringify(S.a.dares));
let n=0;b.on('emo',()=>n++);for(let i=0;i<20;i++){a.emit('emo','🔥');await w(50)}await w(500);console.log('emoji spam 20 sent ->',n,'received');a.emit('emo','HACK');
console.log('CODE',code);process.exit()})();setTimeout(()=>process.exit(1),25000);
