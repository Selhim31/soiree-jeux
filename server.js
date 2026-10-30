const express=require('express'),http=require('http'),{Server}=require('socket.io');const C=require('./content');
const app=express();app.use(express.static(__dirname+'/public'));const s=http.createServer(app),io=new Server(s);
const rooms={};const code=()=>Math.random().toString(36).slice(2,6).toUpperCase();
const cats=Object.fromEntries(Object.entries(C).map(([k,v])=>[k,{name:v.name,emoji:v.emoji,adult:v.adult,n:v.items.length}]));
function pub(r){io.to(r.code).emit('state',{code:r.code,host:r.host,players:r.players,cats:r.cats,card:r.card,votes:r.votes});}
function draw(r){const ks=r.cats.length?r.cats:['soft'];const k=ks[Math.random()*ks.length|0];const c=C[k];
 const ps=r.players.map(p=>p.name);const p=ps[Math.random()*ps.length|0];const q=ps.filter(x=>x!==p)[Math.random()*(ps.length-1)|0]||p;
 r.card={cat:k,catName:c.name,emoji:c.emoji,vote:!!c.vote,text:c.items[Math.random()*c.items.length|0].replace('{p}',p).replace('{q}',q)};r.votes={};}
io.on('connection',so=>{let r=null;so.emit('cats',cats);
 const join=(room,name)=>{r=room;so.join(r.code);r.players=r.players.filter(p=>p.id!==so.id);r.players.push({id:so.id,name:String(name).slice(0,20)});pub(r);};
 so.on('create',name=>{let c;do c=code();while(rooms[c]);rooms[c]={code:c,host:so.id,players:[],cats:['soft','amis'],card:null,votes:{}};join(rooms[c],name);});
 so.on('join',({code,name})=>{const room=rooms[(code||'').toUpperCase()];if(!room)return so.emit('err','Salle introuvable');join(room,name);});
 so.on('cats',cs=>{if(r&&r.host===so.id){r.cats=cs.filter(c=>C[c]);pub(r);}});
 so.on('next',()=>{if(r&&r.host===so.id){draw(r);pub(r);}});
 so.on('vote',v=>{if(r&&r.card&&r.card.vote){r.votes[so.id]=v;pub(r);}});
 so.on('disconnect',()=>{if(!r)return;r.players=r.players.filter(p=>p.id!==so.id);if(!r.players.length)return delete rooms[r.code];if(r.host===so.id)r.host=r.players[0].id;pub(r);});});
s.listen(process.env.PORT||3000,()=>console.log('ok'));
