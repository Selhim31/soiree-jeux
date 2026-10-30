const express=require('express'),http=require('http'),fs=require('fs'),QR=require('qrcode'),{Server}=require('socket.io');
const G={};for(const f of fs.readdirSync(__dirname+'/content'))G[f.replace('.json','')]=JSON.parse(fs.readFileSync(__dirname+'/content/'+f));
const ORDER=["connaitre","soft","coquin","hot","couple","flirts","defis","av","qui","jamais","tupreferes","ouinon","cestun10","imposteur","7sec","quiz","equipe","cercle","rnp","pmu","purete","verite","debats","mime","halloween"];
const KIND={defis:'dare',mime:'dare',flirts:'dare',qui:'players',tupreferes:'ab',ouinon:'ab',jamais:'ab'};
const kindOf=k=>G[k].kind||KIND[k]||'input';
const VER=(process.env.RENDER_GIT_COMMIT||String(Date.now())).slice(0,10);
const INDEX=()=>fs.readFileSync(__dirname+'/public/index.html','utf8').replace(/(\/(?:app|app2)\.js|\/style\.css)"/g,`$1?v=${VER}"`).replace('<head>',`<head><meta name=app-version content="${VER}">`);
const app=express();app.get(['/','/index.html'],(q,r)=>{r.set('Cache-Control','no-store');r.type('html').send(INDEX())});app.get('/api/version',(q,r)=>{r.set('Cache-Control','no-store');r.json({v:VER})});app.set('trust proxy',true);app.use(express.static(__dirname+'/public',{maxAge:0,etag:true,setHeaders:(r)=>r.setHeader('Cache-Control','no-cache')}));
app.get('/api/games',(q,r)=>r.json(ORDER.filter(k=>G[k]).map(k=>({id:k,name:G[k].name,desc:G[k].desc,img:G[k].img,adult:G[k].adult,kind:kindOf(k),levels:Object.fromEntries(Object.entries(G[k].levels).map(([l,v])=>[l,['rnp','pmu'].includes(k)?0:v.length]))}))));
const FAM=[{id:'questions',name:'Questions & Vérités',emoji:'💬',desc:'Se découvrir, avouer, débattre',games:['connaitre','soft','verite','av','jamais','debats']},{id:'defis',name:'Défis',emoji:'⚡',desc:'Gages à distance, mimes, chrono',games:['defis','mime','7sec']},{id:'ambiance',name:"Jeux d'ambiance",emoji:'🎉',desc:'Votes, quiz, imposteur, équipes',games:['qui','tupreferes','ouinon','cestun10','imposteur','quiz','equipe','halloween']},{id:'cartes',name:'Cartes & alcool',emoji:'🍻',desc:'Le cercle, rouge-noir-purple, PMU',games:['cercle','rnp','pmu']},{id:'adulte',name:'Couple & 18+',emoji:'🔥',desc:'Coquin, Hot, Couple, Flirts, Pureté',adult:true,games:['coquin','hot','couple','flirts','purete']}];
app.get('/api/families',(q,r)=>r.json(FAM));
app.get('/api/purete',(q,r)=>r.json(G.purete.levels.Classique));
app.get('/qr/:code.png',async(q,r)=>{const u=`${q.protocol}://${q.get('host')}/?r=${encodeURIComponent(q.params.code)}`;r.type('png').send(await QR.toBuffer(u,{margin:1,width:300,color:{dark:'#1a0b2e',light:'#ffffff'}}))});
const EMO=['😂','🔥','😍','😱','🥵','👏','🍻','😈','🙈','💀','❤️','🤯','😏','🥳','👀','💯'];const GR={},GRACE=45000;
function leaveP(r,id){const p=r.players.find(p=>p.id===id);if(!p||p.online)return;r.players=r.players.filter(p=>p.id!==id);if(!r.players.length){const c=r.code;setTimeout(()=>{if(rooms[c]&&!rooms[c].players.length){delete rooms[c];save()}},3600000);save();return}if(r.host===id)r.host=(r.players.find(p=>p.online)||r.players[0]).id;if(r.card)checkAll(r);pub(r)}
function restore(o){const r={code:o.code,host:o.host,players:o.players.map(p=>({id:p.id,name:p.name,online:false})),game:G[o.game]?o.game:'soft',levels:o.levels||[],format:'Groupe',mode:o.mode||'all',pick:o.pick||'answerer',turn:null,card:null,ans:{},used:{},count:o.count||0,dares:o.dares||{},ended:false,scores:o.scores||{},teams:o.teams||null};for(const p of r.players)GR[r.code+p.id]=setTimeout(()=>leaveP(r,p.id),GRACE*4);return r}
const SAVE=__dirname+'/data/rooms.json';let svT=null;
function save(){clearTimeout(svT);svT=setTimeout(()=>{try{fs.mkdirSync(__dirname+'/data',{recursive:true});fs.writeFileSync(SAVE,JSON.stringify(Object.values(rooms).map(r=>({...r,card:null,ans:{},used:{}}))))}catch(e){console.error(e)}},800)}
const s=http.createServer(app),io=new Server(s,{maxHttpBufferSize:4e6});const rooms={};try{for(const o of JSON.parse(fs.readFileSync(__dirname+'/data/rooms.json')))rooms[o.code]=restore(o)}catch(e){}
const code=()=>Array.from({length:4},()=>"ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.random()*32|0]).join('');
const rnd=a=>a[Math.random()*a.length|0],shuf=a=>a.map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
const nm=(r,id)=>(r.players.find(p=>p.id===id)||{}).name||'?';
const partner=()=>null;
function expected(r){const c=r.card;if(!c)return[];if(c.kind==='input'&&r.mode==='turn')return[c.target];if(c.kind==='rnp')return[c.target];if(['input','players','ab','quiz','number','purity','impostor','pmu'].includes(c.kind))return r.players.filter(p=>p.online!==false).map(p=>p.id);return[]}
function pub(r){save();const c=r.card;let card=null;if(c){card={...c};delete card.secret;delete card.tpl;delete card.correct;if(!c.revealed)delete card.result;card.answered=Object.keys(r.ans);card.expected=expected(r);card.done=roundDone(r);if(c.revealed)card.answers=Object.entries(r.ans).map(([id,v])=>({name:nm(r,id),v}));if(c.timerEnd)card.timerLeft=c.timerEnd-Date.now()}
 io.to(r.code).emit('state',{code:r.code,host:r.host,players:r.players,game:r.game,levels:r.levels,format:r.format,mode:r.mode,pick:r.pick,turn:r.turn,card,count:r.count,teams:r.teams,scores:r.scores,dares:r.dares,ended:r.ended,banned:r.banned||[],locked:!!r.locked});}
function reveal(r){const c=r.card;if(!c||c.revealed)return;c.revealed=true;
 if(c.kind==='quiz'){for(const[id,v]of Object.entries(r.ans))if(v===c.correct)r.scores[nm(r,id)]=(r.scores[nm(r,id)]||0)+1;c.result='Bonne réponse : '+c.correct}
 if(c.kind==='impostor')c.result=`L'imposteur était ${nm(r,c.secret.imp)} ! Mot des civils : « ${c.secret.a} », mot de l'imposteur : « ${c.secret.b} ».`;
 if(c.kind==='number'){const v=Object.values(r.ans).map(Number).filter(x=>!isNaN(x));c.result=v.length?'Moyenne : '+(v.reduce((a,b)=>a+b,0)/v.length).toFixed(1)+'/10':''}
 if(c.kind==='purity'){c.result='Score de pureté : '+Object.entries(r.ans).map(([id,v])=>`${nm(r,id)} ${Math.max(0,100-Math.round(v*100/G.purete.levels.Classique.length))}%`).join(' · ')}
 if(c.kind==='rnp'){const g=r.ans[c.target];const red=s=>'♥♦'.includes(s);const d=()=>rnd(['A','2','3','4','5','6','7','8','9','10','V','D','R'])+rnd('♥♦♣♠'.split(''));let cards=[d()];if(g==='Purple')cards.push(d());
  const reds=cards.filter(x=>red(x.slice(-1))).length;const win=g==='Rouge'?reds===1:g==='Noir'?reds===0:reds===1;c.result=`${cards.join('  ')} → ${win?'Gagné ! '+nm(r,c.target)+' distribue '+(g==='Purple'?4:2)+' gorgées':'Perdu ! '+nm(r,c.target)+' boit '+(g==='Purple'?4:2)+' gorgées'}`}}
function checkAll(r){const e=expected(r);if(e.length&&e.every(id=>id in r.ans)&&r.card.kind!=='pmu')reveal(r)}
function roundDone(r){const c=r.card;if(!c||r.ended)return true;if(['timer','team','circle'].includes(c.kind))return true;return !!c.revealed}
function nextTarget(r){const ids=r.players.map(p=>p.id);if(r.mode==='turn'){if(!r.turn||!ids.includes(r.turn))r.turn=rnd(ids);return r.turn}return rnd(ids)}
function draw(r){const g=G[r.game],kind=kindOf(r.game);r.ans={};const lv=r.levels.filter(l=>g.levels[l]);if(!lv.length)lv.push(Object.keys(g.levels)[0]);const l=rnd(lv);
 let pool=g.levels[l];if(r.players.length<2){const f=pool.filter(x=>!x.includes('{q}'));if(f.length)pool=f}
 const key=r.game+l;r.used[key]=r.used[key]||new Set();if(r.used[key].size>=pool.length)r.used[key].clear();let t;do t=rnd(pool);while(r.used[key].has(t)&&r.used[key].size<pool.length);r.used[key].add(t);
 const on=r.players.filter(p=>p.online!==false),ids=(on.length?on:r.players).map(p=>p.id);let target;
 if(kind==='circle'||kind==='rnp'){r.ci=((r.ci??-1)+1)%ids.length;target=ids[r.ci]}else target=nextTarget(r);if(r.forceT&&ids.includes(r.forceT)&&!['circle','rnp'].includes(kind))target=r.forceT;
 let q=partner(r,target);if(!q){const o=ids.filter(x=>x!==target);q=o.length?rnd(o):null}
 let text=t.replaceAll('{p}',nm(r,target)).replaceAll('{q}',q?nm(r,q):"quelqu'un de ton choix"),opts=null,c={id:Date.now(),level:l,kind,target,partner:q,revealed:false};

 if(kind==='ab'){if(r.game==='jamais')opts=["Je l'ai déjà fait 🍻","Jamais 😇"];else{const p=text.replace(/^Tu préfères /,'').replace(/ \?$/,'').split(' ||| ');if(r.game==='ouinon'){text=p[0];opts=[p[1],p[2]]}else{text='Tu préfères…';opts=[p[0],p[1]]}}}
 if(r.game==='av'&&text.startsWith('Action'))c.kind='dare';
 if(kind==='quiz'){const p=text.split(' ||| ');text=p[0];c.correct=p[1];opts=shuf(p.slice(1))}
 if(kind==='timer'){c.timerEnd=Date.now()+9000}
 if(kind==='team'){if(!r.teams||Object.keys(r.teams).length!==ids.length){r.teams={};shuf(ids).forEach((id,i)=>r.teams[id]=i%2?'Rouge':'Bleue');r.scores={Bleue:0,Rouge:0}}r.tt=r.tt==='Bleue'?'Rouge':'Bleue';text=text.replace('{t}',r.tt)}
 if(kind==='purity'){text='Coche en secret tout ce que tu as déjà fait. Seul ton score sera révélé.'}
 if(kind==='impostor'){let [a,b]=t.split('|');if(Math.random()<.5)[a,b]=[b,a];const imp=rnd(ids);c.secret={a,b,imp};text='Chacun a reçu un mot secret. À tour de rôle, décrivez-le en un mot, puis votez pour l\'imposteur !';opts=null;for(const id of ids)io.to('p:'+id).emit('secret',id===imp?b:a)}
 if(kind==='rnp'){text=`${nm(r,target)}, rouge, noir ou purple ?`;opts=['Rouge','Noir','Purple']}
 if(kind==='pmu'){text='Pariez sur votre as ! Puis l\'hôte retourne les cartes.';opts=['♥','♦','♣','♠'];c.pmu={h:{'♥':0,'♦':0,'♣':0,'♠':0},last:null,winner:null}}
 if(c.kind==='dare'&&t.includes('{q}')&&/envoie|envoyer|vocal|photo|vidéo|message|texto|sexto|selfie|émoji|appel|écris à/i.test(t)&&ids.length>1){c.send=true;c.tpl=t.replaceAll('{p}',nm(r,target));text=c.tpl.replaceAll('{q}','…');c.sendTo=null}
 c.text=text;c.opts=opts;r.card=c;r.count++;}
io.on('connection',so=>{so.emit('ver',VER);let r=null,me=null;const H=()=>r&&r.host===me;let emoT=[];
 const join=(room,name,pid)=>{const id0=String(pid||so.id).slice(0,40);room.banned=room.banned||[];if(room.banned.some(b=>b.id===id0))return so.emit('kicked',"Tu as été exclu de cette salle par l'hôte.");if(room.locked&&!room.players.some(p=>p.id===id0))return so.emit('err','Cette salle est verrouillée par l\'hôte : impossible de la rejoindre pour le moment.');if(r&&r!==room)so.leave(r.code);r=room;me=String(pid||so.id).slice(0,40);so.join(r.code);so.join('p:'+me);let p=r.players.find(p=>p.id===me);if(p){p.online=true;clearTimeout(GR[r.code+me]);if(name)p.name=String(name).slice(0,20)}else{p={id:me,name:String(name||'Anonyme').slice(0,20),online:true};r.players.push(p)}so.emit('joined',r.code);pub(r);if(r.card&&r.card.secret)so.emit('secret',me===r.card.secret.imp?r.card.secret.b:r.card.secret.a)};
 so.on('create',({name,game,levels,format,pid})=>{if(!G[game])return;let c;do c=code();while(rooms[c]);rooms[c]={code:c,host:String(pid||so.id).slice(0,40),players:[],game,levels:levels||[],format:format||'Groupe',mode:'all',pick:'answerer',turn:null,card:null,ans:{},used:{},count:0,dares:{},ended:false,banned:[],locked:false,scores:{}};join(rooms[c],name,pid);});
 so.on('join',({code,name,pid,snap})=>{code=String(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'');let room=rooms[code];if(!room&&snap&&snap.code===code&&Array.isArray(snap.players)){room=rooms[code]=restore(snap)}if(!room)return so.emit('err',`Aucune salle avec le code ${code||'?'}. Vérifie le code, ou demande à l'hôte de rouvrir la partie (une salle peut disparaître si le serveur gratuit a redémarré).`);join(room,name,pid);});
 so.on('settings',o=>{if(!H())return;if(o.game&&G[o.game]&&o.game!==r.game){r.game=o.game;r.levels=[Object.keys(G[o.game].levels)[0]];r.card=null;r.scores={};r.teams=null}if(o.levels)r.levels=o.levels;for(const k of['format','mode','pick'])if(o[k])r[k]=o[k];pub(r);});
 so.on('end',()=>{if(H()){r.ended=true;pub(r)}});
 so.on('next',()=>{if(H()&&roundDone(r)){r.ended=false;draw(r);pub(r);}});
 so.on('joker',()=>{if(r&&r.card){draw(r);pub(r);}});
 so.on('answer',v=>{if(!r||!r.card||r.card.revealed)return;r.ans[me]=typeof v==='number'?v:String(v).slice(0,300);if(r.card.kind==='rnp'&&me!==r.card.target)delete r.ans[me];checkAll(r);pub(r);});
 so.on('reveal',()=>{if(H()&&r.card){reveal(r);pub(r);}});
 so.on('pickNext',id=>{if(!r||!r.card||!r.players.some(p=>p.id===id))return;if(me===r.card.target||H()){r.turn=id;draw(r);pub(r);}});
 so.on('randNext',()=>{if(H()&&roundDone(r)){const o=r.players.map(p=>p.id).filter(x=>x!==r.turn);r.turn=o.length?rnd(o):r.turn;draw(r);pub(r);}});
 so.on('pmuDraw',()=>{if(!H()||!r.card||r.card.kind!=='pmu'||r.card.pmu.winner)return;const p=r.card.pmu,su=rnd(['♥','♦','♣','♠']);p.h[su]++;p.last=su;if(p.h[su]>=6){p.winner=su;r.card.revealed=true;const w=Object.entries(r.ans).filter(([,v])=>v===su).map(([id])=>nm(r,id));r.card.result=`L'as ${su} gagne ! ${w.length?w.join(', ')+' distribue(nt) 5 gorgées':'Personne n\'avait parié dessus'} — les autres boivent 2 gorgées.`}pub(r);});
 so.on('teamPoint',t=>{if(H()&&r.scores&&t in r.scores){r.scores[t]++;pub(r);}});
 const res=(ok)=>{if(!r||!r.card||r.card.kind!=='dare'||r.card.revealed)return;if(r.card.send){if(!r.card.sendTo)return;if(me!==r.card.sendTo)return}else if(me!==r.card.target&&!H())return;r.card.revealed=true;const dn=nm(r,r.card.target);r.dares[dn]=r.dares[dn]||{ok:0,fail:0};r.dares[dn][ok?'ok':'fail']++;r.card.result=ok?`✅ ${nm(r,r.card.target)} a relevé le défi !`:`❌ ${nm(r,r.card.target)} n'a pas relevé le défi`;io.to(r.code).emit('toast',r.card.result);pub(r)};so.on('done',()=>res(true));so.on('fail',()=>res(false));
 so.on('sendTo',id=>{const c=r&&r.card;if(!c||!c.send||c.sendTo||me!==c.target||id===me||!r.players.some(p=>p.id===id))return;c.sendTo=id;c.text=`📤 ${nm(r,c.target)} envoie à ${nm(r,id)} — `+c.tpl.replaceAll('{q}',nm(r,id));pub(r)});
 so.on('host',({act,id})=>{if(!H())return;const p=r.players.find(p=>p.id===id);const on=r.players.filter(p=>p.online!==false);
  if(act==='kick'&&p&&id!==me){r.players=r.players.filter(x=>x.id!==id);r.banned.push({id,name:p.name});io.to('p:'+id).emit('kicked',"Tu as été exclu de cette salle par l'hôte.");io.in('p:'+id).socketsLeave(r.code);delete r.ans[id];if(r.card)checkAll(r);io.to(r.code).emit('toast',`🚪 ${p.name} a été exclu`)}
  if(act==='unban'){r.banned=r.banned.filter(b=>b.id!==id)}
  if(act==='makeHost'&&p){r.host=id;io.to(r.code).emit('toast',`👑 ${p.name} est maintenant l'hôte`)}
  if(act==='skip'&&r.card){const o=on.filter(x=>x.id!==r.card.target);const t=o.length?rnd(o).id:null;if(r.mode==='turn'&&t)r.turn=t;r.forceT=t;draw(r);r.forceT=null}
  if(act==='force'&&r.card){if(r.card.kind==='dare'&&!r.card.revealed){r.card.revealed=true;r.card.result='⏭️ Passé par l\'hôte'}else reveal(r);r.card.revealed=true}
  if(act==='reset'){r.dares={};for(const k in r.scores)r.scores[k]=0;if(!r.teams)r.scores={};io.to(r.code).emit('toast','🔄 Scores remis à zéro')}
  if(act==='lock'){r.locked=!r.locked;io.to(r.code).emit('toast',r.locked?'🔒 Salle verrouillée':'🔓 Salle ouverte')}
  if(act==='end'){r.ended=true}
  pub(r)});
 so.on('emo',e=>{if(!r||!me)return;const now=Date.now();emoT=emoT.filter(t=>now-t<10000);if(emoT.length>=8||(emoT.length&&now-emoT[emoT.length-1]<600))return;if(!EMO.includes(e))return;emoT.push(now);io.to(r.code).emit('emo',{e,name:nm(r,me)})});
 so.on('disconnect',()=>{if(!r||!me)return;const p=r.players.find(p=>p.id===me);if(!p)return;const sockets=io.sockets.adapter.rooms.get('p:'+me);if(sockets&&sockets.size)return;p.online=false;if(r.card)checkAll(r);pub(r);const room=r,id=me;GR[room.code+id]=setTimeout(()=>leaveP(room,id),GRACE)});});
s.listen(process.env.PORT||3000,()=>console.log('ok'));
