// Accueil : familles de jeux disposées en cercle autour d'un centre (pas de tirage).
(function(){const st=document.createElement('style');st.textContent=`
#games.ring{position:relative;display:block;width:min(97vw,500px);aspect-ratio:1;margin:4px auto 26px;left:50%;transform:translateX(-50%);grid-template-columns:none}
#games.ring:before{content:'';position:absolute;inset:13%;border-radius:50%;border:1px solid rgba(212,175,55,.45);box-shadow:0 0 30px rgba(212,175,55,.12) inset}
#games.ring .rc{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:36%;aspect-ratio:1;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;
 background:radial-gradient(circle at 35% 30%,#5a0d22,#14040a 72%);border:2px solid #d4af37;box-shadow:0 0 22px rgba(212,175,55,.35),inset 0 0 14px rgba(0,0,0,.7);color:#f3d98b;font-family:Georgia,serif}
#games.ring .rc b{font-size:clamp(15px,4.6vw,20px);line-height:1.05}#games.ring .rc small{font-size:clamp(10px,2.8vw,12px);opacity:.8;margin-top:4px}
#games.ring .rf{position:absolute;width:var(--sz);aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;overflow:visible;cursor:pointer;border:2px solid #b8932f;background:#14040a;
 box-shadow:0 6px 18px rgba(0,0,0,.55);transition:box-shadow .25s,transform .25s;-webkit-tap-highlight-color:transparent;padding:0}
#games.ring .rf img{position:absolute;inset:14%;width:72%;height:72%;object-fit:contain;border-radius:16%}#games.ring .rf.fam img{inset:13%;width:74%;height:74%;border-radius:16%}
#games.ring .rf .l{position:absolute;top:100%;left:-14%;right:-14%;margin-top:3px;padding:1px 3px;text-shadow:0 1px 3px #000,0 0 6px #000;color:#f7e3a1;font:700 clamp(10px,3vw,13px)/1.1 Georgia,serif;text-align:center}
#games.ring .rf .e{position:absolute;top:12%;left:0;right:0;text-align:center;font-size:clamp(20px,7vw,30px);filter:drop-shadow(0 2px 3px #000)}
#games.ring .rc.s{width:26%}#games.ring .rc.s b{font-size:clamp(11px,3.2vw,14px)}#games.ring .rc .rb{margin-top:6px;padding:3px 8px;font-size:clamp(10px,2.8vw,12px)}#games.ring .rc.one{top:34%;width:42%}#games.ring.dbl{aspect-ratio:4/5}#games.ring.dbl:before{inset:20% 12%;border-radius:50%}
#games.ring .rf.sm .l{font-size:clamp(8px,2.3vw,10px);margin-top:1px}#games.ring .rf.sm img{opacity:.9}
#games.ring .rf.out{z-index:2}#games.ring .rf.sm .l{font-size:clamp(8px,2.3vw,10px)}
#games.ring .rf .badge{position:absolute;top:-2%;right:-2%;left:auto;font-size:9px!important;line-height:1.2!important;padding:1px 5px!important;min-width:0!important;width:auto!important;height:auto!important;border-radius:8px!important;transform:none!important}
#games.ring .rf:hover,#games.ring .rf:focus-visible,#games.ring .rf:active{box-shadow:0 0 0 2px #e8c766,0 0 26px rgba(232,199,102,.75);transform:translate(-50%,-50%) scale(1.06);outline:none}
#games.ring .rf.hl{box-shadow:0 0 0 2px #e8c766,0 0 22px rgba(232,199,102,.7)}#games.ring .rf.win{box-shadow:0 0 0 3px #ffe08a,0 0 40px 6px rgba(255,215,90,.9);transform:translate(-50%,-50%) scale(1.1)}#games.ring .rc .rb{display:block}

#v-home>.glass{display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:6px 8px;margin:4px auto 6px;max-width:500px}
#v-home>.glass .avrow{display:flex;align-items:center;gap:6px;flex:1 1 52%;min-width:0;margin:0}#v-home>.glass .row{display:flex;gap:6px;flex:1 1 40%;min-width:0;margin:0}
#v-home>.glass input{height:40px;min-height:0;padding:4px 10px;font-size:15px;margin:0;min-width:0;width:100%;letter-spacing:normal}#v-home>.glass #code{width:5.2em;flex:0 0 5.2em;text-transform:uppercase}
#v-home>.glass #avbtn{width:40px;height:40px;min-width:40px;font-size:22px;padding:0}#v-home>.glass .btn2{height:40px;padding:0 8px;font-size:13px;margin:0;flex:1 1 auto;min-width:0;width:auto}#v-home>.glass{box-sizing:border-box;width:calc(100% - 4px)}
#v-home>.glass .err:empty{display:none}#v-home>.glass .err{flex-basis:100%;margin:2px 0 0}
#v-home .hero{padding:4px 0 0;margin:0}#v-home .hero h1{margin:0}#v-home .row:has(#sec-title){display:none}
#ringbar{position:sticky;top:0;z-index:20;display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 4px;max-width:500px;margin:0 auto;background:linear-gradient(#0b0507ee,#0b050700)}
#ringbar button{min-height:46px;padding:0 14px;border-radius:23px;border:2px solid #e8c766;background:linear-gradient(#f3d98b,#b8932f);color:#2a0710;font:700 16px Georgia,serif;box-shadow:0 3px 12px rgba(0,0,0,.6),0 0 14px rgba(232,199,102,.4);cursor:pointer}
#ringbar button.hid{visibility:hidden}
#games.ring .rc.c2{width:30%}#games.ring .rc.c2 b{font-size:clamp(14px,4.2vw,19px)}#games.ring.dbl .rc.c2{width:19%}#games.ring.dbl .rc.c2 b{font-size:clamp(11px,3.1vw,14px)}
#games.ring.dbl .rf .l{font-size:clamp(10px,2.9vw,12px);margin-top:2px}
@media (prefers-reduced-motion: reduce){#games.ring .rf{transition:none}#games.ring .rf:hover,#games.ring .rf:active,#games.ring .rf:focus-visible{transform:translate(-50%,-50%)}}`;document.head.appendChild(st);
const bar=(fam)=>{let b=document.getElementById('ringbar');if(!b){b=document.createElement('div');b.id='ringbar';$('games').before(b)}b.innerHTML=`<button class="${fam?'':'hid'}" onclick="showFams()">← Catégories</button><button onclick="ringRand()">🎲 ${fam?'Au hasard':'Catégorie au hasard'}</button>`};
const _sf=showFams;window.showFams=showFams=function(){_sf();const g=$('games');const F=FAMS;if(!F.length)return;g.classList.add('ring');const n=F.length,sz=n<=6?29:n<=8?25:20;
 bar(false);g.classList.remove('dbl');g.innerHTML=`<div class="rc c2"><b>Choisis ta<br>catégorie</b></div>`+F.map((f,i)=>{const a=-Math.PI/2+i*2*Math.PI/n,x=50+35*Math.cos(a),y=48+34*Math.sin(a);const gs=f.games.map(id=>GAMES.find(x=>x.id===id)).filter(Boolean);
  return `<button class="rf fam" style="left:${x}%;top:${y}%;--sz:${sz}%" onclick="openFam('${f.id}')" title="${esc(f.desc)}"><img src="/img/fam_${f.id}.webp" alt=""><span class=l>${esc(f.name)}</span></button>`}).join('')};
let FAMC=null;const _of=openFam;window.openFam=openFam=function(id){FAMC=FAMS.find(x=>x.id===id);_of(id)};
const item=(x,y,sz,img,emo,lab,click,adult,small,out)=>`<button class="rf${small?' sm':''}${out?' out':''}" style="left:${x}%;top:${y}%;--sz:${sz}%" onclick="${click}"><img src="${img}" alt="" loading=lazy><span class=e>${emo}</span><span class=l>${esc(lab)}</span>${adult?'<span class=badge>18+</span>':''}</button>`;
const _rg=renderGames;window.renderGames=renderGames=function(G){_rg(G);const g=$('games'),f=FAMC||{name:'Jeux',emoji:'🎲'},n=G.length;g.classList.add('ring');g.classList.toggle('dbl',n>8);
 bar(true);const ctr=`<div class="rc c2"><b>${esc(f.name)}</b></div>`;let h='';
 if(n===1)h=item(50,82,30,G[0].img,'',G[0].name,`openGame('${G[0].id}')`,G[0].adult);
 else if(n<=8){const sz=n<=6?30:25;G.forEach((x,i)=>{const a=-Math.PI/2+i*2*Math.PI/n;h+=item(50+38*Math.cos(a),50+38*Math.sin(a),sz,x.img,'',x.name,`openGame('${x.id}')`,x.adult)})}
 else{const no=Math.ceil(n*0.6),ni=n-no;G.forEach((x,i)=>{const outer=i<no,k=outer?i:i-no,m=outer?no:ni,rx=outer?39:20,ry=outer?41:19,a=-Math.PI/2+(k+(outer?0:.5))*2*Math.PI/m;h+=item(50+rx*Math.cos(a),48+ry*Math.sin(a),outer?20:17.5,x.img,'',x.name,`openGame('${x.id}')`,x.adult,false,outer)})}
 g.innerHTML=(n===1?ctr.replace('class="rc"','class="rc one"'):ctr)+h;$('fam-back').classList.add('hide')};
let BUSY=false;window.ringRand=()=>{if(BUSY)return;const L=[...document.querySelectorAll('#games.ring .rf')];if(!L.length)return;const t=Math.floor(Math.random()*L.length);
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){L[t].classList.add('win');return L[t].click()}
 BUSY=true;const steps=L.length*2+t+(L.length<3?4:0);let i=0;const go=()=>{L.forEach(e=>e.classList.remove('hl'));const k=i%L.length;L[k].classList.add('hl');if(i>=steps){L[k].classList.add('win');setTimeout(()=>{BUSY=false;L[k].click()},750);return}i++;const p=i/steps;setTimeout(go,55+Math.pow(p,3)*260)};go()};
if(typeof FAMS!=='undefined'&&FAMS.length)showFams();})();
