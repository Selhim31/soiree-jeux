// salle v3
const MODES={all:'🌍 À tout le monde',turn:'🔁 Chacun son tour'},PICKS={answerer:'Celui qui répond',random:'Au hasard'};
let SECRET=null,PUR=null;fetch('/api/purete').then(r=>r.json()).then(x=>PUR=x);
so.on('secret',w=>{SECRET=w;S&&render()});
so.on('toast',t=>{const d=document.createElement('div');d.textContent=t;$('toast').appendChild(d);setTimeout(()=>d.remove(),3500)});
const pn=id=>(S.players.find(p=>p.id===id)||{}).name||'?';
function ans(v){so.emit('answer',v)}
let tmr=null;
function render(){const s=S,h=s.host===so.id,g=GAMES.find(x=>x.id===s.game);if(!g)return;
$('r-code').textContent=s.code;$('r-players').innerHTML=s.players.map(p=>`<span>${p.id===s.host?'👑 ':''}${s.card&&s.card.target===p.id?'🎯 ':''}${esc(p.name)}${p.id===so.id?' (toi)':''}${s.teams&&s.teams[p.id]?(s.teams[p.id]==='Bleue'?' 🔵':' 🔴'):''}</span>`).join('');
$('r-meta').textContent=`${g.name} · ${s.levels.join(', ')} · ${s.format} · ${MODES[s.mode]} · ${s.count} carte(s)`;
$('r-next').classList.toggle('hide',!h);$('r-wait').classList.toggle('hide',h);$('r-settings').classList.toggle('hide',!h);$('r-joker').classList.toggle('hide',!s.card);
if(h){renderSel('s');$('s-game').innerHTML=GAMES.map(x=>`<option value=${x.id} ${x.id===s.game?'selected':''}>${esc(x.name)}</option>`).join('');$('s-mode').innerHTML=Object.entries(MODES).map(([k,v])=>`<button class="chip ${s.mode===k?'on':''}" onclick="so.emit('settings',{mode:'${k}'})">${v}</button>`).join('');$('s-pick').innerHTML=Object.entries(PICKS).map(([k,v])=>`<button class="chip ${s.pick===k?'on':''}" onclick="so.emit('settings',{pick:'${k}'})">${v}</button>`).join('');$('s-pickbox').classList.toggle('hide',s.mode!=='turn')}
$('r-next').textContent=s.card?'Carte suivante ▶':'Lancer la partie ▶';
// tableau des défis
{const D=Object.entries(s.dares||{}).sort((x,y)=>y[1].ok-x[1].ok||x[1].fail-y[1].fail);let el=$('r-board');if(!el){el=document.createElement('div');el.id='r-board';$('r-extra').before(el)}
el.innerHTML=s.ended?`<div class="card podium"><div class=lv>🏁 Partie terminée</div>${D.length?`<div style="font-size:2.4em">👑</div><div><b>${esc(D[0][0])}</b> remporte la couronne avec ${D[0][1].ok} défi(s) relevé(s) !</div><div class=pod>${D.slice(0,3).map((d,i)=>`<div class=p${i}><span>${['🥇','🥈','🥉'][i]}</span>${esc(d[0])}<small>${d[1].ok} ✅ · ${d[1].fail} ❌</small></div>`).join('')}</div>`:'<div>Aucun défi joué.</div>'}${h?'<button class=btn2 onclick="so.emit(\'next\')">Rejouer ▶</button>':''}</div>`
:D.length?`<details class=glass open><summary>🏆 Classement des défis</summary>${D.map((d,i)=>`<div class=ans><b>${i+1}. ${esc(d[0])}</b> — ${d[1].ok} ✅ · ${d[1].fail} ❌ · ${d[1].ok+d[1].fail} tenté(s)</div>`).join('')}</details>`:'';
let eb=$('r-end');if(h&&!eb){eb=document.createElement('button');eb.id='r-end';eb.className='btn2';eb.style.width='100%';eb.style.marginTop='10px';eb.textContent='🏁 Terminer la partie';eb.onclick=()=>{if(confirm('Terminer la partie et afficher le podium ?'))so.emit('end')};$('r-settings').before(eb)}if(eb)eb.classList.toggle('hide',!h||s.ended)}
// extra : questions anonymes
$('r-extra').innerHTML=s.game==='connaitre'?`<details class=glass><summary>✉️ Poser une question anonyme (${s.anonCount} en attente)</summary><p class=small>Personne ne saura que c'est toi, pas même l'hôte.</p><textarea id=anon-t maxlength=250 placeholder="Ta question…"></textarea><select id=anon-l>${Object.keys(g.levels).map(l=>`<option>${l}</option>`).join('')}</select><button class=btn style="width:100%;margin-top:8px" onclick="if($('anon-t').value.trim()){so.emit('anonQ',{text:$('anon-t').value,level:$('anon-l').value});$('anon-t').value=''}">Envoyer anonymement</button></details>`:'';
const c=s.card,box=$('r-card');clearInterval(tmr);
if(!c){box.innerHTML=`<div class="card intro"><img src="${g.img}" alt=""><div>${h?'Invite tes amis avec le lien ou le QR code, puis lance la partie !':'En attente du lancement…'}</div></div>`;box.dataset.id='';return}
const me=so.id,mine=c.answered.includes(me),isT=c.target===me,exp=c.expected,need=exp.includes(me);let body='';
const prog=exp.length?`<div class=prog>${c.answered.filter(x=>exp.includes(x)).length}/${exp.length} réponse(s)${h&&!c.revealed?` · <a href=# onclick="so.emit('reveal');return false" style="color:#ff9be0">révéler maintenant</a>`:''}</div>`:'';
const answersHtml=()=>c.answers?c.answers.map(a=>`<div class=ans><b>${esc(a.name)}</b> : ${esc(c.kind==='purity'?Math.max(0,100-a.v*2)+'% pur':a.v)}</div>`).join(''):'';
const optBtns=(list)=>`<div class=opts>${list.map(o=>{const n=c.answers?c.answers.filter(a=>a.v===o).length:0,tot=c.answers?c.answers.length||1:1;return `<button class="opt ${c.myv===o?'me':''}" ${c.revealed||mine?'disabled':''} data-v="${esc(o)}"><i style="width:${c.revealed?100*n/tot:0}%"></i><span>${esc(o)}${c.revealed?` · <b>${n}</b>`:''}</span></button>`}).join('')}</div>`;
switch(c.kind){
case'input':body=c.revealed?answersHtml():need?(mine?'<p class=small>✓ Réponse envoyée, en attente des autres…</p>':`<textarea id=a-in maxlength=300 placeholder="Ta réponse (révélée en même temps que les autres)"></textarea><button class=btn style="width:100%;margin-top:8px" onclick="ans($('a-in').value||'…')">Envoyer</button>`):`<p class=small>${esc(pn(c.target))} répond…</p>`;
 if(c.revealed&&s.mode==='turn'&&(isT&&s.pick==='answerer'))body+=`<p class=small>À toi de choisir qui joue ensuite :</p><div class=chips>${s.players.filter(p=>p.id!==me).map(p=>`<button class=chip onclick="so.emit('pickNext','${p.id}')">${esc(p.name)}</button>`).join('')}</div>`;
 if(c.revealed&&s.mode==='turn'&&s.pick==='random'&&h)body+=`<button class=btn2 style="margin-top:10px" onclick="so.emit('randNext')">🎲 Joueur suivant au hasard</button>`;break;
case'players':case'impostor':body=(c.kind==='impostor'&&SECRET&&!c.revealed?`<div class=secret>Ton mot : ${esc(SECRET)}</div>`:'')+optBtns(s.players.map(p=>p.name));break;
case'ab':case'quiz':case'rnp':body=(c.kind==='rnp'&&!isT?`<p class=small>${esc(pn(c.target))} choisit…</p>`:'')+(c.kind!=='rnp'||isT||c.revealed?optBtns(c.opts):'');break;
case'number':body=c.revealed?answersHtml():mine?'<p class=small>✓ Note envoyée</p>':`<div class=chips>${[1,2,3,4,5,6,7,8,9,10].map(n=>`<button class=chip onclick="ans(${n})">${n}</button>`).join('')}</div>`;break;
case'purity':body=c.revealed?answersHtml():mine?'<p class=small>✓ Envoyé</p>':`<div class=pur>${(PUR||[]).map((x,i)=>`<label><input type=checkbox class=pc> ${esc(x)}</label>`).join('')}</div><button class=btn style="width:100%;margin-top:8px" onclick="ans(document.querySelectorAll('.pc:checked').length)">Valider en secret</button>`;break;
case'timer':body=`<div class=timer id=tm></div>`;break;
case'dare':body=(!c.revealed&&(isT||h))?`<div class=chips><button class=btn2 onclick="so.emit('done')">✅ Défi relevé</button><button class=btn2 onclick="so.emit('fail')">❌ Défi non relevé</button></div>`:'';break;
case'team':body=`<div class=res>🔵 Bleue ${s.scores.Bleue||0} — ${s.scores.Rouge||0} Rouge 🔴</div>${h?`<div class=chips><button class=btn2 onclick="so.emit('teamPoint','Bleue')">+1 🔵</button><button class=btn2 onclick="so.emit('teamPoint','Rouge')">+1 🔴</button></div>`:''}`;break;
case'pmu':body=optBtns(c.opts)+`<div style="margin-top:12px">${Object.entries(c.pmu.h).map(([k,v])=>`<div class=track><b>${k}</b><div class=lane><i style="left:${v/6*85}%">🏇</i></div></div>`).join('')}</div>`+(h&&!c.pmu.winner?`<button class=btn2 style="margin-top:8px" onclick="so.emit('pmuDraw')">🃏 Retourner une carte ${c.pmu.last?'(dernière : '+c.pmu.last+')':''}</button>`:'');break;}
if(c.kind==='quiz'&&s.scores&&Object.keys(s.scores).length)body+=`<div class=prog>🏆 ${Object.entries(s.scores).map(([k,v])=>esc(k)+' '+v).join(' · ')}</div>`;
const html=`<div class=lv>${esc(g.name)} · ${esc(c.level)}${c.anon?' · ✉️ question anonyme':''}</div><div>${esc(c.text)}</div>${body}${c.result?`<div class=res>${esc(c.result)}</div>`:''}${prog}`;
if(box.dataset.id!=c.id){box.dataset.id=c.id;SECRET=c.kind==='impostor'?SECRET:null;box.innerHTML=`<div class=card>${html}</div>`}else{const ta=$('a-in'),keep=ta&&ta.value;box.firstChild.innerHTML=html;if(keep&&$('a-in'))$('a-in').value=keep}
box.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{c.myv=b.dataset.v;ans(b.dataset.v)});
if(c.kind==='timer'){const end=Date.now()+c.timerLeft;const f=()=>{const ms=end-Date.now(),el=$('tm');if(!el)return;el.textContent=ms>7000?'Prêts…':ms>0?Math.ceil(ms/1000):'⏰ Temps écoulé !';if(ms<=0)clearInterval(tmr)};f();tmr=setInterval(f,200)}}
