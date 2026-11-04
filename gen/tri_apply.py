# Applique les choix de Selim : python3 gen/tri_apply.py [fichier.xlsx] [--ecrire]
# Sans --ecrire : simulation. Retrouve chaque carte par le texte d'origine (ID -> texte via tri_coquin_explicite_ids.json).
import json,sys,os
from openpyxl import load_workbook
D=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','content')
X=next((a for a in sys.argv[1:] if a.endswith('.xlsx')),'/workspace/tri_coquin_explicite.xlsx');W='--ecrire' in sys.argv
IDS={r['id']:r for r in json.load(open('/workspace/tri_coquin_explicite_ids.json'))}
wb=load_workbook(X);ws=wb['Cartes'] if 'Cartes' in wb.sheetnames else wb.active;H=[c.value for c in ws[1]];ch=[]
TD={}
if 'Synthèse' in wb.sheetnames:
  S=wb['Synthèse'];SH=[c.value for c in S[1]]
  for v in S.iter_rows(min_row=2,values_only=True):
    r=dict(zip(SH,v))
    if r.get('Thème') and (r.get('Décision thème') or '').strip()=='Retirer tout':TD[r['Thème']]=1
seen=set()
for v in ws.iter_rows(min_row=2,values_only=True):
  r=dict(zip(H,v));a=(r.get('Action') or '').strip().capitalize()
  if not a and r.get('Thème') in TD:a='Retirer'
  if a in('Retirer','Modifier'):ch.append((r['ID'],a,(r.get('Nouveau texte') or '').strip()))
docs={};log=[];err=[]
for i,a,nt in ch:
  m=IDS.get(i)
  if not m:err.append(f'{i}: ID inconnu');continue
  g,l,t=m['game'],m['level'],m['text'];d=docs.setdefault(g,json.load(open(f'{D}/{g}.json')));L=d['levels'][l]
  if t not in L:err.append(f'{i}: carte introuvable (déjà modifiée ?)');continue
  k=L.index(t)
  if a=='Modifier':
    if not nt:err.append(f'{i}: Modifier sans nouveau texte');continue
    if nt in L:err.append(f'{i}: nouveau texte déjà présent');continue
    L[k]=nt
    for gl in (d.get('gold') or {}).values():
      if t in gl:gl[gl.index(t)]=nt
    log.append(f'MODIF {i}: {t[:50]} -> {nt[:50]}')
  else:
    del L[k];o=(d.get('orig') or {}).get(l);j=k
    if o:
      for rg in o:
        if j<rg[1]:rg[1]-=1;break
        j-=rg[1]
      d['orig'][l]=[x for x in o if x[1]>0]
    for gl in (d.get('gold') or {}).values():
      if t in gl:gl.remove(t)
    log.append(f'RETRAIT {i}: {t[:60]}')
print('\n'.join(log));print('\n'.join('⚠️ '+e for e in err));print(len(log),'changements,',len(err),'erreurs')
if W:
  for g,d in docs.items():json.dump(d,open(f'{D}/{g}.json','w'),ensure_ascii=False,indent=1)
  print('écrit :',', '.join(docs))
else:print('(simulation — ajouter --ecrire pour appliquer)')
