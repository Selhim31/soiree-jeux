const io=require('/workspace/tozgame/node_modules/socket.io-client');const w=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const mk=()=>{const s=io('http://localhost:3999',{forceNew:true});s.on('state',st=>s.st=st);return s};const A=mk(),B=mk(),C=mk();await w(300);
A.emit('create',{name:'A',game:'hot',levels:['Hot'],pid:'pa'});await w(300);B.emit('join',{code:A.st.code,name:'B',pid:'pb'});C.emit('join',{code:A.st.code,name:'C',pid:'pc'});await w(300);
A.emit('partner',{id:'pb'});await w(100);console.log('A-B',JSON.stringify(A.st.pairs));C.emit('partner',{id:'pa'});await w(100);console.log('C picks A',JSON.stringify(A.st.pairs));
B.emit('partner',{who:'pc',id:''});await w(100);console.log('B tries edit C (refused)',JSON.stringify(A.st.pairs));A.emit('partner',{who:'pc',id:''});await w(100);console.log('host sets C single',JSON.stringify(A.st.pairs));
await w(1200);const R=JSON.parse(require('fs').readFileSync('/workspace/tozgame/data/rooms.json')).find(r=>r.code===A.st.code);console.log('persisted',JSON.stringify(R.pairs));process.exit()})()
