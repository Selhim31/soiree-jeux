const io=require('socket.io-client');const U=process.argv[2]||'http://localhost:3000';const w=ms=>new Promise(r=>setTimeout(r,ms));
const a=io(U),b=io(U),c=io(U);let S={};a.on('state',s=>S.a=s);
(async()=>{await w(1500);a.emit('create',{name:'Selim',game:'soft',levels:['Classique'],format:'Groupe'});await w(1500);b.emit('join',{code:S.a.code,name:'Ami'});c.emit('join',{code:S.a.code,name:'Léo'});await w(800);
a.emit('next');await w(500);const id=S.a.card.id;a.emit('answer','x');b.emit('answer','y');await w(400);a.emit('next');await w(400);console.log('blocked while Léo pending:',S.a.card.id===id,'done',S.a.card.done);
c.disconnect();await w(600);console.log('after Léo leaves: revealed',S.a.card.revealed,'done',S.a.card.done);a.emit('next');await w(400);console.log('next worked:',S.a.card.id!==id);
a.emit('settings',{game:'defis'});await w(300);a.emit('next');await w(400);const d=S.a.card.id;a.emit('next');await w(300);console.log('dare blocked:',S.a.card.id===d);(S.a.card.target===a.id?a:b).emit('done');await w(300);a.emit('next');await w(300);console.log('dare unblocked:',S.a.card.id!==d);process.exit()})();setTimeout(()=>process.exit(1),25000);
