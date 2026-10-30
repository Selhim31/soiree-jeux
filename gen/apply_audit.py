#!/usr/bin/env python3
"""Applique les propositions de gen/audit_levels.md.
Par défaut : SIMULATION (rien n'est écrit). 
  --out DIR      écrit les JSON modifiés dans DIR (copie, pas le live)
  --live         écrit dans content/ (NE PAS utiliser sans validation de Selim)
  --new-hot      crée les niveaux 'Hot' proposés pour 7sec/cestun10/imposteur/ouinon/mime (sinon ignorés)
  --phrasing     applique aussi la reformulation des défis d'envoi
"""
import json,glob,os,re,sys,unicodedata
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A=sys.argv[1:];LIVE='--live' in A;NEWHOT='--new-hot' in A;PHR='--phrasing' in A
OUT=A[A.index('--out')+1] if '--out' in A else None
G={os.path.basename(f)[:-5]:json.load(open(f)) for f in glob.glob(ROOT+'/content/*.json')}
# (jeu, niveau source, sous-chaîne unique, niveau cible, raison)
MOVES=[
('7sec','Classique',"choses qu'on fait au lit (soyons sages)",'Coquin',"allusion sexuelle en niveau tout public"),
('defis','Classique',"dernière note de téléphone d'une voix sensuelle",'Coquin',"voix sensuelle = coquin"),
('av','Classique',"dernière note de téléphone d'une voix sensuelle",'Coquin',"miroir du défi"),
('couple','Coquin',"quel sous-vêtement de {q} préfères-tu",'Hot',"sous-vêtements = hot"),
('av','Hot',"qui ici a le plus beau sourire selon toi",'Coquin',"trop sage pour Hot"),
('defis','Hot',"décris ton parfum préféré sur quelqu'un",'Coquin',"trop sage pour Hot"),
('av','Hot',"décris ton parfum préféré sur quelqu'un",'Coquin',"miroir"),
('connaitre','Hot',"Qu'est-ce qui t'attire chez quelqu'un au-delà du physique",'Intime',"pas sexuel"),
('connaitre','Hot',"Quel vêtement te donne le plus confiance",'Intime',"pas sexuel"),
('connaitre','Hot',"Qu'est-ce que tu adores qu'on remarque chez toi",'Intime',"pas sexuel"),
('coquin','Hot',"compliment physique qui te met le plus en confiance",'Coquin',"trop sage pour Hot"),
('coquin','Hot',"qu'est-ce qui t'attire chez quelqu'un de mystérieux",'Coquin',"trop sage pour Hot"),
('coquin','Hot',"attiré(e) par une voix au téléphone",'Coquin',"trop sage pour Hot"),
('defis','Explicite',"mange une banane ou un fruit de manière ultra suggestive",'Hot',"suggestif, pas explicite"),
('defis','Explicite',"fais un twerk ou un déhanché lascif de 20 secondes",'Hot',"suggestif, pas explicite"),
('defis','Explicite',"une photo de tes lèvres mordues",'Hot',"suggestif, pas explicite"),
('defis','Explicite',"où tu dis « viens » de 5 façons",'Hot',"suggestif, pas explicite"),
('av','Explicite',"mange une banane ou un fruit de manière ultra suggestive",'Hot',"miroir"),
('av','Explicite',"fais un twerk ou un déhanché lascif de 20 secondes",'Hot',"miroir"),
('av','Explicite',"une photo de tes lèvres mordues",'Hot',"miroir"),
('av','Explicite',"où tu dis « viens » de 5 façons",'Hot',"miroir"),
('defis','Extrême',"fais un strip-tease de 20 secondes",'Hot',"sexuel dans un niveau délirant"),
('defis','Extrême',"décris ton fantasme numéro un comme une bande-annonce",'Hot',"sexuel dans un niveau délirant"),
('av','Extrême',"Action : {p}, fais un strip-tease de 20 secondes",'Hot',"miroir"),
('av','Extrême',"Action : {p}, décris ton fantasme numéro un comme une bande-annonce",'Hot',"miroir"),
]
# av Extrême : toutes les Actions (délirantes, miroir de Défis Extrême) -> nouveau niveau 'Délirant'
AV_SPLIT=True
# suppressions (doublons / mauvaise mécanique)
REMOVE=[
('tupreferes','Classique',"Tu préfères connaître la date de ta mort ||| la cause ?","doublon de « …la cause de ta mort ? »"),
('tupreferes','Classique',"Tu préfères rester coincé dans un ascenseur avec ton ex ||| avec ton boss ?","doublon de « être bloqué(e)… avec ton patron »"),
]
HOT_ACTIONS_IN_HOT=["enlève un accessoire ou un vêtement","décris en détail une tenue que tu aimerais voir","dis à voix haute le compliment le plus osé","fais monter la température en 3 phrases","garde un glaçon dans ta main","choisis quelqu'un ici pour une nuit fictive","retire ton haut si tu portes un tee-shirt","chuchote ce que tu ferais à {q} sur une île"]
for s in HOT_ACTIONS_IN_HOT: REMOVE.append(('hot','Hot',s,"défi dans un jeu de questions écrites (déjà présent dans Défis Hot)"))
RENAME={('defis','Extrême'):'Délirant',('purete','Classique'):'18+',('debats','Hard'):'Couple & société'}
NEWHOT_RE=r"faire l.amour|fait l.amour|l.acte|orgasm|préliminaires|kamasutra|levrette|nude|préservatif|plan à trois|libertin|érotique|\bsexe\b|sextoy|jouet coquin|rêve érotique|positions? |Plan cul|Sex friend|Vibromasseur|Lubrifiant|Orgasme|Fantasme\|Rêve|String\|Culotte"
NEWHOT_GAMES=['7sec','cestun10','imposteur','ouinon','mime']
def phr(t):
  t=re.sub(r'(\{q\}), la personne de ton choix',r'\1',t);t=t.replace('{q} (la personne de ton choix)','{q}')
  t=t.replace('(envoi hors appli, avec son accord)','(par ta messagerie, avec son accord)').replace('(envoi hors appli)','(par ta messagerie)').replace('(appel hors appli)','(par ton téléphone)').replace('(hors appli, avec son accord)','(par ta messagerie, avec son accord)').replace('(hors appli)','(par ta messagerie)')
  return t
log=[];warn=[]
def find(g,l,sub):
  L=G[g]['levels'][l];m=[x for x in L if sub in x]
  if len(m)!=1: warn.append(f'{g}/{l}: {len(m)} correspondance(s) pour « {sub} »');return None
  return m[0]
for g,l,sub,to,why in MOVES:
  t=find(g,l,sub)
  if not t: continue
  G[g]['levels'][l].remove(t);G[g]['levels'].setdefault(to,[])
  if t not in G[g]['levels'][to]: G[g]['levels'][to].append(t)
  log.append(f'MOVE {g}: {l} -> {to}: {t}')
for g,l,sub,why in REMOVE:
  t=find(g,l,sub)
  if t: G[g]['levels'][l].remove(t);log.append(f'REMOVE {g}/{l}: {t}')
if AV_SPLIT:
  a=G['av']['levels'];acts=[x for x in a['Extrême'] if x.startswith('Action')]
  a['Extrême']=[x for x in a['Extrême'] if not x.startswith('Action')];a['Délirant']=acts;log.append(f'SPLIT av Extrême: {len(acts)} actions -> Délirant')
if NEWHOT:
  for g in NEWHOT_GAMES:
    c=G[g]['levels']['Coquin'];h=[x for x in c if re.search(NEWHOT_RE,x)]
    G[g]['levels']['Coquin']=[x for x in c if x not in h];G[g]['levels']['Hot']=h;log.append(f'NEW HOT {g}: {len(h)} cartes')
for (g,l),n in RENAME.items():
  lv=G[g]['levels']
  if l in lv: G[g]['levels']={ (n if k==l else k):v for k,v in lv.items()};log.append(f'RENAME {g}: {l} -> {n}')
if PHR:
  k=0
  for g,d in G.items():
    for l,v in d['levels'].items():
      nv=[phr(x) for x in v];k+=sum(a!=b for a,b in zip(v,nv));d['levels'][l]=nv
  log.append(f'PHRASING: {k} cartes reformulées')
for g,d in G.items():
  for l,v in d['levels'].items():
    if len(v)!=len(set(v)): warn.append(f'doublons dans {g}/{l}')
    if len(v)<150 and g not in('rnp','pmu'): warn.append(f'SOUS 150 : {g}/{l} = {len(v)}')
print('\n'.join(log));print('\n'.join('⚠ '+w for w in warn) or 'aucun avertissement')
dst=ROOT+'/content' if LIVE else OUT
if dst:
  os.makedirs(dst,exist_ok=True)
  for g,d in G.items(): json.dump(d,open(f'{dst}/{g}.json','w'),ensure_ascii=False,indent=1)
  print('écrit dans',dst)
else: print('(simulation, rien écrit)')
print('NB : renommer un niveau impose aussi de mettre à jour server.js (purete utilise levels.Classique, couples: isR, SAFE côté client).')
