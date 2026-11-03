const fs=require('fs'),a=require('assert');const A=fs.readFileSync(__dirname+'/../public/app2.js','utf8'),S=fs.readFileSync(__dirname+'/../public/scanner.js','utf8');
a.ok(/const PSEL=\{\}/.test(A),'PSEL state');a.ok(/PSEL\[S\.card\.id\]/.test(A),'submit uses PSEL');a.ok(/np\.replaceWith\(pur\)/.test(A),'pur node kept');
a.ok(/checked/.test(A)&&/class=ck/.test(A),'markup');a.ok(/window\.CNT/.test(S)&&/window\.chkFx/.test(S)&&/rt-cnt/.test(S)&&/aria-live/.test(S),'counter');console.log('chk ok');
a.ok(/prependAny/.test(A)&&/rt-list label/.test(A),'anchor scroll fix');a.ok(/aria-pressed/.test(fs.readFileSync(__dirname+'/../public/duo18.js','utf8')),'miroir aria');
const P=JSON.stringify(require('../content/purete.json'));a.ok(!/prof\b|lycée|collège|école|élève/i.test(P),'purete sans école');
