const ME=localStorage.pid||(localStorage.pid=(self.crypto&&crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2)+Date.now()));
const MYVER=(document.querySelector('meta[name=app-version]')||{}).content;
const so=io(),$=i=>document.getElementById(i);let GAMES=[],cur=null,selLv=[],selFmt='Groupe',S=null,pendingGate=null;
const SAFE=['Classique','Halloween'];
const esc=s=>String(s).replace(/[&<>"']/g,m=>'&#'+m.charCodeAt(0)+';');
const adultOk=()=>localStorage.adult==='1';
function gate(cb){if(adultOk())return cb();pendingGate=cb;$('gate').classList.remove('hide')}
function gateOk(){localStorage.adult='1';$('gate').classList.add('hide');pendingGate&&pendingGate();pendingGate=null}
function gateNo(){$('gate').classList.add('hide');pendingGate=null}
function show(v){['home','game','room'].forEach(x=>$('v-'+x).classList.toggle('hide',x!==v));scrollTo(0,0)}
$('name').value=localStorage.pseudo||'';
let FAMS=[];Promise.all([fetch('/api/games').then(r=>r.json()),fetch('/api/families').then(r=>r.json())]).then(([g,f])=>{GAMES=g;FAMS=f;showFams()});
function showFams(){$('fam-back').classList.add('hide');$('sec-title').textContent='Choisis une famille de jeux';$('games').innerHTML=FAMS.map(f=>{const gs=f.games.map(id=>GAMES.find(x=>x.id===id)).filter(Boolean);return `<div class=gcard onclick="openFam('${f.id}')"><img src="${gs[0].img}" alt=""><div class=lbl>${f.emoji} ${esc(f.name)}<small>${gs.length} jeux · ${esc(f.desc)}</small></div>${f.adult?'<span class=badge>18+</span>':''}</div>`}).join('')}
function openFam(id){const f=FAMS.find(x=>x.id===id);const go=()=>{$('fam-back').classList.remove('hide');$('sec-title').textContent=f.emoji+' '+f.name;renderGames(f.games.map(id=>GAMES.find(x=>x.id===id)).filter(Boolean));scrollTo(0,0)};f.adult?gate(go):go()}
function renderGames(g){$('games').innerHTML=g.map(x=>`<div class=gcard onclick="openGame('${x.id}')"><img src="${x.img}" loading=lazy alt=""><div class=lbl>${esc(x.name)}<small>${Object.values(x.levels).reduce((a,b)=>a+b,0)} cartes · ${Object.keys(x.levels).length} niveaux</small></div>${x.adult?'<span class=badge>18+</span>':''}</div>`).join('')}
function openGame(id){const g=GAMES.find(x=>x.id===id);const go=()=>{cur=g;selLv=[Object.keys(g.levels)[0]];$('g-img').src=g.img;$('g-name').textContent=g.name;$('g-desc').textContent=g.desc;renderSel('g');show('game')};g.adult?gate(go):go()}
function renderSel(p){const g=p==='g'?cur:GAMES.find(x=>x.id===S.game);const lv=p==='g'?selLv:S.levels,fm=p==='g'?selFmt:S.format;
$(p+'-levels').innerHTML=Object.entries(g.levels).map(([l,n])=>`<button class="chip ${lv.includes(l)?'on':''}" onclick="tl('${p}','${l}')">${SAFE.includes(l)?'':'🔥 '}${l}<small>${n}</small></button>`).join('');
}
function tl(p,l){const doIt=()=>{let a=[...(p==='g'?selLv:S.levels)];a=a.includes(l)?a.filter(x=>x!==l):[...a,l];if(!a.length)return;if(p==='g'){selLv=a;renderSel('g')}else so.emit('settings',{levels:a})};SAFE.includes(l)?doIt():gate(doIt)}
function pseudo(){const n=$('name').value.trim();if(!n){show('home');$('err').textContent='Entre ton pseudo d\'abord 🙂';$('name').focus();return null}localStorage.pseudo=n;return n}
function createRoom(){const n=pseudo();if(!n)return;const g=(($('grp')||{}).value||'').trim();let gs=null;try{localStorage.grpc=g;gs=g?JSON.parse(localStorage['gb:'+g.toLowerCase()]||'null'):null}catch(e){}so.emit('create',{name:n,game:cur.id,levels:selLv,format:selFmt,pid:ME,group:g,gsnap:gs})}
function joinRoom(c){const n=pseudo();if(n){const code=String(c||$('code').value).toUpperCase().replace(/[^A-Z0-9]/g,'');if(code.length<4){$('err').textContent='Le code de salle fait 4 caractères 🙂';return}$('err').textContent=so.connected?'Recherche de la salle '+code+'…':'Connexion au serveur… (peut prendre ~30 s s\'il dormait)';let snap=null;try{snap=JSON.parse(localStorage.snap||'null')}catch(e){}so.emit('join',{code,name:n,pid:ME,snap:snap&&snap.code===code?snap:null})}}
so.on('err',e=>{localStorage.removeItem('room');$('err').textContent='❌ '+e;show('home')});
so.on('joined',c=>{localStorage.room=c;history.replaceState(null,'','/?r='+c);const l=location.origin+'/?r='+c;$('r-link').value=l;$('r-qr').src='/qr/'+c+'.png';show('room')});
const qs=new URLSearchParams(location.search).get('r');so.on('connect',()=>{const c=qs||localStorage.room;if(c&&localStorage.pseudo)joinRoom(c)});
if(qs){$('code').value=qs;if(localStorage.pseudo){}else $('err').textContent='Entre ton pseudo puis « Rejoindre » pour entrer dans la salle '+qs}
function toggleInvite(){$('invite').classList.toggle('hide')}
function copyLink(){navigator.clipboard.writeText($('r-link').value);$('r-link').value='✓ Copié !';setTimeout(()=>$('r-link').value=location.origin+'/?r='+S.code,1200)}
function shareLink(){navigator.share?navigator.share({title:'Soirée Jeux',text:'Rejoins ma partie !',url:$('r-link').value}):copyLink()}
function leave(){localStorage.removeItem('room');localStorage.removeItem('snap');location.href='/'}
so.on('state',s=>{const first=!S;S=s;try{if(s.gboard&&s.host===ME&&localStorage.grpc)localStorage['gb:'+localStorage.grpc.toLowerCase()]=JSON.stringify(s.gboard.map(e=>({name:e.name,pts:e.pts})))}catch(e){}try{localStorage.snap=JSON.stringify({code:s.code,host:s.host,players:s.players.map(p=>({id:p.id,name:p.name})),game:s.game,levels:s.levels,mode:s.mode,pick:s.pick,dares:s.dares,scores:s.scores,teams:s.teams,count:s.count,board:s.board})}catch(e){}if(first&&s.host===ME)$('invite').classList.remove('hide');render()});

$('code').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();joinRoom()}});
$('code').addEventListener('input',e=>{const v=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'');if(v!==e.target.value)e.target.value=v});
$('name').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('code').value?joinRoom():$('code').focus()}});

so.on('ver',v=>{if(MYVER&&v&&v!==MYVER)location.reload()});
