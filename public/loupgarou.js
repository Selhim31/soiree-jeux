// Loup-Garou (classique + Hot) — interface. Le serveur est le narrateur ; ce fichier n'affiche que ce que le serveur envoie à CE joueur.
(function(){
let ME_LG=null,TICK=0,LEFT=0,LASTLOG=0,LASTPH='',SOUND=localStorage.lgSound==='1',HIDE=false,SEL=[],WI={heal:false,poison:null};
const st=document.createElement('style');st.textContent=`
#r-lg{margin:10px 0}.lg-b{border-radius:18px;padding:14px;margin:10px 0;background:rgba(10,12,30,.72);border:1px solid rgba(255,255,255,.12);box-shadow:0 8px 30px rgba(0,0,0,.35)}
.lg-hot .lg-b{background:rgba(40,6,18,.75);border-color:rgba(255,80,120,.3)}
.lg-phase{display:flex;justify-content:space-between;align-items:center;font-weight:800;font-size:1.15em}.lg-tm{font-variant-numeric:tabular-nums;opacity:.85;font-size:.9em}
.lg-role{text-align:center;padding:18px 12px;border-radius:20px;background:linear-gradient(160deg,#1e2350,#0b0d22);border:2px solid #c9a227;position:relative;cursor:pointer}
.lg-hot .lg-role{background:linear-gradient(160deg,#5a0f2a,#1a0610);border-color:#ff5c8a}
.lg-role .e{font-size:64px;line-height:1.1}.lg-role h3{margin:6px 0 4px;font-size:1.5em}.lg-role p{margin:4px 0;opacity:.9}.lg-role .camp{display:inline-block;margin-top:6px;padding:3px 10px;border-radius:99px;font-size:.8em;background:rgba(255,255,255,.12)}
.lg-role.hid .in{filter:blur(14px);user-select:none}.lg-role .tap{position:absolute;bottom:6px;right:12px;font-size:.75em;opacity:.6}
.lg-pl{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:8px;margin-top:8px}
.lg-p{border-radius:14px;padding:8px 4px;text-align:center;background:rgba(255,255,255,.06);border:2px solid transparent;cursor:pointer;font-size:.85em}
.lg-p .a{font-size:28px}.lg-p.dead{opacity:.45;filter:grayscale(.8);cursor:default}.lg-p.on{border-color:#ffd23f;background:rgba(255,210,63,.15)}.lg-p.dis{cursor:default}.lg-p small{display:block;opacity:.8}
.lg-log div{padding:4px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:.92em}.lg-log div:first-child{font-weight:700}
.lg-chat .m{font-size:.9em;padding:2px 0}.lg-chat .ms{max-height:150px;overflow:auto;margin-bottom:6px}.lg-chat .row{display:flex;gap:6px}.lg-chat input{flex:1}
.lg-dist{width:100%;border-collapse:collapse}.lg-dist td{padding:6px 4px;border-bottom:1px solid rgba(255,255,255,.07);vertical-align:top}.lg-dist td:first-child{font-size:24px;width:34px}.lg-dist small{opacity:.75}
.lg-dare{padding:12px;border-radius:14px;background:rgba(255,92,138,.14);border:1px dashed #ff5c8a;margin:8px 0}.lg-dare.gold{background:linear-gradient(135deg,rgba(212,175,55,.3),rgba(255,220,120,.12));border:2px solid #d4af37}
.lg-pod{display:flex;align-items:flex-end;justify-content:center;gap:8px;margin:10px 0}.lg-pod div{text-align:center;border-radius:12px 12px 0 0;background:rgba(255,210,63,.18);padding:8px 10px;min-width:78px}
body.lg-night .bg{filter:brightness(.45) hue-rotate(200deg)}
#r-lg+.stage:empty{display:none}`;document.head.appendChild(st);
so.on('lgme',o=>{ME_LG=o;if(S)draw()});so.on('err2',e=>toastMsg('⚠️ '+e));
const _render=render;window.render=render=function(){_render();try{draw()}catch(e){console.error(e)}};
const _og=openGame;window.openGame=openGame=function(id){_og(id);const g=GAMES.find(x=>x.id===id);const lg=g&&g.kind==='lg';['g-levels','g-len'].forEach(i=>{const e=$(i);if(e){e.classList.toggle('hide',lg);if(e.previousElementSibling)e.previousElementSibling.classList.toggle('hide',lg)}});let n=$('g-lgnote');if(lg&&!n){n=document.createElement('p');n.id='g-lgnote';n.className='small';$('g-len').after(n)}if(n){n.classList.toggle('hide',!lg);n.innerHTML='🐺 Dès 4 joueurs. Les rôles s\'adaptent automatiquement au nombre de joueurs : plus vous êtes, plus il y a de rôles. La partie se termine quand un camp gagne.'}};
const P=id=>(S.players.find(p=>p.id===id)||{name:'?',emo:'❔'});
const R=k=>(S.lg.RN||{})[k]||{name:k,emo:'❔',desc:''};
function speak(t){if(!SOUND||!window.speechSynthesis)return;try{const u=new SpeechSynthesisUtterance(t.replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/gu,''));u.lang='fr-FR';u.rate=1;speechSynthesis.speak(u)}catch(e){}}
function tone(night){if(!SOUND)return;try{const A=new (window.AudioContext||window.webkitAudioContext)(),o=A.createOscillator(),g=A.createGain();o.type='sine';o.frequency.value=night?110:440;o.frequency.exponentialRampToValueAtTime(night?70:660,A.currentTime+1.2);g.gain.value=.06;g.gain.exponentialRampToValueAtTime(.0001,A.currentTime+1.6);o.connect(g);g.connect(A.destination);o.start();o.stop(A.currentTime+1.7)}catch(e){}}
window.lgSound=()=>{SOUND=!SOUND;localStorage.lgSound=SOUND?'1':'0';draw()};window.lgHide=()=>{HIDE=!HIDE;draw()};
window.lg=(a,x={})=>so.emit('lg',{a,...x});
window.lgPick=id=>{const L=S.lg,o=ME_LG||{};if(L.ph==='night'&&L.step==='cupid'&&o.role==='cupidon'){SEL=SEL.includes(id)?SEL.filter(x=>x!==id):[...SEL,id].slice(-2);return draw()}if(L.ph==='night'&&L.step==='witch'&&o.role==='sorciere'){WI.poison=WI.poison===id?null:id;return draw()}SEL=[id];draw()};
function grid(sel,can,extra){const L=S.lg;return `<div class=lg-pl>${S.players.filter(p=>L.alive?p.id in L.alive:true).map(p=>{const dead=L.alive&&!L.alive[p.id];const ok=!dead&&can(p.id);const rv=(L.dead||{})[p.id]||(ME_LG&&ME_LG.roles&&ME_LG.roles[p.id])||(L.roles&&L.roles[p.id]);const mate=ME_LG&&ME_LG.mates&&ME_LG.mates.includes(p.id);
 return `<div class="lg-p ${dead?'dead':''} ${sel.includes(p.id)?'on':''} ${ok?'':'dis'}" ${ok?`onclick="lgPick('${p.id}')"`:''}><div class=a>${dead?'💀':p.emo||'🙂'}</div>${esc(p.name)}${p.id===ME?' (toi)':''}${mate?'<small>'+R('loup').emo+' allié</small>':''}${ME_LG&&ME_LG.lover===p.id?'<small>💘 amour</small>':''}${rv?`<small>${R(rv).emo} ${esc(R(rv).name)}</small>`:''}${extra?extra(p.id):''}</div>`}).join('')}</div>`}
function chatBox(ch,title,list,canWrite){let el=$('lg-ch-'+ch);const host=$('lg-chats');if(!list){if(el)el.remove();return}if(!el){el=document.createElement('div');el.id='lg-ch-'+ch;el.className='lg-b lg-chat';el.innerHTML=`<b class=t></b><div class=ms></div><div class=row><input maxlength=200 placeholder="Message…"><button class=btn2>➤</button></div>`;const inp=el.querySelector('input'),go=()=>{if(inp.value.trim()){lg('chat',{ch,txt:inp.value});inp.value=''}};el.querySelector('button').onclick=go;inp.onkeydown=e=>{if(e.key==='Enter')go()};host.appendChild(el)}
 el.querySelector('.t').textContent=title;const ms=el.querySelector('.ms');const h=list.map(m=>`<div class=m><b>${esc(m.n)}</b> : ${esc(m.txt)}</div>`).join('')||'<div class="m small">Aucun message.</div>';if(ms.dataset.h!==h){ms.innerHTML=h;ms.dataset.h=h;ms.scrollTop=1e6}el.querySelector('.row').classList.toggle('hide',!canWrite)}
function draw(){const s=S,L=s&&s.lg;let box=$('r-lg');const isLG=!!L;document.body.classList.toggle('lg-night',isLG&&L.ph==='night');
 if(!isLG){if(box)box.remove();const pr=$('r-pairs');if(pr)pr.classList.remove('hide');return}
 if(!box){box=document.createElement('div');box.id='r-lg';box.innerHTML='<div id=lg-main></div><div id=lg-chats></div>';document.querySelector('#v-room .stage').before(box)}
 box.classList.toggle('lg-hot',L.v==='hot');{const pr=$('r-pairs');if(pr)pr.classList.add('hide');document.querySelectorAll('#r-board p.small').forEach(e=>{if(/Joker/.test(e.textContent))e.classList.add('hide')})}document.body.classList.toggle('lg-hotb',L.v==='hot');
 ['r-next','r-joker'].forEach(i=>$(i)&&$(i).classList.add('hide'));const wt=$('r-wait');if(wt)wt.classList.add('hide');
 const stg=document.querySelector('#v-room .stage');if(stg)stg.classList.toggle('hide',!s.card);
 $('r-meta').textContent=`${L.v==='hot'?'🔥 Loup-Garou Hot':'🐺 Loup-Garou'} · ${s.players.length} joueur(s)`;
 const h=s.host===ME,o=ME_LG||{},me=ME,al=o.al;LEFT=Date.now()+L.left;
 if(L.ph+L.step!==LASTPH){if(LASTPH)tone(L.ph==='night');LASTPH=L.ph+L.step;SEL=[];WI={heal:false,poison:null}}
 const lastLog=L.log.length?L.log[L.log.length-1]:null;if(lastLog&&lastLog.t>LASTLOG){if(LASTLOG)L.log.filter(x=>x.t>LASTLOG).forEach(x=>speak(x.txt));LASTLOG=lastLog.t}
 let H='';const snd=`<button class=back onclick="lgSound()" title="Narrateur vocal et ambiance">${SOUND?'🔊':'🔇'}</button>`;
 if(L.ph==='lobby'){const D=L.dist||{};const n=L.players;
  H=`<div class=lg-b><div class=lg-phase><span>${L.v==='hot'?'🔥 Loup-Garou Hot':'🐺 Loup-Garou'} — préparation</span>${snd}</div>
  <p class=small>${n} joueur(s) connecté(s). ${n<L.min?`<b>Il faut au moins ${L.min} joueurs.</b>`:'Répartition des rôles pour cette partie :'}</p>
  ${n>=L.min?`<table class=lg-dist>${Object.entries(D).map(([k,c])=>`<tr><td>${R(k).emo}</td><td><b>${c>1?c+' × ':''}${esc(R(k).name)}</b> <small>· ${R(k).camp==='loups'?'camp des '+(L.v==='hot'?'Prédateurs':'loups'):'village'}</small><br><small>${esc(R(k).desc)}</small></td></tr>`).join('')}</table>`:''}
  <p class=small>Les rôles s'adaptent au nombre de joueurs : 4 = 1 ${esc(R('loup').name)}, ${esc(R('voyante').name)}, 2 ${esc(R('villageois').name)} · 5 = +${esc(R('sorciere').name)} · 6 = +${esc(R('chasseur').name)} · 8 = 2e ${esc(R('loup').name)} + Cupidon · 10 = +${esc(R('petitefille').name)} · 12 = 3e ${esc(R('loup').name)} · 13 = +${esc(R('salvateur').name)} · 15 = +${esc(R('ancien').name)}.</p>
  ${L.v==='hot'?'<p class=small>🔞 Adultes consentants uniquement. Tout gage peut être refusé. Les photos/vidéos passent uniquement par l\'envoi vue unique, avec l\'accord du destinataire.</p>':''}
  ${h?`<button class="btn big" ${n<L.min?'disabled style="opacity:.4"':''} onclick="lg('start')">🌙 Distribuer les rôles et commencer</button>`:'<p class=wait>L\'hôte lance la partie dès que tout le monde est là…</p>'}</div>`}
 else{const role=o.role,ri=role?R(role):null;const ttl=L.ph==='night'?`🌙 Nuit ${L.n}`:L.ph==='end'?'🏁 Fin de partie':`☀️ Jour ${L.day}`;
  const sub={night:{cupid:'Cupidon choisit les amoureux…',main:L.v==='hot'?'Les Prédateurs chassent, les rôles de nuit agissent…':'Les loups chassent, les rôles de nuit agissent…',witch:(L.v==='hot'?'L\'Infirmière coquine':'La Sorcière')+' prépare ses potions…'}[L.step]||'',day:'Débat',vote:'Vote du village',plead:'Plaidoirie de l\'accusé·e',final:'Verdict',hunter:R('chasseur').name+' : dernier geste',elim:'Dernier gage',end:''}[L.ph];
  H+=`<div class=lg-b><div class=lg-phase><span>${ttl} <small style="font-weight:400;opacity:.8">${esc(sub||'')}</small></span><span><span class=lg-tm id=lg-tm></span> ${snd}</span></div></div>`;
  if(ri)H+=`<div class="lg-role ${HIDE?'hid':''}" onclick="lgHide()"><div class=in><div class=e>${ri.emo}</div><div class=small>Ton rôle secret</div><h3>${esc(ri.name)}</h3><p>${esc(ri.desc)}</p><span class=camp>${ri.camp==='loups'?'Camp des '+(L.v==='hot'?'Prédateurs':'loups'):'Camp du village'}</span>
   ${o.mates&&o.mates.length?`<p>Tes alliés : ${o.mates.map(x=>esc(P(x).name)).join(', ')}</p>`:''}${o.lover?`<p>💘 Tu es amoureux·se de <b>${esc(P(o.lover).name)}</b> : vous vivez et mourrez ensemble.</p>`:''}${!al?'<p><b>💀 Tu es mort·e'+(L.v==='hot'?' — tu es maintenant un fantôme 👻':' — tu es spectateur')+'.</b></p>':''}</div><span class=tap>${HIDE?'👁️ toucher pour voir':'🙈 toucher pour cacher'}</span></div>`;
  // actions
  let act='';const A=Object.keys(L.alive||{}).filter(x=>L.alive[x]);
  if(L.ph==='night'&&al){
   if(L.step==='cupid'&&role==='cupidon'){act=`<p>💘 Choisis deux amoureux (tu peux te choisir).</p>${grid(SEL,()=>true)}<button class=btn ${SEL.length<2?'disabled style="opacity:.4"':''} onclick="lg('cupid',{ids:${esc(JSON.stringify(SEL))}})">Décocher les flèches</button>`}
   else if(L.step==='main'){
    if(role==='loup'){const tally={};Object.values(o.wv||{}).forEach(t=>{if(t)tally[t]=(tally[t]||0)+1});act=`<p>${R('loup').emo} Choisissez votre victime ${o.mates.length?'ensemble (majorité, égalité = hasard)':''}.</p>${grid(SEL.length?SEL:(o.wv&&o.wv[me]?[o.wv[me]]:[]),id=>!(o.mates||[]).includes(id)&&id!==me,id=>tally[id]?`<small>🗳️ ${tally[id]}</small>`:'')}<button class=btn ${!SEL.length?'disabled style="opacity:.4"':''} onclick="lg('wolf',{t:'${SEL[0]||''}'})">${o.wv&&me in o.wv?'Changer mon vote':'Valider la victime'}</button>`}
    else if(role==='voyante'){if(o.seerDare)act=`<div class=lg-dare>💋 ${esc(o.seerDare)}</div><button class=btn onclick="lg('seerOk')">✅ Défi relevé : révéler le rôle</button>`;else if(o.seerT)act=`<p>${R('voyante').emo} ${esc(P(o.seerT).name)} est : <b>${R(o.seen[o.seerT]).emo} ${esc(R(o.seen[o.seerT]).name)}</b></p>`;else act=`<p>${R('voyante').emo} Choisis un joueur dont tu veux découvrir le rôle${L.v==='hot'?' (un défi hot t\'attend d\'abord)':''}.</p>${grid(SEL,id=>id!==me)}<button class=btn ${!SEL.length?'disabled style="opacity:.4"':''} onclick="lg('seer',{t:'${SEL[0]||''}'})">Sonder</button>`}
    else if(role==='salvateur'){act=o.guard?`<p>${R('salvateur').emo} Tu protèges ${esc(P(o.guard).name)} cette nuit.</p>`:`<p>${R('salvateur').emo} Qui protèges-tu cette nuit ?</p>${grid(SEL,id=>id!==o.guardLast)}<button class=btn ${!SEL.length?'disabled style="opacity:.4"':''} onclick="lg('guard',{t:'${SEL[0]||''}'})">Protéger</button>`}
    else act=`<p class=small>😴 ${L.v==='hot'?'Tu dors… ou tu fais semblant.':'Tu dors. Attends le lever du jour.'}${role==='petitefille'?' 👀 Tu peux lire la discussion des loups ci-dessous.':''}</p>`;
    if(o.ld)act+=`<div class="lg-dare ${o.ld.gold?'gold':''}">${o.ld.gold?'✨ <b>Carte en Or</b> — points ×5<br>':''}🔥 <b>Nuit torride</b> — ${esc(o.ld.text)}<br><small>Avec ${esc(P(o.lover).name)}, par votre messagerie ou à voix basse. Seulement si vous êtes tous les deux d'accord.</small>${o.ld.done?'<p>✓ Fait</p>':`<br><button class=btn2 onclick="lg('loverOk')">✅ Défi relevé</button>`}</div>`}
   else if(L.step==='witch'&&role==='sorciere'){const w=o.witch||{};act=`<p>${R('sorciere').emo} ${o.victim?`Cette nuit, <b>${esc(P(o.victim).name)}</b> a été attaqué·e.`:'Personne n\'a été attaqué cette nuit.'}</p>
     ${w.heal&&o.victim?`<label><input type=checkbox ${WI.heal?'checked':''} onchange="lgWI('heal',this.checked)"> 💚 Utiliser la potion de vie</label><br>`:'<small>Potion de vie : '+(w.heal?'disponible':'utilisée')+'</small><br>'}
     ${w.poison?`<p>☠️ Potion de mort : touche un joueur pour le viser (facultatif).</p>${grid(WI.poison?[WI.poison]:[],id=>id!==me)}`:'<small>Potion de mort : utilisée</small>'}<br><button class=btn onclick="lg('witch',{heal:${WI.heal},poison:${WI.poison?`'${WI.poison}'`:'null'}})">Terminer ma nuit</button>`}
   else if(L.step==='witch')act='<p class=small>😴 La nuit touche à sa fin…</p>'}
  if(L.ph==='hunter'){act=L.actor===me?`<p>${R('chasseur').emo} Tu tombes… choisis qui tu emportes avec toi${L.v==='hot'?' (il/elle recevra aussi un gage hot)':''}.</p>${grid(SEL,id=>id!==me)}<button class=btn ${!SEL.length?'disabled style="opacity:.4"':''} onclick="lg('hunter',{t:'${SEL[0]||''}'})">Tirer</button>`:`<p class=small>${esc(P(L.actor).name)} choisit…</p>`}
  if(L.ph==='day'){act=al?`<p>🗣️ Débattez dans le chat ou à voix haute. Quand tu es prêt·e, passe au vote.</p><button class=btn2 ${L.ready.includes(me)?'disabled':''} onclick="lg('ready')">${L.ready.includes(me)?'✓ Prêt·e':'🗳️ Je suis prêt·e à voter'}</button> <small>${L.ready.length}/${A.length}</small>`:'<p class=small>👻 Tu observes le débat.</p>';
   if(!al&&L.v==='hot')act+=L.ghostUsed[me]?'<p class=small>👻 Tu as déjà imposé ton gage aujourd\'hui.</p>':`<p>👻 Fantôme : impose un gage hot à un vivant (1 par jour).</p>${grid(SEL,id=>true)}<button class=btn2 ${!SEL.length?'disabled style="opacity:.4"':''} onclick="lg('gage',{t:'${SEL[0]||''}'})">Imposer le gage</button>`}
  if(L.ph==='vote'){const tally={};Object.values(L.votes||{}).forEach(t=>{if(t)tally[t]=(tally[t]||0)+1});const can=id=>id!==me&&(!L.cand||L.cand.includes(id));
   act=al?`<p>🗳️ ${L.cand?'Vote de départage':'Vote pour éliminer un joueur'} ${o.myVote!==undefined?'— ✓ voté (tu peux changer)':''}</p>${grid(SEL.length?SEL:(o.myVote?[o.myVote]:[]),can,id=>tally[id]?`<small>🗳️ ${tally[id]}</small>`:'')}<button class=btn ${!SEL.length?'disabled style="opacity:.4"':''} onclick="lg('vote',{t:'${SEL[0]||''}'})">Voter</button> <button class=btn2 onclick="lg('vote',{t:''})">Vote blanc</button>`:`<p class=small>👻 Le village vote… (${Object.keys(L.votes||{}).length}/${A.length})</p>`}
  if(L.ph==='plead')act=`<p>⚖️ ${esc(P(L.accused).name)} doit relever un gage pour plaider sa cause (ci-dessous).</p>`;
  if(L.ph==='final')act=al&&me!==L.accused?`<p>⚖️ Éliminer ${esc(P(L.accused).name)} ? ${o.myFinal!==undefined?'✓ '+(o.myFinal?'Éliminer':'Gracier'):''}</p><button class=btn onclick="lg('final',{yes:true})">👎 Éliminer</button> <button class=btn2 onclick="lg('final',{yes:false})">🕊️ Gracier</button>`:`<p class=small>⚖️ Le jury délibère… (${L.fvN} vote(s))</p>`;
  if(L.ph==='elim')act=`<p>${L.actor===me?'👻 Avant de devenir fantôme, relève ton dernier gage (ci-dessous).':'👻 '+esc(P(L.actor).name)+' relève son dernier gage.'}</p>`;
  if(L.ph==='end'){const W={village:'🏆 Victoire du village !',loups:'🏆 Victoire des '+(L.v==='hot'?'Prédateurs':'loups')+' !',amants:'💘 Victoire des amoureux !',personne:'☠️ Match nul'}[L.winner];const pod=Object.keys(L.roles).sort((a,b)=>(L.pts[b]||0)-(L.pts[a]||0));const top=pod.slice(0,3);const ord=[top[1],top[0],top[2]].filter(Boolean);
   act=`<h2 style="text-align:center">${W}</h2><div class=lg-pod>${ord.map(id=>`<div style="height:${id===top[0]?110:id===top[1]?85:65}px"><div style="font-size:26px">${id===top[0]?'🥇':id===top[1]?'🥈':'🥉'}</div><b>${esc(P(id).name)}</b><br><small>${L.pts[id]||0} pts</small></div>`).join('')}</div>
   <div class=titles>${(L.titles||[]).map(x=>`<div class=ans>${esc(x.t)} : <b>${esc(x.name)}</b> ${x.v!==''?`<small>(${esc(String(x.v))})</small>`:''}</div>`).join('')}</div>${grid([],()=>false,id=>`<small>${L.winners.includes(id)?'🏆 ':''}${L.pts[id]||0} pts</small>`)}
   ${h?`<button class="btn big" onclick="lg('stop')">🔁 Nouvelle partie</button>`:''}`}
  if(act)H+=`<div class=lg-b>${act}</div>`;
  if(L.ph!=='end'&&!/lg-pl/.test(act))H+=`<div class=lg-b><b>Joueurs</b>${grid([],()=>false)}</div>`;
  H+=`<div class="lg-b lg-log"><b>📜 Le narrateur</b>${L.log.slice().reverse().slice(0,8).map(x=>`<div>${esc(x.txt)}</div>`).join('')}</div>`;
  if(h&&L.ph!=='end')H+=`<div class=lg-b><small>👑 Hôte :</small> <button class=btn2 onclick="lg('skip')">⏩ Passer à l'étape suivante</button> <button class=btn2 onclick="if(confirm('Arrêter la partie ?'))lg('stop')">⏹️ Arrêter</button></div>`}
 const m=$('lg-main');if(m.dataset.h!==H){m.innerHTML=H;m.dataset.h=H}
 const o2=ME_LG||{},dayish=['day','vote','plead','final','hunter','elim'].includes(L.ph);
 chatBox('w',(L.v==='hot'?'😈 Repaire des Prédateurs':'🐺 Tanière des loups')+(o2.role==='petitefille'&&o2.al?' (espionnage anonyme)':''),L.ph!=='lobby'&&o2.wchat?o2.wchat:null,o2.role==='loup'&&o2.al);
 chatBox('d','🗣️ Place du village',L.ph!=='lobby'&&L.chatD?L.chatD:null,o2.al&&dayish);
 chatBox('g','👻 Chat des fantômes (invisible des vivants)',L.ph!=='lobby'&&o2.gchat?o2.gchat:null,!o2.al);
 // carte de gage (circuit existant, vue unique « avec son accord ») : cacher les éléments inutiles
 if(s.card){const cd=document.querySelector('#r-card .cnum');if(cd)cd.remove()}}
window.lgWI=(k,v)=>{WI[k]=v;draw()};
setInterval(()=>{const e=$('lg-tm');if(!e||!S||!S.lg)return;const ms=LEFT-Date.now();e.textContent=S.lg.ph==='end'||S.lg.ph==='lobby'?'':ms>0?'⏳ '+Math.floor(ms/60000)+':'+String(Math.floor(ms/1000)%60).padStart(2,'0'):'⏳ 0:00'},500);
})();
