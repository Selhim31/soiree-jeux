const ME=localStorage.pid||(localStorage.pid=(self.crypto&&crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2)+Date.now()));
const MYVER=(document.querySelector('meta[name=app-version]')||{}).content;
const so=io(),$=i=>document.getElementById(i);let GAMES=[],cur=null,selLv=[],selFmt='Groupe',selLen=30,S=null,pendingGate=null;
const SAFE=['Classique','Halloween'];
const esc=s=>String(s).replace(/[&<>"']/g,m=>'&#'+m.charCodeAt(0)+';');
const adultOk=()=>localStorage.adult==='1';
function gate(cb){if(adultOk())return cb();pendingGate=cb;$('gate').classList.remove('hide')}
function gateOk(){localStorage.adult='1';$('gate').classList.add('hide');pendingGate&&pendingGate();pendingGate=null}
function gateNo(){$('gate').classList.add('hide');pendingGate=null}
function show(v){['home','game','room'].forEach(x=>$('v-'+x).classList.toggle('hide',x!==v));scrollTo(0,0)}
$('name').value=localStorage.pseudo||'';
let FAMS=[];Promise.all([fetch('/api/games').then(r=>r.json()),fetch('/api/families').then(r=>r.json())]).then(([g,f])=>{GAMES=g;FAMS=f;showFams()});
function showFams(){$('fam-back').classList.add('hide');$('sec-title').textContent='Choisis une catégorie de jeux';$('games').innerHTML=FAMS.map(f=>{const gs=f.games.map(id=>GAMES.find(x=>x.id===id)).filter(Boolean);return `<div class=gcard onclick="openFam('${f.id}')"><img src="${gs[0].img}" alt=""><div class=lbl>${f.emoji} ${esc(f.name)}<small>${gs.length} jeux · ${esc(f.desc)}</small></div>${f.adult?'<span class=badge>18+</span>':''}</div>`}).join('')}
function openFam(id){const f=FAMS.find(x=>x.id===id);const go=()=>{$('fam-back').classList.remove('hide');$('sec-title').textContent=f.emoji+' '+f.name;renderGames(f.games.map(id=>GAMES.find(x=>x.id===id)).filter(Boolean));scrollTo(0,0)};f.adult?gate(go):go()}
function renderGames(g){$('games').innerHTML=g.map(x=>`<div class=gcard onclick="openGame('${x.id}')"><img src="${x.img}" loading=lazy alt=""><div class=lbl>${esc(x.name)}<small>${Object.values(x.levels).reduce((a,b)=>a+b,0)} cartes · ${Object.keys(x.levels).length} niveaux</small></div>${x.adult?'<span class=badge>18+</span>':''}</div>`).join('')}
function openGame(id){const g=GAMES.find(x=>x.id===id);const go=()=>{cur=g;selLv=[Object.keys(g.levels)[0]];$('g-img').src=g.img;$('g-name').textContent=g.name;$('g-desc').textContent=g.desc;renderSel('g');show('game')};g.adult?gate(go):go()}
function renderSel(p){const g=p==='g'?cur:GAMES.find(x=>x.id===S.game);const lv=p==='g'?selLv:S.levels,fm=p==='g'?selFmt:S.format;
$(p+'-levels').innerHTML=Object.entries(g.levels).map(([l,n])=>`<button class="chip ${lv.includes(l)?'on':''}" onclick="tl('${p}','${l}')">${SAFE.includes(l)?'':'🔥 '}${l}<small>${n}</small></button>`).join('');
if(p==='g'&&$('g-len'))$('g-len').innerHTML=[[15,'⚡ Rapide','15 cartes'],[30,'🎲 Normale','30 cartes'],[50,'🌙 Longue','50 cartes'],[0,'♾️ Sans fin','']].map(([v,l,n])=>`<button class="chip ${selLen===v?'on':''}" onclick="selLen=${v};renderSel('g')">${l}${n?`<small>${n}</small>`:''}</button>`).join('');
}
function tl(p,l){const doIt=()=>{let a=[...(p==='g'?selLv:S.levels)];a=a.includes(l)?a.filter(x=>x!==l):[...a,l];if(!a.length)return;if(p==='g'){selLv=a;renderSel('g')}else so.emit('settings',{levels:a})};SAFE.includes(l)?doIt():gate(doIt)}
function pseudo(){const n=$('name').value.trim();if(!n){show('home');$('err').textContent='Entre ton pseudo d\'abord 🙂';$('name').focus();return null}localStorage.pseudo=n;return n}
function createRoom(){const n=pseudo();if(!n)return;const g=(($('grp')||{}).value||'').trim();let gs=null;try{localStorage.grpc=g;gs=g?JSON.parse(localStorage['gb:'+g.toLowerCase()]||'null'):null}catch(e){}so.emit('create',{name:n,game:cur.id,levels:selLv,format:selFmt,pid:ME,group:g,gsnap:gs,emo:myAv(),len:selLen})}
function joinRoom(c){const n=pseudo();if(n){const code=String(c||$('code').value).toUpperCase().replace(/[^A-Z0-9]/g,'');if(code.length<4){$('err').textContent='Le code de salle fait 4 caractères 🙂';return}$('err').textContent=so.connected?'Recherche de la salle '+code+'…':'Connexion au serveur… (peut prendre ~30 s s\'il dormait)';let snap=null;try{snap=JSON.parse(localStorage.snap||'null')}catch(e){}so.emit('join',{code,name:n,pid:ME,snap:snap&&snap.code===code?snap:null,emo:myAv()})}}
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

const AVS=[...new Intl.Segmenter().segment('🌹🦊🐍🍷💎👑🖤🔥🌙🦋🐺🍒😈🎭🃏🕯️🥀🐆🦚🐈‍⬛🍸🥂💋🗝️⚜️🦢🐉🌶️🎩💍')].map(x=>x.segment);
function myAv(){let a=localStorage.avatar;if(!AVS.includes(a)){a=AVS[Math.floor(Math.random()*AVS.length)];localStorage.avatar=a}return a}
function avPaint(){const b=document.getElementById('avbtn');if(b)b.textContent=myAv()}
function avPick(){let m=document.getElementById('avpick');if(m){m.remove();return}const taken=new Set(((typeof S!=='undefined'&&S&&S.players)||[]).filter(p=>p.id!==ME).map(p=>p.emo));m=document.createElement('div');m.id='avpick';m.innerHTML='<div class=avp-box><p class=avp-t>Choisis ton avatar</p><div class=avp-g>'+AVS.map(a=>'<button type=button class="avp-e'+(a===myAv()?' on':'')+(taken.has(a)?' tk':'')+'" '+(taken.has(a)?'disabled title="Déjà pris"':'')+' data-a="'+a+'">'+a+'</button>').join('')+'</div><button type=button class=btn2 onclick="avPick()">Fermer</button></div>';m.onclick=e=>{const a=e.target.dataset&&e.target.dataset.a;if(a){localStorage.avatar=a;avPaint();if(typeof S!=='undefined'&&S&&S.code)so.emit('avatar',a);m.remove()}else if(e.target===m)m.remove()};document.body.append(m)}
(function(){const n=document.getElementById('name');if(n&&!document.getElementById('avbtn')){const w=document.createElement('div');w.className='avrow';n.before(w);const b=document.createElement('button');b.type='button';b.id='avbtn';b.title='Changer d\'avatar';b.onclick=avPick;w.append(b,n);avPaint()}})();
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('#r-players .av');if(a&&typeof S!=='undefined'&&S&&S.players&&S.players.some(p=>p.id===ME&&p.name===a.title))avPick()});

so.on('state',s=>setTimeout(()=>cardDecor(s),0));
function cardDecor(s){const cd=document.querySelector('#r-card .card:not(.intro)');const c=s&&s.card;if(!cd||!c||s.ended)return;cd.classList.toggle('gold',!!c.gold);cd.classList.toggle('final',!!c.final);let b=cd.querySelector('.cnum');if(!b){b=document.createElement('div');b.className='cnum';cd.prepend(b)}const lab=c.total?`Carte ${c.num}/${c.total}`:`Carte ${c.num}`;b.innerHTML=`<span>${lab}</span>`+(c.gold?'<span class=gtag>✨ Carte en Or ✨ <small>points ×5</small></span>':'')+(c.final?`<span class=ftag>🏁 Dernière ligne droite <small>points ×2${c.num===c.total?' · dernière carte !':''}</small></span>`:'');if(window._lcid!==c.id){window._lcid=c.id;if(c.gold)goldFx(cd);if(c.gold&&typeof toastMsg==='function')toastMsg('✨ Carte en Or ✨ — points ×5');else if(c.final&&c.num===c.total-2&&typeof toastMsg==='function')toastMsg('🏁 Dernière ligne droite — points ×2 !')}}

function goldFx(cd){try{const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;cd.classList.remove('gold-in');void cd.offsetWidth;cd.classList.add('gold-in');setTimeout(()=>cd.classList.remove('gold-in'),2600);if(navigator.vibrate)try{navigator.vibrate([40,60,90])}catch(e){}if(rm)return;
const sw=document.createElement('div');sw.className='gsweep';cd.appendChild(sw);setTimeout(()=>sw.remove(),1700);
const r=cd.getBoundingClientRect(),L=document.createElement('div');L.className='gburst';L.style.left=(r.left+r.width/2)+'px';L.style.top=(r.top+Math.min(r.height,260)/2)+'px';document.body.appendChild(L);
for(let i=0;i<34;i++){const s=document.createElement('i');const a=Math.random()*Math.PI*2,d=90+Math.random()*150;s.style.setProperty('--x',Math.cos(a)*d+'px');s.style.setProperty('--y',Math.sin(a)*d*0.8-40+'px');s.style.setProperty('--r',(Math.random()*540-270)+'deg');s.style.setProperty('--d',(0.9+Math.random()*0.9)+'s');s.style.animationDelay=(Math.random()*0.25)+'s';s.className=Math.random()<0.4?'st':'cf';L.appendChild(s)}setTimeout(()=>L.remove(),2400)}catch(e){}}
