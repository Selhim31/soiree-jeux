// node test/accord.test.js — toute carte qui demande d'envoyer une photo/vidéo/un message à quelqu'un porte « (avec son accord) ».
'use strict';const fs=require('fs'),assert=require('assert'),D=__dirname+'/../content/';
const isSend=v=>{const t=v.trim();if(t.endsWith('?')||t.includes('|||')||/^Je n'ai jamais/i.test(t)||/baiser imaginaire|envoyez-vous un bisou à la caméra au même moment/i.test(t))return false;return /(^|[,:;(«]\s*|\bet\s|\bpuis\s)(envoie(-la|-le|-lui|-leur|-moi)?|envoyez-vous|écris-moi|écris (à|au|aux) )/i.test(t)||/par (ta )?messag(erie|e privé)/i.test(t)};
const bad=[];let n=0;const walk=(v,f)=>{if(typeof v==='string'){if(isSend(v)){n++;if(!/avec (son|leur|mon) accord/i.test(v))bad.push(f+': '+v)}}else if(v&&typeof v==='object')Object.values(v).forEach(x=>walk(x,f))};
for(const f of fs.readdirSync(D))walk(JSON.parse(fs.readFileSync(D+f,'utf8')),f);
assert(n>500,'détection des cartes d\'envoi : '+n);assert.deepStrictEqual(bad,[],'cartes d\'envoi sans accord');
assert(isSend('{p}, prends-toi en photo et envoie-la à {q}.')&&isSend('{p}, écris à {q} un mot doux.')&&!isSend('C\'est un 10 mais il/elle envoie des sextos.'),'détecteur');assert(isSend('{p}, en train de faire un bisou à la caméra, prends-toi en photo et envoie-la à {q} (par ta messagerie).'),'bisou caméra + envoi photo = carte d\'envoi');console.log('accord ok',n);
