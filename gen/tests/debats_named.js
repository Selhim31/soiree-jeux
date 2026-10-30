const io=require('/workspace/tozgame/node_modules/socket.io-client');const w=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const mk=()=>{const s=io('http://localhost:3999',{forceNew:true});s.on('state',st=>s.st=st);return s};const A=mk(),B=mk(),C=mk();await w(300);
A.emit('create',{name:'A',game:'debats',levels:['Couple & société'],pid:'d1'});await w(300);B.emit('join',{code:A.st.code,name:'B',pid:'d2'});C.emit('join',{code:A.st.code,name:'C',pid:'d3'});await w(300);
const r={};for(let i=0;i<60;i++){A.emit('host',{act:'force'});await w(15);A.emit('next');await w(35);const c=A.st.card;const k=c.text.replace(/^.*\? /,'').replace(/[ABC]\b/g,'X');r[k]=c.expected.length}console.log(r);process.exit()})()
