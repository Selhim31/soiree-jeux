const io=require('socket.io-client');const U=process.argv[2]||'http://localhost:3000';const w=ms=>new Promise(r=>setTimeout(r,ms));
let S={};const mk=k=>{const s=io(U,{forceNew:true});s.on('state',x=>S[k]=x);return s};
(async()=>{const a=mk('a'),b=mk('b');await w(1500);a.emit('create',{name:'Selim',game:'defis',levels:['Classique','Coquin','Hot'],pid:'H'});await w(1500);b.emit('join',{code:S.a.code,name:'Ami',pid:'B'});await w(700);
a.emit('next');await w(300);for(let i=0;i<80;i++){a.emit('joker');await w(120);if(S.a.card&&S.a.card.send)break}
const c=S.a.card;console.log('send card:',c.text);const T=c.target==='H'?a:b,R=c.target==='H'?'B':'H',RS=c.target==='H'?b:a;
T.emit('done');await w(200);console.log('target cannot confirm before pick:',!S.a.card.revealed);
T.emit('sendTo',R);await w(300);console.log('after pick:',S.a.card.text);
T.emit('done');await w(200);console.log('sender self-confirm ignored:',!S.a.card.revealed||R==='H');
RS.emit('done');await w(300);console.log('recipient confirmed:',S.a.card.result);process.exit()})();setTimeout(()=>process.exit(1),30000);
