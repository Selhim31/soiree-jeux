const io=require('/workspace/tozgame/node_modules/socket.io-client');const w=ms=>new Promise(r=>setTimeout(r,ms));
const N={a:'Alice',b:'Bobby',c:'Cleo',d:'Dario'};
async function scen(label,pairs,offline,present,games){const S={};const mk=()=>{const s=io('http://localhost:3999',{forceNew:true});s.on('state',st=>s.st=st);return s};
 for(const k of present){S[k]=mk()}await w(300);const A=S[present[0]];A.emit('create',{name:N[present[0]],game:'hot',levels:['Hot'],pid:label+present[0]});await w(300);
 for(const k of present.slice(1)){S[k].emit('join',{code:A.st.code,name:N[k],pid:label+k})}await w(300);
 for(const[x,y]of pairs)S[x].emit('partner',{id:label+y});await w(200);
 for(const k of offline){S[k].disconnect()}await w(300);
 const P=A.st.pairs,byName=Object.fromEntries(A.st.players.map(p=>[p.name,p.id])),on=new Set(A.st.players.filter(p=>p.online!==false).map(p=>p.id));
 const ok=(t,o)=>P[t]?P[t]===o&&on.has(o):!P[o]&&on.has(o);let bad=0,tot=0,withQ=0;
 for(const[g,l]of games){A.emit('settings',{game:g});await w(50);A.emit('settings',{levels:[l]});await w(50);
  for(let i=0;i<40;i++){A.emit('host',{act:'force'});await w(15);A.emit('next');await w(35);const c=A.st.card;tot++;
   let others=Object.entries(byName).filter(([n,id])=>id!==c.target&&new RegExp(n).test(c.text)).map(([n,id])=>id);
   if(c.send&&c.elig){others=others.concat(c.elig)}
   if(others.length){withQ++;if(label==='s2'&&withQ<4)console.log('  ex',c.target,c.text.slice(0,90),others)}if(l!=='Coquin'&&others.some(o=>!ok(c.target,o))){bad++;console.log(' BAD',c.text,c.elig)}}}
 console.log(label,'pairs',JSON.stringify(Object.keys(P).length),'cards',tot,'with other player',withQ,'violations',bad);for(const s of Object.values(S))s.disconnect()}
(async()=>{const G=[['hot','Hot'],['hot','Explicite'],['defis','Explicite'],['av','Explicite'],['tupreferes','Hot'],['duo','Hot'],['couple','Explicite']];

await scen('s2',[['a','b']],['b'],['a','b','c'],G);

// coquin unchanged: couple a-b, single c → coquin cards may pair a with c

process.exit()})()
