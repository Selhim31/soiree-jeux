// node test/niveaux3.test.js — a38 : regroupement en 3 niveaux, aucune carte perdue (compare à test/niveaux3_avant.json).
'use strict';const assert=require('assert'),fs=require('fs');const B=JSON.parse(fs.readFileSync(__dirname+'/niveaux3_avant.json'));
// a42 : cartes retirées ou réécrites volontairement (sécurité, doublons Estimations) — liste fermée, vérifiée ici.
const RET=JSON.parse(fs.readFileSync(__dirname+'/a42_retraits.json'));
for(const[g,o]of Object.entries(B)){const d=JSON.parse(fs.readFileSync(__dirname+'/../content/'+g+'.json'));const now=Object.values(d.levels).flat();
 const ret=new Set(RET[g]||[]);const before=o.cards.filter(t=>!ret.has(t));assert(now.length>=before.length,g+' : '+now.length+' < '+before.length);const S=new Set(now);for(const t of before)assert(S.has(t),g+' : carte perdue « '+t.slice(0,60)+' »');for(const t of ret)assert(!S.has(t),g+' : carte retirée encore présente « '+t.slice(0,60)+' »');
 for(const l of Object.keys(d.levels))assert(['Fun','Coquin','Explicite'].includes(l),g+' : niveau '+l);
 for(const[l,rg]of Object.entries(d.orig||{})){const n=rg.reduce((a,x)=>a+x[1],0);assert(n<=d.levels[l].length,g+'/'+l+' plages')}
 for(const t of o.adult)assert(!(d.levels.Fun||[]).includes(t),g+' : carte 18+ dans Fun');}
console.log('✅ niveaux3: '+Object.keys(B).length+' jeux, aucune carte perdue');
