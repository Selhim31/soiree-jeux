# Exporte toutes les cartes Coquin/Explicite (+ défis jouet Maître/Roulette) pour relecture.
import json,glob,os,unicodedata
from openpyxl import Workbook
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.styles import Font,PatternFill,Alignment
D=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..');C=D+'/content'
JOU=set()
for f in glob.glob(D+'/gen/hand/jouet/*.txt'):JOU|={l.strip() for l in open(f) if l.strip()}
ab=lambda s:unicodedata.normalize('NFD',s).encode('ascii','ignore').decode().upper().replace(' ','').replace('/','')[:10]
rows=[]
for f in sorted(glob.glob(C+'/*.json')):
  g=os.path.basename(f)[:-5];d=json.load(open(f))
  for l,lst in d['levels'].items():
    take=('orig' in d and l in('Coquin','Explicite')) or (g in('maitre','roulette'))
    if not take:continue
    for i,t in enumerate(lst):
      if 'orig' not in d and t not in JOU:continue
      rows.append({'id':f'{g.upper()}-{ab(l)}-{i+1:04d}','game':g,'name':d.get('name',g),'level':l,'idx':i,'text':t,'jouet':t in JOU})
json.dump(rows,open('/workspace/tri_coquin_explicite_ids.json','w'),ensure_ascii=False)
wb=Workbook();ws=wb.active;ws.title='Cartes'
H=['ID','Jeu','Niveau','Texte de la carte','Jouet','Action','Nouveau texte'];ws.append(H)
for r in rows:ws.append([r['id'],r['name'],r['level'],r['text'],'oui' if r['jouet'] else '','',''])
for c in ws[1]:c.font=Font(bold=True,color='FFFFFF');c.fill=PatternFill('solid',fgColor='7A1030')
for col,w in zip('ABCDEFG',[24,26,12,90,7,12,60]):ws.column_dimensions[col].width=w
for row in ws.iter_rows(min_row=2,min_col=4,max_col=7):
  for c in row:c.alignment=Alignment(wrap_text=True,vertical='top')
dv=DataValidation(type='list',formula1='"Garder,Retirer,Modifier"',allow_blank=True);ws.add_data_validation(dv);dv.add(f'F2:F{len(rows)+1}')
ws.freeze_panes='A2';ws.auto_filter.ref=f'A1:G{len(rows)+1}'
wb.save('/workspace/tri_coquin_explicite.xlsx')
with open('/workspace/tri_coquin_explicite.txt','w') as o:
  cur=None
  for r in rows:
    k=(r['name'],r['level'])
    if k!=cur:o.write(f"\n=== {r['name']} — {r['level']} ===\n");cur=k
    o.write(f"[{r['id']}]{' 🧸' if r['jouet'] else ''} {r['text']}\n")
from collections import Counter
print(len(rows),'cartes;',sum(r['jouet'] for r in rows),'jouet');print(Counter((r['game'],r['level']) for r in rows))
