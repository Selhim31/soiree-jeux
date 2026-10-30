const so=io(),$=i=>document.getElementById(i);let GAMES=[],cur=null,selLv=[],selFmt='Groupe',S=null,pendingGate=null;
const FMTS=['Solo','Couple','Trio','Groupe'],SAFE=['Classique','Halloween'];
const esc=s=>String(s).replace(/[&<>"']/g,m=>'&#'+m.charCodeAt(0)+';');
const adultOk=()=>localStorage.adult==='1';
function gate(cb){if(adultOk())return cb();pendingGate=cb;$('gate').classList.remove('hide')}
function gateOk(){localStorage.adult='1';$('gate').classList.add('hide');pendingGate&&pendingGate();pendingGate=null}
function gateNo(){$('gate').classList.add('hide');pendingGate=null}
function show(v){['home','game','room'].forEach(x=>$('v-'+x).classList.toggle('hide',x!==v));scrollTo(0,0)}
$('name').value=localStorage.pseudo||'';
fetch('/api/games').then(r=>r.json()).then(g=>{GAMES=g;$('games').innerHTML=g.map(x=>`<div class=gcard onclick="openGame('${x.id}')"><img src="${x.img}" loading=lazy alt=""><div class=lbl>${esc(x.name)}<small>${Object.values(x.levels).reduce((a,b)=>a+b,0)} cartes · ${Object.keys(x.levels).length} niveaux</small></div>${x.adult?'<span class=badge>18+</span>':''}</div>`).join('')});
function openGame(id){const g=GAMES.find(x=>x.id===id);const go=()=>{cur=g;selLv=[Object.keys(g.levels)[0]];$('g-img').src=g.img;$('g-name').textContent=g.name;$('g-desc').textContent=g.desc;renderSel('g');show('game')};g.adult?gate(go):go()}
function renderSel(p){const g=p==='g'?cur:GAMES.find(x=>x.id===S.game);const lv=p==='g'?selLv:S.levels,fm=p==='g'?selFmt:S.format;
$(p+'-levels').innerHTML=Object.entries(g.levels).map(([l,n])=>`<button class="chip ${lv.includes(l)?'on':''}" onclick="tl('${p}','${l}')">${SAFE.includes(l)?'':'🔥 '}${l}<small>${n}</small></button>`).join('');
$(p+'-format').innerHTML=FMTS.map(f=>`<button class="chip ${fm===f?'on':''}" onclick="tf('${p}','${f}')">${{Solo:'🙋',Couple:'💑',Trio:'👥',Groupe:'🎉'}[f]} ${f}</button>`).join('')}
function tl(p,l){const doIt=()=>{let a=[...(p==='g'?selLv:S.levels)];a=a.includes(l)?a.filter(x=>x!==l):[...a,l];if(!a.length)return;if(p==='g'){selLv=a;renderSel('g')}else so.emit('settings',{levels:a})};SAFE.includes(l)?doIt():gate(doIt)}
function tf(p,f){if(p==='g'){selFmt=f;renderSel('g')}else so.emit('settings',{format:f})}
function pseudo(){const n=$('name').value.trim();if(!n){show('home');$('err').textContent='Entre ton pseudo d\'abord 🙂';$('name').focus();return null}localStorage.pseudo=n;return n}
function createRoom(){const n=pseudo();if(n)so.emit('create',{name:n,game:cur.id,levels:selLv,format:selFmt})}
function joinRoom(c){const n=pseudo();if(n)so.emit('join',{code:c||$('code').value.trim(),name:n})}
so.on('err',e=>{$('err').textContent=e;show('home')});
so.on('joined',c=>{history.replaceState(null,'','/?r='+c);const l=location.origin+'/?r='+c;$('r-link').value=l;$('r-qr').src='/qr/'+c+'.png';show('room')});
const qs=new URLSearchParams(location.search).get('r');if(qs){$('code').value=qs;if(localStorage.pseudo)setTimeout(()=>joinRoom(qs),300);else $('err').textContent='Entre ton pseudo puis « Rejoindre » pour entrer dans la salle '+qs}
function toggleInvite(){$('invite').classList.toggle('hide')}
function copyLink(){navigator.clipboard.writeText($('r-link').value);$('r-link').value='✓ Copié !';setTimeout(()=>$('r-link').value=location.origin+'/?r='+S.code,1200)}
function shareLink(){navigator.share?navigator.share({title:'Soirée Jeux',text:'Rejoins ma partie !',url:$('r-link').value}):copyLink()}
function leave(){location.href='/'}
so.on('state',s=>{const first=!S;S=s;if(first&&s.host===so.id)$('invite').classList.remove('hide');render()});
