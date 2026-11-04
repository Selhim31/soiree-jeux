# Ajoute les défis « jouet » (gen/hand/jouet/*.txt) aux paliers 18+ ; idempotent.
import json,os,sys
D=os.path.dirname(os.path.abspath(__file__));C=os.path.join(D,'..','content')
M={'hot_Hot':('hot','Coquin'),'hot_Hard':('hot','Explicite'),'hot_Explicite':('hot','Explicite'),'couple_Hot':('couple','Coquin'),'couple_Explicite':('couple','Explicite'),'defis_Hot':('defis','Coquin'),'defis_Explicite':('defis','Explicite'),'maitre_Hot':('maitre','Hot'),'maitre_Extreme':('maitre','Extrême'),'maitre_DS':('maitre','Dominant / Soumis'),'roulette_Actions':('roulette','Actions')}
def fmt(f):
    s=open(f,encoding='utf-8').read();j=json.loads(s)
    for ind in (1,2,3,4,None):
        if json.dumps(j,ensure_ascii=False,indent=ind)==s.rstrip('\n'):return j,ind,s.endswith('\n')
    raise SystemExit('format inconnu '+f)
tot={}
for k,(g,l) in M.items():
    f=os.path.join(C,g+'.json');j,ind,nl=fmt(f);L=j['levels'][l]
    new=[x.strip() for x in open(os.path.join(D,'hand','jouet',k+'.txt'),encoding='utf-8') if x.strip()]
    add=[x for x in new if x not in L];L.extend(add);tot[g+' / '+l]=len(new)
    open(f,'w',encoding='utf-8').write(json.dumps(j,ensure_ascii=False,indent=ind)+('\n' if nl else ''))
print(json.dumps(tot,ensure_ascii=False,indent=1),sum(tot.values()))
