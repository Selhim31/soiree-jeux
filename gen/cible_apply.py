# Applique defis_cible.xlsx : python3 gen/cible_apply.py [fichier.xlsx] [--ecrire] [--tout-A]
# Valider -> nouveau texte proposé ; Modifier -> Mon texte ; vide/Garder -> inchangé. --tout-A : valide toutes les A sans action.
import json,sys,os,re
from openpyxl import load_workbook
D=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','content')
X=next((a for a in sys.argv[1:] if a.endswith('.xlsx')),'/workspace/defis_cible.xlsx');W='--ecrire' in sys.argv;ALLA='--tout-A' in sys.argv
def isSend(v):
  t=v.strip()
  if t.endswith('?') or '|||' in t or re.match(r"Je n'ai jamais",t,re.I) or re.search(r"baiser imaginaire|bisou à la caméra",t,re.I):return False
  return bool(re.search(r"(^|[,:;(«]\s*|\bet\s|\bpuis\s)(envoie(-la|-le|-lui|-leur|-moi)?|envoyez-vous|écris-moi|écris (à|au|aux) )",t,re.I) or re.search(r"par (ta )?messag(erie|e privé)",t,re.I))
IDS={r['id']:r for r in json.load(open('/workspace/defis_cible_ids.json'))}
ws=load_workbook(X).active;H=[c.value for c in ws[1]];docs={};n=0;err=[]
for v in ws.iter_rows(min_row=2,values_only=True):
  r=dict(zip(H,v));a=(r.get('Action') or '').strip();m=IDS.get(r['ID'])
  if not m:continue
  if a=='Valider' or (ALLA and not a and m['cat']=='A'):nt=m['new']
  elif a=='Modifier':nt=(r.get('Mon texte') or '').strip()
  else:continue
  if not nt:err.append(r['ID']+': texte vide');continue
  if isSend(nt) and 'avec son accord' not in nt:err.append(r['ID']+': manque (avec son accord)');continue
  d=docs.setdefault(m['game'],json.load(open(f"{D}/{m['game']}.json")));L=d['levels'][m['level']]
  if m['text'] not in L:err.append(r['ID']+': carte introuvable');continue
  if nt in L:err.append(r['ID']+': doublon');continue
  L[L.index(m['text'])]=nt
  for gl in (d.get('gold') or {}).values():
    if m['text'] in gl:gl[gl.index(m['text'])]=nt
  n+=1
print(n,'cartes réécrites,',len(err),'erreurs');print('\n'.join(err[:30]))
if W:
  for g,d in docs.items():json.dump(d,open(f'{D}/{g}.json','w'),ensure_ascii=False,indent=1)
  print('écrit :',', '.join(docs))
else:print('(simulation — ajouter --ecrire)')
