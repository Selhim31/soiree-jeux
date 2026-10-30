const io=require('socket.io-client');const U=process.argv[2]||'http://localhost:3000';
const a=io(U),b=io(U);let st=0;a.emit('create',{name:'Selim',game:'tupreferes',levels:['Classique','Hot'],format:'Groupe'});
a.once('joined',c=>{b.emit('join',{code:c,name:'Ami'});b.once('joined',()=>setTimeout(()=>a.emit('next'),300))});
b.on('state',s=>{if(s.card&&st==0){st=1;console.log('card',s.card.text,s.card.opts);b.emit('vote',s.card.opts[0])}else if(st==1&&Object.keys(s.votes).length){st=2;console.log('votes',Object.values(s.votes),'players',s.players.map(p=>p.name));b.emit('joker')}else if(st==2&&s.count==2){console.log('joker ok',s.card.text,s.card.opts);process.exit()}});
setTimeout(()=>{console.log('timeout');process.exit(1)},20000);
