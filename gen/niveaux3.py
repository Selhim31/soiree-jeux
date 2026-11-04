# a38 : regroupe les niveaux de chaleur en 3 niveaux (Fun / Coquin / Explicite).
# Garde dans "orig" l'ancien niveau de chaque carte (plages d'index) pour les règles serveur.
import json,sys,os
D=os.path.join(os.path.dirname(__file__),'..','content')
BASE={'Classique':'Fun','Délirant':'Fun','Coquin':'Coquin','Hot':'Coquin','Hard':'Explicite','Explicite':'Explicite','Extrême':'Explicite'}
SPEC={'connaitre':{'Léger':'Fun','Profond':'Coquin','Intime':'Coquin','Hot':'Explicite'},
 'soft':{'Classique':'Fun','Entre amis':'Fun','Entre amis coquin':'Coquin'},
 'debats':{'Classique':'Fun','Couple & société':'Fun'},
 'flirts':{'Duo':'Coquin','Hot':'Explicite'},
 'halloween':{'Halloween':'Fun','Coquin':'Coquin'}}
GAMES=['7sec','ask','av','cestun10','couple','darkromance','defis','duo','ecrit','estim','excrush','hot','imposteur','jamais','mime','ouinon','qui','tupreferes','verite','coquin','chaudfroid','connaitre','soft','debats','flirts','halloween']
NEW=['Fun','Coquin','Explicite']
rep={}
for g in GAMES:
  p=f'{D}/{g}.json';d=json.load(open(p))
  if 'orig' in d:continue
  M=SPEC.get(g,BASE);L=d['levels'];assert set(L)<=set(M),(g,list(L))
  out={};orig={};dup=0
  for nl in NEW:
    olds=[o for o in L if M[o]==nl]
    if not olds:continue
    # une carte en double garde la version la plus osée (dernier niveau)
    seen={}
    for o in olds:
      for t in L[o]:seen[t]=o
    lst=[];rg=[]
    for o in olds:
      n=0
      for t in L[o]:
        if seen[t]==o and t not in lst:lst.append(t);n+=1
        else:dup+=1
      if n:rg.append([o,n])
    out[nl]=lst;orig[nl]=rg
  d['levels']=out;d['orig']=orig
  if 'gold' in d:
    gd={}
    for o,ts in d['gold'].items():
      nl=M.get(o,o);gd.setdefault(nl,[])
      for t in ts:
        if t not in gd[nl]:gd[nl].append(t)
    d['gold']=gd
  json.dump(d,open(p,'w'),ensure_ascii=False,indent=1)
  rep[g]=({k:len(v) for k,v in out.items()},dup)
for g,(c,dp) in rep.items():print(g,c,'doublons:',dp)
