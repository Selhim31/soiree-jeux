# Propose des réécritures « {q} » pour les cartes avec {p} sans {q} (voir defis_cible.xlsx).
import json,glob,os,re
EXCL={'lghot','loupgarou','maitre','roulette','fantasme','bluffeur','miroir','scenario','encheres','chaudfroid','purete','kink','redflag','fetard','jaloux','menteur','compat','quiz','equipe'}
BGAME={'estim':'groupe estime','debats':'débat de groupe','cercle':'tour de cercle','mime':'les autres devinent','7sec':'chrono 7 s','duo':'déjà à deux'}
GRP=re.compile(r"tout le monde|les autres|chaque joueur|tous les joueurs|chacun|vote|ce groupe|du groupe|dans le groupe|parmi nous|à tour de rôle|qui ici|qui de vous|vous deux|\bvotre\b|\bvos\b|(?<![-\w])vous\b|ensemble|à quelqu'un ici|tous\b|un par un|devinent|devinez",re.I)
SPEECH=r"raconte|décris|explique|dis|avoue|confie|confesse|lis|chante|chuchote|murmure|propose|révèle|présente|récite|annonce|déclame|résume|cite|décris-lui|joue|offre|écris"
def tail(t):
  m=re.search(r"(\s*\([^()]*\))?\s*([.!?…]*)\s*$",t);return t[:m.start()],t[m.start():]
def prop(g,t):
  if g in BGAME:return 'B',BGAME[g],''
  body=t
  if GRP.search(body) and not re.search(r"au groupe|aux autres",body):return 'B','concerne tout le groupe',''
  n=t
  n=re.sub(r"(regarde|regardant) (par-dessus ton épaule)",r"\1 {q} \2",n)
  n=re.sub(r"(regarde|regardant) la caméra",r"\1 {q} à travers la caméra",n)
  n=re.sub(r"\b(à|a) (la personne|quelqu'un|un joueur|une joueuse|un\(e\) joueur\(se\)|un\(e\) joueur\(euse\)|la joueuse|le joueur) de ton choix",'à {q}',n)
  n=re.sub(r"\bau groupe\b","à {q}",n);n=re.sub(r"\baux autres\b","à {q}",n)
  n=re.sub(r"\bmontre à la caméra\b","montre à {q}, face caméra,",n)
  n=re.sub(r"\bau micro\b","à {q} au micro",n)
  if '{q}' in n:return 'A','',fix(n)
  m=re.match(r"^((?:Action|Vérité|Défi) : )?\{p\}, (.*)$",t,re.S)
  if not m:return 'B','tournure à revoir',''
  pre,rest=m.group(1) or '',m.group(2)
  if '?' in rest and not re.match(r"("+SPEECH+r")\b",rest):
    return 'A','',f"{pre}{{q}} demande à {{p}} : {rest}"
  v=re.match(r"("+SPEECH+r")\b( à)?",rest)
  if v and not v.group(2):
    return 'A','',fix(f"{pre}{{p}}, {v.group(1)} à {{q}}{rest[v.end(1):]}")
  return 'A','',fix(f"{pre}{{p}}, pour {{q}}, {rest}")
def fix(n):
  n=n.replace('à {q} au groupe','à {q}').replace(' ,',',')
  if re.search(r"envoie|envoyer|(?<![a-zé])écris à|par ta messagerie",n,re.I) and 'avec son accord' not in n:
    h,tl=tail(n);n=h+' (avec son accord)'+tl.lstrip() if not tl.strip().startswith('(') else n.replace(tl,tl.rstrip(')').rstrip()+', avec son accord)')
  return n
if __name__=='__main__':
  import unicodedata
  from collections import Counter
  ab=lambda s:unicodedata.normalize('NFD',s).encode('ascii','ignore').decode().upper().replace(' ','')[:10]
  rows=[]
  for f in sorted(glob.glob(os.path.join(os.path.dirname(__file__),'..','content','*.json'))):
    g=os.path.basename(f)[:-5]
    if g in EXCL:continue
    d=json.load(open(f))
    for l,L in d['levels'].items():
      for i,t in enumerate(L):
        if isinstance(t,str) and '{p}' in t and '{q}' not in t:
          c,why,n=prop(g,t);rows.append(dict(id=f'{g.upper()}-{ab(l)}-{i+1:04d}',game=g,name=d.get('name',g),level=l,text=t,new=n,cat=c,why=why))
  json.dump(rows,open('/workspace/defis_cible_ids.json','w'),ensure_ascii=False)
  print(len(rows),Counter(r['cat'] for r in rows))
  from openpyxl import Workbook
  from openpyxl.worksheet.datavalidation import DataValidation
  from openpyxl.styles import Font,PatternFill,Alignment
  wb=Workbook();ws=wb.active;ws.title='Cartes';ws.append(['ID','Jeu','Niveau','Texte actuel','Nouveau texte proposé','Catégorie (A/B)','Raison (B)','Action','Mon texte'])
  for r in rows:ws.append([r['id'],r['name'],r['level'],r['text'],r['new'],r['cat'],r['why'],'',''])
  for c in ws[1]:c.font=Font(bold=True,color='FFFFFF');c.fill=PatternFill('solid',fgColor='7A1030')
  for k,v in zip('ABCDEFGHI',[22,24,10,70,70,10,22,16,50]):ws.column_dimensions[k].width=v
  for row in ws.iter_rows(min_row=2,min_col=4,max_col=5):
    for c in row:c.alignment=Alignment(wrap_text=True,vertical='top')
  dv=DataValidation(type='list',formula1='"Valider,Garder l\'ancien,Modifier"',allow_blank=True);ws.add_data_validation(dv);dv.add(f'H2:H{len(rows)+1}')
  ws.freeze_panes='A2';ws.auto_filter.ref=f'A1:I{len(rows)+1}';wb.save('/workspace/defis_cible.xlsx')
  C=Counter((r['game'],r['level'],r['cat']) for r in rows)
  for g in sorted({r['game'] for r in rows}):
    print(g,' '.join(f"{l}: A{C[(g,l,'A')]}/B{C[(g,l,'B')]}" for l in dict.fromkeys(r['level'] for r in rows if r['game']==g)))
