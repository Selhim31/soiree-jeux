// Loup-Garou (classique + Hot) — moteur serveur. Le site est le narrateur.
'use strict';
const ROLES={
 loup:{camp:'loups',c:['Loup-Garou','🐺','Chaque nuit, avec les autres loups, choisis une victime. Le jour, fonds-toi dans le village.'],h:['Prédateur','😈','Chaque nuit, avec les autres Prédateurs, choisis ta proie. Le jour, joue les innocents.']},
 voyante:{camp:'village',c:['Voyante','🔮','Chaque nuit, découvre le rôle secret d\'un joueur.'],h:['Séductrice','💋','Chaque nuit, relève un défi hot pour percer le secret d\'un joueur.']},
 sorciere:{camp:'village',c:['Sorcière','🧪','Une potion de vie et une potion de mort, une seule fois chacune.'],h:['Infirmière coquine','💉','Une piqûre de rappel qui sauve, une injection fatale : une fois chacune.']},
 chasseur:{camp:'village',c:['Chasseur','🏹','Si tu meurs, tu emportes immédiatement quelqu\'un avec toi.'],h:['Exhibitionniste','🧥','Si tu tombes, tu entraînes quelqu\'un dans ta chute… et tu lui imposes un gage hot.']},
 cupidon:{camp:'village',c:['Cupidon','💘','La première nuit, lie deux amoureux : ils vivent et meurent ensemble.'],h:['Cupidon','💘','La première nuit, lie deux amants : chaque nuit ils relèvent un défi torride en duo.']},
 petitefille:{camp:'village',c:['Petite fille','👧','Tu espionnes la discussion des loups… sans savoir qui parle.'],h:['Voyeuse','👀','Tu lis en cachette les messages des Prédateurs… sans savoir qui écrit.']},
 salvateur:{camp:'village',c:['Salvateur','🛡️','Chaque nuit, protège un joueur des loups (pas deux fois de suite le même).'],h:['Garde du corps','🕶️','Chaque nuit, couvre un joueur contre les Prédateurs (jamais deux nuits de suite le même).']},
 ancien:{camp:'village',c:['Ancien','👴','Tu survis à la première attaque des loups.'],h:['Libertin endurci','🍷','Tu as tout vu : tu survis à la première attaque des Prédateurs.']},
 villageois:{camp:'village',c:['Villageois','🧑‍🌾','Pas de pouvoir : ton flair et ta voix au vote.'],h:['Fêtard·e','🥂','Pas de pouvoir, mais du flair et du charme pour démasquer les Prédateurs.']}};
const MIN=4,MAX=24;
// Répartition des rôles selon le nombre de joueurs (min 4) : moins on est, moins il y a de rôles.
function dist(n){if(n<MIN)return null;n=Math.min(n,MAX);const L=[];const w=n>=18?4:n>=12?3:n>=8?2:1;for(let i=0;i<w;i++)L.push('loup');
 for(const[k,min]of[['voyante',4],['sorciere',5],['chasseur',6],['cupidon',8],['petitefille',10],['salvateur',13],['ancien',15]])if(n>=min)L.push(k);
 while(L.length<n)L.push('villageois');return L}
const S=Number(process.env.LG_SPEED||1);const T={cupid:45e3,main:90e3,witch:45e3,hunter:45e3,day:240e3,vote:75e3,plead:120e3,final:45e3,elim:120e3,dawn:6e3};
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};const rnd=a=>a[Math.floor(Math.random()*a.length)];
module.exports=function(X){// X={io,log(r,ev,o),award(r,id,pts,stat),pub(r),nm(r,id),content}
 const TM={};
 const rn=(L,k)=>ROLES[k][L.v==='hot'?'h':'c'];const rname=(L,k)=>rn(L,k)[1]+' '+rn(L,k)[0];
 const alive=L=>Object.keys(L.alive).filter(id=>L.alive[id]);
 const say=(r,txt)=>{const L=r.lg;L.log.push({t:Date.now(),txt});if(L.log.length>60)L.log.shift()};
 const pts=(r,id,p,st)=>{const L=r.lg;L.pts[id]=(L.pts[id]||0)+p;L.st[id]=L.st[id]||{};L.st[id][st]=(L.st[id][st]||0)+1;const c=r.card;r.card=null;try{X.award(r,id,p,st)}finally{r.card=c}};
 const stat=(L,id,st)=>{L.st[id]=L.st[id]||{};L.st[id][st]=(L.st[id][st]||0)+1};
 const jl=(r,ev,id,detail)=>X.log(r,ev,{name:id?X.nm(r,id):'',pid:id||'',detail,card:''});
 function arm(r,k){const L=r.lg;clearTimeout(TM[r.code]);L.dl=Date.now()+T[k]*S;const lg=L;TM[r.code]=setTimeout(()=>{if(r.lg===lg){timeout(r);X.pub(r)}},T[k]*S)}
 function ensure(r){if(!r.lg||r.lg.game!==r.game){clearTimeout(TM[r.code]);r.lg={game:r.game,v:r.game==='lghot'?'hot':'classic',ph:'lobby',log:[],pts:{},st:{}}}return r.lg}
 function card(r,id,lvl,label,extra={}){const g=X.content(r.game);const pool=g.levels[lvl]||[];const L=r.lg;L.used=L.used||{};const u=L.used[lvl]=L.used[lvl]||[];let av=pool.filter(t=>!u.includes(t));if(!av.length){u.length=0;av=pool}const t=rnd(av);u.push(t);
  const others=alive(L).filter(x=>x!==id);const send=t.includes('{q}')&&/envoie/i.test(t)&&r.players.length>1;let text=t.replaceAll('{p}',X.nm(r,id));const tpl=text;
  if(!send)text=text.replaceAll('{q}',others.length?X.nm(r,rnd(others)):"quelqu'un");else text=text.replaceAll('{q}','un joueur de ton choix');
  L.cards=(L.cards||0)+1;const c={id:Date.now()+Math.random(),game:r.game,gname:g.name,level:'Hot',kind:'dare',target:id,partner:null,revealed:false,text:label+' — '+text,num:L.cards,total:0,final:false,gold:false,mult:1,lg:extra.k||'gage',lgw:true,elig:null};
  if(send){c.send=true;c.tpl=label+' — '+tpl;c.sendTo=null}
  r.card=c;jl(r,'lg_card',id,`${label} · ${send?'défi envoi (vue unique, avec accord)':'gage'}`)}
 function start(r,me){const L=ensure(r);if(L.ph!=='lobby'&&L.ph!=='end')return 'Partie déjà en cours.';const P=r.players.filter(p=>p.online!==false).map(p=>p.id);const D=dist(P.length);if(!D)return `Il faut au moins ${MIN} joueurs connectés.`;
  if(P.length>MAX)return `${MAX} joueurs maximum.`;
  const v=L.v;Object.assign(L,{ph:'night',step:null,n:0,day:0,roles:{},alive:{},lovers:null,seen:{},guardLast:null,witch:{heal:1,poison:1},log:[],pts:{},st:{},chat:{w:[],d:[],g:[]},q:[],dead:[],winner:null,ancien:1,used:{},cards:0,ghostUsed:{},v});
  const R=shuf(D);P.forEach((id,i)=>{L.roles[id]=R[i];L.alive[id]=true;jl(r,'lg_role',id,rn(L,R[i])[0])});
  jl(r,'lg_start',me,`${P.length} joueurs · ${v==='hot'?'Hot':'Classique'} · ${D.join(',')}`);
  say(r,v==='hot'?'🌙 La soirée commence… Chacun a reçu son rôle secret. Les lumières se tamisent.':'🌙 La partie commence. Chacun a reçu son rôle secret. Le village s\'endort…');night(r);return null}
 function night(r){const L=r.lg;L.ph='night';L.n++;L.wv={};L.victim=null;L.poison=null;L.healed=false;L.guard=null;L.seerT=null;L.seerOk=false;L.witchDone=false;L.seerDone=false;L.ld=null;if(r.card&&r.card.lgw)r.card=null;
  say(r,`🌙 Nuit ${L.n} — ${L.v==='hot'?'les Prédateurs rôdent…':'les loups se réveillent…'}`);
  const cup=alive(L).find(id=>L.roles[id]==='cupidon');if(L.n===1&&cup){L.step='cupid';arm(r,'cupid');return}mainStep(r)}
 function loversDare(r){const L=r.lg;if(L.v!=='hot'||!L.lovers||!L.lovers.every(id=>L.alive[id]))return;const g=X.content(r.game),lv='Nuits torrides',pool=g.levels[lv];const t=rnd(pool);const gs=(g.gold&&g.gold[lv])||[];L.ld={text:t,gold:gs.includes(t)&&Math.random()<(process.env.GOLD_P!==undefined?Number(process.env.GOLD_P):.35),done:{}};jl(r,'lg_night',L.lovers[0],'défi duo des amants'+(L.ld.gold?' · or':''))}
 function mainStep(r){const L=r.lg;L.step='main';loversDare(r);arm(r,'main');checkMain(r)}
 const need=(L,k)=>alive(L).filter(id=>L.roles[id]===k);
 function checkMain(r){const L=r.lg;if(L.step!=='main')return;const w=need(L,'loup');const ok=w.every(id=>id in L.wv)&&(!need(L,'voyante').length||L.seerDone)&&(!need(L,'salvateur').length||L.guard!==null);if(ok)endMain(r)}
 function endMain(r){const L=r.lg;const tally={};for(const t of Object.values(L.wv))if(t&&L.alive[t])tally[t]=(tally[t]||0)+1;const m=Math.max(0,...Object.values(tally));const top=Object.keys(tally).filter(k=>tally[k]===m);L.victim=m?rnd(top):null;
  if(L.victim)jl(r,'lg_night',L.victim,'cible des loups');if(L.guard===null)L.guard='';
  const wi=need(L,'sorciere')[0];if(wi&&(L.witch.heal||L.witch.poison)){L.step='witch';arm(r,'witch');return}dawn(r)}
 function dawn(r){const L=r.lg;L.step=null;clearTimeout(TM[r.code]);const deaths=[];
  if(L.victim&&!L.healed&&L.guard!==L.victim){if(L.roles[L.victim]==='ancien'&&L.ancien){L.ancien=0;say(r,`☀️ ${L.v==='hot'?'Le Libertin endurci':'L\'Ancien'} a résisté à l'attaque cette nuit !`)}else deaths.push([L.victim,'loups'])}
  if(L.victim&&(L.healed||L.guard===L.victim))stat(L,L.healed?need(L,'sorciere')[0]||'':Object.keys(L.roles).find(id=>L.roles[id]==='salvateur')||'','save');
  if(L.poison&&L.alive[L.poison]&&!deaths.some(d=>d[0]===L.poison))deaths.push([L.poison,'poison']);
  L.day++;say(r,deaths.length?`☀️ Jour ${L.day} — le village se réveille… ${deaths.length>1?'plusieurs corps ont été retrouvés':'un corps a été retrouvé'}.`:`☀️ Jour ${L.day} — miracle, personne n'est mort cette nuit !`);
  for(const[id,c]of deaths){if(c==='loups')for(const w of Object.keys(L.wv))if(L.wv[w]===id)stat(L,w,'kill');kill(r,id,c)}
  L.after='day';proceed(r)}
 function kill(r,id,cause){const L=r.lg;if(!L.alive[id])return;L.alive[id]=false;L.dead.push(id);const how={loups:L.v==='hot'?'dévoré·e par les Prédateurs':'dévoré·e par les loups',poison:L.v==='hot'?'victime d\'une injection fatale':'empoisonné·e',vote:'éliminé·e par le village',chasseur:L.v==='hot'?'entraîné·e dans la chute de l\'Exhibitionniste':'abattu·e par le Chasseur',amour:'mort·e de chagrin d\'amour'}[cause]||cause;
  say(r,`💀 ${X.nm(r,id)} — ${how}. C'était : ${rname(L,L.roles[id])}.`);jl(r,'lg_elim',id,`${cause} · ${rn(L,L.roles[id])[0]}`);if(L.dead.length===1)stat(L,id,'first');
  if(L.roles[id]==='chasseur')L.q.push({k:'hunter',id});if(L.v==='hot')L.q.push({k:'elim',id,label:cause==='chasseur'?'🧥 Gage de l\'Exhibitionniste':'👻 Dernier gage avant de devenir fantôme'});
  if(L.lovers&&L.lovers.includes(id)){const o=L.lovers.find(x=>x!==id);if(L.alive[o])kill(r,o,'amour')}}
 function win(L){const A=alive(L);if(!A.length)return 'personne';if(L.lovers&&A.length===2&&L.lovers.every(id=>A.includes(id))&&L.roles[L.lovers[0]]!=='loup'!==(L.roles[L.lovers[1]]!=='loup'))return 'amants';const w=A.filter(id=>L.roles[id]==='loup').length;if(!w)return 'village';if(w>=A.length-w)return 'loups';return null}
 function proceed(r){const L=r.lg;if(L.ph==='end')return;const W=win(L);if(W&&!L.q.some(t=>t.k==='hunter'))return finish(r,W);
  if(W)L.q=L.q.filter(t=>t.k==='hunter');
  const t=L.q.shift();if(t){if(t.k==='hunter'){L.ph='hunter';L.actor=t.id;say(r,`${rname(L,'chasseur')} ${X.nm(r,t.id)} choisit qui emporter…`);arm(r,'hunter');return}
   if(t.k==='elim'){if(r.card&&r.card.lgw&&!r.card.revealed)r.card=null;L.ph='elim';L.actor=t.id;card(r,t.id,'Hot',t.label,{k:'elim'});arm(r,'elim');return}}
  if(L.after==='day'){L.ph='day';L.ready={};L.votes={};L.cand=null;L.revote=0;L.ghostUsed={};arm(r,'day');say(r,'🗣️ Débat : discutez, accusez, défendez-vous. Puis passez au vote.')}else night(r)}
 function voteStart(r,cand){const L=r.lg;L.ph='vote';L.votes={};L.cand=cand||null;arm(r,'vote');say(r,cand?`🔁 Égalité ! Nouveau vote entre : ${cand.map(id=>X.nm(r,id)).join(', ')}.`:'🗳️ Le village vote. Qui doit être éliminé ?')}
 function checkVote(r){const L=r.lg;if(L.ph==='vote'&&alive(L).every(id=>id in L.votes))endVote(r);if(L.ph==='final'&&alive(L).filter(id=>id!==L.accused).every(id=>id in L.fv))endFinal(r)}
 function endVote(r){const L=r.lg;const tally={};for(const[v,t]of Object.entries(L.votes))if(t&&L.alive[t]&&L.alive[v])tally[t]=(tally[t]||0)+1;const m=Math.max(0,...Object.values(tally));const top=Object.keys(tally).filter(k=>tally[k]===m);
  jl(r,'lg_vote','',Object.entries(L.votes).map(([v,t])=>`${X.nm(r,v)}→${t?X.nm(r,t):'blanc'}`).join(', '));
  if(!m){say(r,'🤷 Aucun vote : personne n\'est éliminé aujourd\'hui.');return toNight(r)}
  if(top.length>1){if(!L.revote){L.revote=1;return voteStart(r,top)}say(r,'⚖️ Nouvelle égalité : personne n\'est éliminé aujourd\'hui.');return toNight(r)}
  const acc=top[0];L.voters=Object.keys(L.votes).filter(v=>L.votes[v]===acc);
  if(L.v==='hot'){L.ph='plead';L.accused=acc;say(r,`⚖️ ${X.nm(r,acc)} est accusé·e ! Avant le verdict, place à la plaidoirie.`);card(r,acc,'Plaidoirie','⚖️ Plaidoirie',{k:'plead'});arm(r,'plead');return}
  eliminate(r,acc)}
 function eliminate(r,acc){const L=r.lg;if(L.roles[acc]==='loup')for(const v of L.voters||[])if(v!==acc)pts(r,v,3,'lgvote');kill(r,acc,'vote');L.after='night';proceed(r)}
 function endFinal(r){const L=r.lg;const y=Object.values(L.fv).filter(x=>x).length,n=Object.values(L.fv).filter(x=>!x).length;jl(r,'lg_vote',L.accused,`verdict : ${y} éliminer / ${n} gracier`);
  if(y>n){eliminate(r,L.accused)}else{say(r,`🕊️ ${X.nm(r,L.accused)} est gracié·e (${y} contre ${n}).`);toNight(r)}}
 function toNight(r){const L=r.lg;L.after='night';proceed(r)}
 function finish(r,W){const L=r.lg;clearTimeout(TM[r.code]);L.ph='end';L.winner=W;if(r.card&&r.card.lgw)r.card=null;const ids=Object.keys(L.roles);
  const wins=W==='amants'?L.lovers:W==='loups'?ids.filter(id=>L.roles[id]==='loup'):W==='village'?ids.filter(id=>L.roles[id]!=='loup'&&!(L.lovers&&L.lovers.includes(id)&&L.lovers.some(x=>L.roles[x]==='loup'))):[];
  L.winners=wins;for(const id of wins){pts(r,id,15,'lgwin');if(L.alive[id])pts(r,id,5,'lgsurv')}
  say(r,{village:'🏆 Le village a gagné ! Tous les '+(L.v==='hot'?'Prédateurs':'loups')+' sont démasqués.',loups:'🏆 Les '+(L.v==='hot'?'Prédateurs':'loups')+' ont gagné ! Le village est tombé.',amants:'🏆 Les amoureux ont gagné : seuls au monde !',personne:'☠️ Plus personne… match nul.'}[W]);
  jl(r,'lg_end','',`victoire : ${W} · ${wins.map(id=>X.nm(r,id)).join(', ')}`);L.titles=titles(r)}
 function titles(r){const L=r.lg,out=[],ids=Object.keys(L.roles);const best=k=>{let b=null;for(const id of ids){const v=(L.st[id]||{})[k]||0;if(v>0&&(!b||v>b.v))b={id,v}}return b};
  for(const[k,t]of[['kill',L.v==='hot'?'😈 Prédateur insatiable':'🐺 Grand Méchant Loup'],['lgseer',L.v==='hot'?'💋 Regard qui déshabille':'🔮 Œil de lynx'],['lgvote','⚖️ Juge infaillible'],['save','💊 Ange de la nuit'],['shot','🎯 Gâchette facile'],['first','🥀 Premier sacrifié'],['dare','🔥 Sans tabou'],['gage','👻 Fantôme farceur']]){const b=best(k);if(b)out.push({t,name:X.nm(r,b.id),v:b.v})}
  const surv=ids.filter(id=>L.alive[id]);if(surv.length)out.push({t:'🛡️ Increvable',name:surv.map(id=>X.nm(r,id)).join(', '),v:'vivant à la fin'});if(L.lovers)out.push({t:'💘 Amants',name:L.lovers.map(id=>X.nm(r,id)).join(' & '),v:''});return out}
 function timeout(r){const L=r.lg;if(!L)return;
  if(L.ph==='night'&&L.step==='cupid'){const A=alive(L);if(!L.lovers&&A.length>=2){L.lovers=shuf(A).slice(0,2);say(r,'💘 Cupidon a hésité… le destin a choisi les amoureux à sa place.');jl(r,'lg_night','',`amoureux (hasard) : ${L.lovers.map(id=>X.nm(r,id)).join(' & ')}`)}return mainStep(r)}
  if(L.ph==='night'&&L.step==='main')return endMain(r);if(L.ph==='night'&&L.step==='witch')return dawn(r);
  if(L.ph==='hunter'){say(r,'⌛ Trop tard : personne n\'a été emporté.');return proceed(r)}
  if(L.ph==='elim'||L.ph==='plead'){if(r.card&&r.card.lgw&&!r.card.revealed){r.card.revealed=true;r.card.result='⌛ Temps écoulé'}return hook(r)}
  if(L.ph==='day')return voteStart(r);if(L.ph==='vote')return endVote(r);if(L.ph==='final')return endFinal(r)}
 // appelé au début de chaque pub() : fait avancer après un gage terminé
 function hook(r){const L=r.lg;if(!L)return;const c=r.card;if(!c||!c.lgw||!c.revealed)return;c.lgw=false;if(/relevé le défi/.test(c.result||'')&&!/n'a pas/.test(c.result||''))stat(L,c.target,'dare');
  if(c.lg==='elim'&&L.ph==='elim'&&L.actor===c.target){proceed(r)}else if(c.lg==='plead'&&L.ph==='plead'){L.ph='final';L.fv={};arm(r,'final');say(r,`🗳️ Verdict : éliminer ou gracier ${X.nm(r,L.accused)} ?`)}}
 function act(r,me,o){if(!r)return 'Pas de salle.';const L=ensure(r);const a=o.a;const isH=r.host===me;
  if(a==='start'){if(!isH)return 'Seul l\'hôte lance la partie.';return start(r,me)}
  if(a==='stop'){if(!isH)return;clearTimeout(TM[r.code]);if(r.card&&r.card.lgw)r.card=null;r.lg=null;ensure(r);return}
  if(a==='skip'){if(!isH||L.ph==='lobby'||L.ph==='end')return;if(L.ph==='day')return voteStart(r);return timeout(r)}
  if(!L.roles||!(me in L.roles))return 'Tu ne joues pas dans cette partie.';const role=L.roles[me],al=L.alive[me],t=o.t;const isP=x=>x&&(x in L.roles);
  if(a==='chat'){const txt=String(o.txt||'').replace(/\s+/g,' ').trim().slice(0,200);if(!txt)return;const ch=o.ch;let ok=false;
   if(ch==='w')ok=al&&role==='loup';else if(ch==='d')ok=al&&['day','vote','plead','final','hunter','elim'].includes(L.ph);else if(ch==='g')ok=!al;if(!ok)return 'Canal non autorisé.';
   const A=L.chat[ch];A.push({id:me,txt,t:Date.now()});if(A.length>80)A.shift();return}
  if(L.ph==='night'){if(!al)return 'Les fantômes ne jouent plus la nuit.';
   if(L.step==='cupid'&&role==='cupidon'){const[x,y]=o.ids||[];if(!isP(x)||!isP(y)||x===y||!L.alive[x]||!L.alive[y])return 'Choisis deux joueurs différents.';L.lovers=[x,y];jl(r,'lg_night',me,`Cupidon lie ${X.nm(r,x)} & ${X.nm(r,y)}`);say(r,'💘 Cupidon a décoché ses flèches…');return mainStep(r)}
   if(L.step!=='main'&&L.step!=='witch')return;
   if(a==='wolf'&&role==='loup'&&L.step==='main'){if(t&&(!L.alive[t]||L.roles[t]==='loup'))return 'Cible invalide.';L.wv[me]=t||'';jl(r,'lg_night',me,`vote loup → ${t?X.nm(r,t):'personne'}`);return checkMain(r)}
   if(a==='seer'&&role==='voyante'&&L.step==='main'&&!L.seerDone){if(L.seerT)return;if(!isP(t)||t===me||!L.alive[t])return 'Cible invalide.';L.seerT=t;jl(r,'lg_night',me,`voyante regarde ${X.nm(r,t)}`);
    if(L.v==='hot'){const g=X.content(r.game);L.seerDare=rnd(g.levels['Séductrice']);return}return seerReveal(r,me)}
   if(a==='seerOk'&&role==='voyante'&&L.seerT&&!L.seerDone){stat(L,me,'dare');return seerReveal(r,me)}
   if(a==='guard'&&role==='salvateur'&&L.step==='main'&&L.guard===null){if(!isP(t)||!L.alive[t]||t===L.guardLast)return 'Tu ne peux pas protéger le même joueur deux nuits de suite.';L.guard=t;L.guardLast=t;jl(r,'lg_night',me,`protège ${X.nm(r,t)}`);return checkMain(r)}
   if(a==='witch'&&role==='sorciere'&&L.step==='witch'){if(o.heal&&L.witch.heal&&L.victim){L.healed=true;L.witch.heal=0;jl(r,'lg_night',me,`potion de vie sur ${X.nm(r,L.victim)}`)}
    if(o.poison&&L.witch.poison&&isP(o.poison)&&L.alive[o.poison]){L.poison=o.poison;L.witch.poison=0;jl(r,'lg_night',me,`potion de mort sur ${X.nm(r,o.poison)}`)}return dawn(r)}
   if(a==='loverOk'&&L.ld&&L.lovers&&L.lovers.includes(me)&&!L.ld.done[me]){L.ld.done[me]=1;stat(L,me,'dare');pts(r,me,L.ld.gold?5:1,'dare');return}
   return}
  if(a==='loverOk'&&L.ld&&L.lovers&&L.lovers.includes(me)&&!L.ld.done[me]){L.ld.done[me]=1;stat(L,me,'dare');pts(r,me,L.ld.gold?5:1,'dare');return}
  if(a==='hunter'&&L.ph==='hunter'&&L.actor===me){if(!isP(t)||!L.alive[t])return 'Cible invalide.';stat(L,me,'shot');jl(r,'lg_night',me,`tir → ${X.nm(r,t)}`);kill(r,t,'chasseur');return proceed(r)}
  if(a==='ready'&&L.ph==='day'&&al){L.ready[me]=1;if(alive(L).every(id=>L.ready[id]))voteStart(r);return}
  if(a==='vote'&&L.ph==='vote'&&al){if(t&&(!L.alive[t]||(L.cand&&!L.cand.includes(t))))return 'Vote invalide.';L.votes[me]=t||'';return checkVote(r)}
  if(a==='final'&&L.ph==='final'&&al&&me!==L.accused){L.fv[me]=!!o.yes;return checkVote(r)}
  if(a==='gage'&&L.v==='hot'&&!al&&L.ph==='day'){if(L.ghostUsed[me])return 'Un gage par jour et par fantôme.';if(!isP(t)||!L.alive[t])return 'Cible invalide.';if(r.card&&r.card.lgw&&!r.card.revealed)return 'Un gage est déjà en cours.';L.ghostUsed[me]=1;stat(L,me,'gage');card(r,t,'Hot',`👻 Gage du fantôme ${X.nm(r,me)}`,{k:'ghost'});say(r,`👻 Le fantôme ${X.nm(r,me)} impose un gage à ${X.nm(r,t)} !`);return}
 }
 function seerReveal(r,me){const L=r.lg,t=L.seerT;L.seerDone=true;L.seen[t]=L.roles[t];if(L.roles[t]==='loup')pts(r,me,5,'lgseer');return checkMain(r)}
 function pubView(r){const L=ensure(r);const n=r.players.filter(p=>p.online!==false).length;const D=dist(n);const cnt={};(D||[]).forEach(k=>cnt[k]=(cnt[k]||0)+1);
  const RN=Object.fromEntries(Object.keys(ROLES).map(k=>[k,{name:rn(L,k)[0],emo:rn(L,k)[1],desc:rn(L,k)[2],camp:ROLES[k].camp}]));
  const v={v:L.v,ph:L.ph,step:L.step||null,n:L.n||0,day:L.day||0,left:L.dl?Math.max(0,L.dl-Date.now()):0,log:L.log.slice(-25),dist:cnt,min:MIN,RN,players:n};if(L.ph==='lobby')return v;
  Object.assign(v,{alive:L.alive,dead:Object.fromEntries((L.dead||[]).map(id=>[id,L.roles[id]])),actor:L.actor||null,cand:L.cand||null,accused:L.accused||null,
   votes:L.ph==='vote'?L.votes:null,ready:L.ph==='day'?Object.keys(L.ready||{}):null,fvN:L.ph==='final'?Object.keys(L.fv||{}).length:0,chatD:L.chat.d.slice(-40).map(m=>({n:X.nm(r,m.id),id:m.id,txt:m.txt})),ghostUsed:L.ghostUsed||{}});
  if(L.ph==='end')Object.assign(v,{roles:L.roles,winner:L.winner,winners:L.winners,lovers:L.lovers,pts:L.pts,titles:L.titles});return v}
 function priv(r,id){const L=r.lg;if(!L||!L.roles||!(id in L.roles))return null;const role=L.roles[id],al=L.alive[id];const o={role,al};
  if(role==='loup'){o.mates=Object.keys(L.roles).filter(x=>L.roles[x]==='loup'&&x!==id);o.wchat=L.chat.w.slice(-40).map(m=>({n:X.nm(r,m.id),txt:m.txt}))}
  if(role==='petitefille'&&al)o.wchat=L.chat.w.slice(-40).map(m=>({n:'🐺 ???',txt:m.txt}));
  if(L.lovers&&L.lovers.includes(id)){o.lover=L.lovers.find(x=>x!==id);if(L.ld&&L.ph==='night')o.ld={text:L.ld.text,gold:L.ld.gold,done:!!L.ld.done[id]}}
  if(role==='cupidon'&&L.lovers)o.lovers=L.lovers;
  if(role==='voyante'){o.seen=L.seen;if(L.ph==='night'&&L.seerT&&!L.seerDone)o.seerDare=L.seerDare;if(L.ph==='night')o.seerT=L.seerT}
  if(role==='loup'&&L.ph==='night')o.wv=L.wv;if(role==='salvateur'){o.guard=L.guard;o.guardLast=L.guardLast}
  if(role==='sorciere'){o.witch=L.witch;if(L.ph==='night'&&L.step==='witch')o.victim=L.victim}
  if(!al){o.roles=L.roles;o.wchat=L.chat.w.slice(-40).map(m=>({n:X.nm(r,m.id),txt:m.txt}));o.lovers=L.lovers;o.gchat=L.chat.g.slice(-40).map(m=>({n:X.nm(r,m.id),txt:m.txt}))}
  if(L.ph==='vote')o.myVote=L.votes[id];if(L.ph==='final')o.myFinal=L.fv[id];return o}
 function privAll(r){if(!r.lg||!r.lg.roles)return;for(const p of r.players)X.io.to('p:'+p.id).emit('lgme',priv(r,p.id))}
 return {act,hook,pubView,privAll,priv,ensure,dist,ROLES,MIN,_timeout:timeout};
};
module.exports.dist=dist;module.exports.ROLES=ROLES;
