const io=require('/workspace/tozgame/node_modules/socket.io-client');const w=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const N=['Alice','Bobby','Cleo','Dario'];const S=N.map(()=>{const s=io('http://localhost:3999',{forceNew:true});s.on('state',st=>s.st=st);return s});await w(300);const A=S[0];
A.emit('create',{name:N[0],game:'av',levels:['Extrême'],pid:'xa'});await w(300);for(let i=1;i<4;i++)S[i].emit('join',{code:A.st.code,name:N[i],pid:'x'+'abcd'[i]});await w(300);
A.emit('partner',{id:'xb'});await w(200);const P=A.st.pairs,id=Object.fromEntries(A.st.players.map(p=>[p.name,p.id]));const ok=(t,o)=>P[t]?P[t]===o:!P[o];
for(const mix of[false,true]){if(mix){A.emit('settings',{mix:{av:['Extrême'],quiz:['Culture G']}});await w(100)}let act=0,ver=0,vbad=0,abad=0,vcross=0;
for(let i=0;i<120;i++){A.emit('host',{act:'force'});await w(15);A.emit('next');await w(35);const c=A.st.card;if(c.game!=='av')continue;
 let o=N.filter(n=>id[n]!==c.target&&c.text.includes(n)).map(n=>id[n]);if(c.send&&c.elig)o=o.concat(c.elig);
 if(c.text.startsWith('Action')||c.kind==='dare'){act++;if(o.some(x=>!ok(c.target,x)))abad++}else{ver++;if(o.some(x=>!ok(c.target,x)))vcross++}}
console.log(mix?'mix':'av Extrême','actions',act,'violations',abad,'| vérités',ver,'cross-couple vérités (allowed)',vcross)}process.exit()})()
