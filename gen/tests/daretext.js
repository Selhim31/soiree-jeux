const io=require('/workspace/tozgame/node_modules/socket.io-client');const w=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const S=[0,1].map(()=>{const s=io('http://localhost:3999',{forceNew:true});s.on('state',st=>s.st=st);return s});await w(300);const[A,B]=S;
A.emit('create',{name:'A',game:'defis',levels:['Classique'],pid:'ta'});await w(300);B.emit('join',{code:A.st.code,name:'B',pid:'tb'});await w(300);
let c;for(let i=0;i<20;i++){A.emit('host',{act:'force'});await w(20);A.emit('next');await w(50);c=A.st.card;if(!c.send)break}
const P={ta:A,tb:B},other=c.target==='ta'?B:A;other.emit('dareText','pirate');await w(80);console.log('non-target ignored:',A.st.card.typed===undefined);
P[c.target].emit('dareText','<b>x</b>'+'é'.repeat(1200));await w(80);console.log('stored len',B.st.card.typed.length,'raw html kept for client escaping:',B.st.card.typed.startsWith('<b>'));
P[c.target].emit('done');await w(80);console.log('validation still works:',A.st.card.revealed,A.st.card.result);
A.emit('settings',{game:'av'});A.emit('settings',{levels:['Classique']});await w(100);for(let i=0;i<40;i++){A.emit('host',{act:'force'});await w(20);A.emit('next');await w(40);if(A.st.card.send)break}
const d=A.st.card;if(d.send){P[d.target].emit('dareText','nope');await w(80);console.log('send-dare unaffected:',A.st.card.typed===undefined)}process.exit()})()
