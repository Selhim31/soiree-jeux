const io=require('socket.io-client');const U=process.argv[2]||'http://localhost:3000';
const a=io(U),b=io(U);let S={};const w=ms=>new Promise(r=>setTimeout(r,ms));
const last=(s)=>new Promise(r=>s.once('state',r));
a.on('state',s=>S.a=s);b.on('state',s=>S.b=s);let sec={};a.on('secret',x=>sec.a=x);b.on('secret',x=>sec.b=x);
let photo=null,toasts=[];b.on('photo',p=>photo=p);b.on('toast',t=>toasts.push(t));
b.on('linkAsk',({from})=>b.emit('linkAccept',from));
(async()=>{a.emit('create',{name:'Selim',game:'connaitre',levels:['Léger'],format:'Groupe'});await w(400);
b.emit('join',{code:S.a.code,name:'Ami'});await w(400);
b.emit('anonQ',{text:'Question secrète ?',level:'Léger'});await w(200);console.log('anonCount',S.a.anonCount, 'sender exposed?',JSON.stringify(S.a).includes(b.id));
a.emit('next');await w(300);console.log('card',S.a.card.text,S.a.card.anon||false,'kind',S.a.card.kind);
a.emit('answer','Réponse A');await w(200);console.log('answers hidden?',S.b.card.answers===undefined,S.b.card.answered.length);
b.emit('answer','Réponse B');await w(200);console.log('revealed',S.b.card.answers);
a.emit('settings',{mode:'turn',pick:'answerer'});a.emit('next');await w(300);const t=S.a.card.target;console.log('turn target',t===a.id?'Selim':'Ami','expected',S.a.card.expected.length);
(t===a.id?a:b).emit('answer','ma réponse');await w(200);console.log('revealed turn',S.a.card.revealed);(t===a.id?a:b).emit('pickNext',t===a.id?b.id:a.id);await w(300);console.log('next turn ok',S.a.card.target!==t);
a.emit('linkReq',b.id);await w(300);console.log('links',S.a.links.length);a.emit('photo',{to:b.id,img:'data:image/jpeg;base64,AAAA'});await w(300);console.log('private photo received',!!photo,toasts.slice(-1));
for(const g of['imposteur','quiz','rnp','pmu','7sec','purete','equipe','cercle','cestun10','ouinon','jamais','flirts']){a.emit('settings',{game:g});await w(150);a.emit('next');await w(250);const c=S.a.card;let extra='';
 if(g==='imposteur')extra='secrets '+sec.a+'/'+sec.b;
 if(['quiz','ouinon','jamais','cestun10'].includes(g)){a.emit('answer',c.opts?c.opts[0]:5);b.emit('answer',c.opts?c.opts[0]:7);await w(250);extra='rev '+S.a.card.revealed+' '+(S.a.card.result||'')}
 if(g==='rnp'){(c.target===a.id?a:b).emit('answer','Purple');await w(250);extra=S.a.card.result}
 if(g==='pmu'){a.emit('answer','♥');for(let i=0;i<40&&!S.a.card.pmu.winner;i++){a.emit('pmuDraw');await w(40)}extra=S.a.card.result}
 if(g==='purete'){a.emit('answer',10);b.emit('answer',3);await w(250);extra=S.a.card.result}
 console.log(g,'|',c.kind,'|',c.text.slice(0,60),'|',extra)}
process.exit()})();setTimeout(()=>{console.log('timeout');process.exit(1)},30000);
