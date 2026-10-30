const express=require('express'),http=require('http'),fs=require('fs'),QR=require('qrcode'),{Server}=require('socket.io');
const G={};for(const f of fs.readdirSync(__dirname+'/content'))G[f.replace('.json','')]=JSON.parse(fs.readFileSync(__dirname+'/content/'+f));
const ORDER=["soft","amis","coquin","hot","couple","defis","qui","jamais","av","tupreferes","verite","confessions","debats","mime","halloween"];
const app=express();app.use(express.static(__dirname+'/public',{maxAge:'1h'}));
app.get('/api/games',(q,r)=>r.json(ORDER.filter(k=>G[k]).map(k=>({id:k,name:G[k].name,desc:G[k].desc,img:G[k].img,adult:G[k].adult,vote:G[k].vote||null,levels:Object.fromEntries(Object.entries(G[k].levels).map(([l,v])=>[l,v.length]))}))));
app.get('/qr/:code.png',async(q,r)=>{const u=`${q.protocol}://${q.get('host')}/?r=${encodeURIComponent(q.params.code)}`;r.type('png').send(await QR.toBuffer(u,{margin:1,width:300,color:{dark:'#1a0b2e',light:'#ffffff'}}))});
app.set('trust proxy',true);
const s=http.createServer(app),io=new Server(s);const rooms={};
const code=()=>Array.from({length:4},()=>"ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.random()*32|0]).join('');
const rnd=a=>a[Math.random()*a.length|0];
function pub(r){io.to(r.code).emit('state',{code:r.code,host:r.host,players:r.players,game:r.game,levels:r.levels,format:r.format,card:r.card,votes:r.votes,count:r.count});}
function draw(r){const g=G[r.game];const lv=r.levels.filter(l=>g.levels[l]);if(!lv.length)lv.push(Object.keys(g.levels)[0]);
 const l=rnd(lv);let pool=g.levels[l];if(r.format==='Solo')pool=pool.filter(x=>!x.includes('{q}'))||pool;if(!pool.length)pool=g.levels[l];
 const key=r.game+l;r.used[key]=r.used[key]||new Set();if(r.used[key].size>=pool.length)r.used[key].clear();
 let t;do t=rnd(pool);while(r.used[key].has(t)&&r.used[key].size<pool.length);r.used[key].add(t);
 const ps=r.players.map(p=>p.name);const p=rnd(ps);const others=ps.filter(x=>x!==p);const q=others.length?rnd(others):'quelqu\'un de ton choix';
 let text=t.replaceAll('{p}',p).replaceAll('{q}',q),opts=null;if(g.vote==='ab'){const m=text.match(/^Tu préfères (.*) \|\|\| (.*) \?$/);if(m){opts=[m[1],m[2]];text='Tu préfères…'}}
 r.card={level:l,text,opts,vote:g.vote||null,id:Date.now()};r.votes={};r.count++;}
io.on('connection',so=>{let r=null;
 const join=(room,name)=>{r=room;so.join(r.code);r.players=r.players.filter(p=>p.id!==so.id);r.players.push({id:so.id,name:String(name||'Anonyme').slice(0,20)});so.emit('joined',r.code);pub(r);};
 so.on('create',({name,game,levels,format})=>{if(!G[game])return;let c;do c=code();while(rooms[c]);rooms[c]={code:c,host:so.id,players:[],game,levels:levels||[],format:format||'Groupe',card:null,votes:{},used:{},count:0};join(rooms[c],name);});
 so.on('join',({code,name})=>{const room=rooms[String(code||'').toUpperCase()];if(!room)return so.emit('err','Salle introuvable');join(room,name);});
 so.on('settings',({game,levels,format})=>{if(r&&r.host===so.id){if(G[game])r.game=game;if(levels)r.levels=levels;if(format)r.format=format;pub(r);}});
 so.on('next',()=>{if(r&&r.host===so.id){draw(r);pub(r);}});
 so.on('joker',()=>{if(r&&r.card){draw(r);pub(r);}});
 so.on('vote',v=>{if(r&&r.card&&r.card.vote){r.votes[so.id]=String(v).slice(0,40);pub(r);}});
 so.on('disconnect',()=>{if(!r)return;r.players=r.players.filter(p=>p.id!==so.id);if(!r.players.length){const c=r.code;setTimeout(()=>{if(rooms[c]&&!rooms[c].players.length)delete rooms[c]},600000);return}if(r.host===so.id)r.host=r.players[0].id;pub(r);});});
s.listen(process.env.PORT||3000,()=>console.log('ok'));
