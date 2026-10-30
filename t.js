const io=require('socket.io-client');
const U='http://localhost:3000',o={};
const a=io(U,o),b=io(U,o);a.emit('create','Selim');let done=0;
a.once('state',s=>{b.emit('join',{code:s.code,name:'Ami'});b.once('state',s2=>{console.log('joined',s2.players.map(p=>p.name));a.emit('cats',['qui']);setTimeout(()=>a.emit('next'),500);
b.on('state',s3=>{if(s3.card&&!done){done=1;console.log('card',s3.card.text);b.emit('vote','Selim')}else if(done&&Object.keys(s3.votes).length){console.log('votes',s3.votes);process.exit()}})})});
setTimeout(()=>{console.log('timeout');process.exit(1)},15000);
