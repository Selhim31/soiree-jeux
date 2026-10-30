const io=require('socket.io-client');const U=process.argv[2]||'http://localhost:3000';const w=ms=>new Promise(r=>setTimeout(r,ms));
const a=io(U),b=io(U);let S={},T=[];a.on('state',s=>S.a=s);b.on('state',s=>S.b=s);b.on('toast',t=>T.push(t));
(async()=>{await w(1500);a.emit('create',{name:'Selim',game:'flirts',levels:['Duo','Hot'],format:'Groupe'});await w(1500);b.emit('join',{code:S.a.code,name:'Ami'});await w(800);
for(const ev of['done','fail']){a.emit('next');await w(500);const c=S.a.card;(c.target===a.id?a:b).emit(ev);await w(500);console.log(c.text,'=>',S.b.card.result)}
a.emit('end');await w(400);console.log('dares',S.b.dares,'ended',S.b.ended);console.log('links in state?','links' in S.a&&S.a.links.length,'toasts',T);process.exit()})();setTimeout(()=>process.exit(1),20000);
