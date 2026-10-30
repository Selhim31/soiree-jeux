const io=require('/workspace/tozgame/node_modules/socket.io-client');const w=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const mk=()=>{const s=io('http://localhost:3999',{forceNew:true});s.on('state',st=>s.st=st);return s};const A=mk(),B=mk(),C=mk();await w(300);
A.emit('create',{name:'A',game:'defis',levels:['Extrême'],pid:'ua'});await w(300);B.emit('join',{code:A.st.code,name:'B',pid:'ub'});C.emit('join',{code:A.st.code,name:'C',pid:'uc'});await w(300);
let seenSend=null,lv=new Set();for(let i=0;i<40;i++){A.emit('host',{act:'force'});await w(15);A.emit('next');await w(35);const c=A.st.card;lv.add(c.level);if(c.send&&!seenSend)seenSend=c.text}
console.log('old level Extrême maps to',[...lv],'| send before pick:',seenSend);
A.emit('settings',{game:'purete'});await w(80);A.emit('next');await w(80);for(const s of[A,B,C])s.emit('answer',3);await w(100);console.log('purete level',A.st.levels,A.st.card.result);
A.emit('settings',{game:'debats'});await w(60);A.emit('settings',{levels:['Hard']});await w(60);A.emit('next');await w(60);console.log('debats Hard ->',A.st.levels,A.st.card.level);
A.emit('settings',{mix:{defis:['Extrême'],av:['Délirant','Extrême']}});await w(60);console.log('mix',JSON.stringify(A.st.mix));
A.emit('partner',{id:'ub'});await w(80);A.emit('settings',{game:'av'});await w(50);A.emit('settings',{levels:['Délirant']});await w(50);let cross=0;
for(let i=0;i<60;i++){A.emit('host',{act:'force'});await w(15);A.emit('next');await w(35);const c=A.st.card;if(c.elig)cross=-999;if(c.target==='ua'&&/\bC\b/.test(c.text))cross++}
console.log('Délirant unrestricted (elig null, A paired with C allowed):',cross);process.exit()})()
