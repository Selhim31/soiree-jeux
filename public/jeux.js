// Jeux regroupés : option « réponse anonyme » pour Confessions.
if(typeof SAFE!=='undefined')SAFE.push('Mime','7 secondes');
(function(){let ANON=localStorage.anonRep==='1';
const _og=openGame;window.openGame=openGame=function(id){_og(id);let b=$('g-anon');if(!b){b=document.createElement('div');b.id='g-anon';$('grp').before(b)}const on=id==='confessions';b.classList.toggle('hide',!on);b.innerHTML=`<h3 class=sec>Réponses</h3><div class="chips seg"><button class="chip ${!ANON?'on':''}" onclick="anonSet(false)">👤 Avec les prénoms</button><button class="chip ${ANON?'on':''}" onclick="anonSet(true)">🎭 Réponse anonyme</button></div>`};
window.anonSet=v=>{ANON=v;localStorage.anonRep=v?'1':'0';openGame('confessions')};
const _cr=so.emit.bind(so);so.emit=function(ev,o,...a){if(ev==='create'&&o&&o.game==='confessions')o={...o,anon:ANON};return _cr(ev,o,...a)};
const _r=render;window.render=render=function(){_r();const s=S;let el=$('s-anon');if(s&&s.game==='confessions'&&s.host===ME){if(!el){el=document.createElement('div');el.id='s-anon';$('r-settings').appendChild(el)}el.innerHTML=`<p class=lbl2>Réponses</p><div class="chips seg"><button class="chip ${!s.anon?'on':''}" onclick="so.emit('settings',{anon:false})">👤 Avec les prénoms</button><button class="chip ${s.anon?'on':''}" onclick="so.emit('settings',{anon:true})">🎭 Anonymes</button></div>`}else if(el)el.remove()}})();
