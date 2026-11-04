# Tableau de tri par thème / intensité (Coquin + Explicite + défis jouet).
import json,re,unicodedata
from collections import Counter,defaultdict
from openpyxl import Workbook
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.styles import Font,PatternFill,Alignment
R=json.load(open('/workspace/tri_coquin_explicite_ids.json'))
C={}
def cur(g,l):
  if (g,l) not in C:C[(g,l)]=set(json.load(open(f'content/{g}.json'))['levels'][l])
  return C[(g,l)]
R=[r for r in R if r['text'] in cur(r['game'],r['level'])]
n=lambda s:unicodedata.normalize('NFD',s.lower()).encode('ascii','ignore').decode()
TH=[('⚠️ Cadre scolaire (à revoir)',r'lycee|college|ecole|\bprof\b|eleve|etudiant|\bado\b|mineur|pendant mes etudes'),('Votes & estimations de groupe',r'^(qui |estimez|devinez|c.est un 10)|^[^ ]+\|[^ ]+$'),('Jouet',r'jouet|vibro|sextoy|gode|menottes'),
('Photo/vidéo à envoyer',r'photo|video|selfie|filme|camera|nude|snap|vue unique'),
('Réseaux sociaux/téléphone',r'telephone|messag|sms|texto|appel|insta|story|statut|reseau|application|tinder|galerie|historique|chat\b|vocal|audio|emoji'),
('Domination/soumission douce',r'domin|soumi|ordre|obei|maitre|esclave|attach|bande les yeux|yeux bandes|bandeau|controle|autorite|mot de securite|interdit|permission|punition|fessee'),
('Jeux de rôle',r'role|jeu de role|deguis|incarne|personnage|scenario|infirmi|professeur|patron|policier|inconnu'),
('Caresses/plaisir solo',r'caress|masturb|plaisir|touche-toi|toucher|effleure|orgasm|jouir|excit|gemi|sensation|frisson|corps|massage|huile|peau|chantilly|chocolat'),
('Déshabillage',r'deshabill|enleve|retire (ton|ta|tes)|nu\b|nue\b|nus\b|torse|strip|sans vetement|tout nu'),
('Sous-vêtements/tenue',r'sous-vet|lingerie|culotte|string|boxer|soutien|tenue|pyjama|talons|collant|bas resille|vetement'),
('Lieux insolites',r'\blieu|endroit|plage|voiture|bureau|ascenseur|cinema|toilettes|piscine|douche|bain|exterieur|en public|cuisine|hotel|avion|foret|jacuzzi|canape|lit\b|spa|nuit chaude|chandelles'),
('Expériences passées',r'deja|derniere fois|premiere fois|ex\b|ex-|plus jeune|souvenir|jamais|as-tu|combien de|ton record|ta pire|ta meilleure|le plus|rupture|ex |rendez-vous|premiere nuit|decision|honteu|gena|rituel|rapport aux'),
('Fantasmes & confidences',r'fantasm|reve|secret|avoue|confie|confess|envie|aimerais|desir|tabou|kiff|prefer|craque|attir|love language|zone|sensible|penses-tu|qualites d.un|ideal|ton type'),
('Questions sur le partenaire',r'\{q\}.*\?|partenaire|couple|ton chéri|ta cherie|chez \{q\}|de \{q\}|qui ici|parmi'),
('Sexe & positions',r'sex|position|levrette|missionnaire|preliminaire|oral|fellation|cunni|penetr|coquin|baiser|lecher|mordill|suc'),
('Drague & séduction',r'drag|seduis|seduct|charm|flirt|sexy|regard|clin|sensuel|braise|bisou|embrass|langue|date|attirant|beau|belle|seren|slow|craquant|trait'),
('Romantique/mignon',r'amour|romanti|doux|tendre|compliment|cœur|coeur|calin|declar|poeme|surnom|mignon'),
('Ridicule/imitation',r'imite|chante|danse|grimace|ridicule|accent|mime|voix|parodie|fais semblant')]
TH=[(a,re.compile(b)) for a,b in TH]
def theme(r):
  if r['jouet'] and not TH[0][1].search(n(r['text'])):return 'Jouet'
  t=n(r['text'])
  for a,p in TH:
    if p.search(t):return a
  return 'Autre'
def typ(r):
  t=r['text'].strip()
  if re.match(r'(Action|Défi)\s*:',t):return 'Action'
  if re.match(r'Vérité\s*:',t) or t.endswith('?') or ' ||| ' in t:return 'Vérité'
  if r['game'] in('jamais','verite','excrush','ecrit','estim','cestun10','qui','ask','connaitre','tupreferes','ouinon'):return 'Vérité'
  if r['game'] in('defis','7sec','mime','maitre','roulette','chaudfroid','hot','coquin','couple','darkromance','soft','flirts','halloween'):return 'Action'
  return 'Autre'
I5=r'masturb|orgasm|jouir|penetr|fellation|cunni|nude|nu integral|sexe|gode|levrette|ejacul'
I4=r'\bnu\b|nue|deshabill|jouet|vibro|seins|fesses|sous-vet|lingerie|string|culotte|gemi|lecher|domin|soumi|bandeau|attach|excit'
I3=r'caress|embrass|sensuel|sexy|photo|video|lit\b|desir|fantasm|coquin|mordill|corps|toucher|langue'
I2=r'drag|seduis|flirt|charm|bisou|regard|crush|clin|ex\b'
def inten(r):
  t=n(r['text']);s=5 if re.search(I5,t) else 4 if re.search(I4,t) else 3 if re.search(I3,t) else 2 if re.search(I2,t) else 1
  if r['level']=='Explicite':s=max(s,3)
  return s
for r in R:r['type']=typ(r);r['theme']=theme(r);r['int']=inten(r)
if __name__=='__main__':
  ths=[a for a,_ in TH]+['Autre'];ths.remove('Jouet');ths.insert(0,'Jouet')
  wb=Workbook();S=wb.active;S.title='Synthèse'
  types=['Vérité','Action','Autre'];lvls=['Coquin','Explicite','Autres (Maître/Roulette)']
  lv=lambda r:r['level'] if r['level'] in('Coquin','Explicite') else lvls[2]
  H=['Thème','Total','Intensité moy.']+[f'{t} · {l}' for t in types for l in lvls]+['Exemple 1','Exemple 2','Décision thème']
  S.append(H);cnt=Counter((r['theme'],r['type'],lv(r)) for r in R);by=defaultdict(list)
  for r in R:by[r['theme']].append(r)
  for th in ths:
    L=by[th]
    if not L:continue
    ex=sorted(L,key=lambda r:(abs(r['int']-3),len(r['text'])))
    S.append([th,len(L),round(sum(r['int'] for r in L)/len(L),1)]+[cnt[(th,t,l)] for t in types for l in lvls]+[ex[0]['text'],ex[len(ex)//2]['text'] if len(ex)>1 else '',''])
  S.append(['TOTAL',len(R),'']+[sum(cnt[(th,t,l)] for th in ths) for t in types for l in lvls])
  dv=DataValidation(type='list',formula1='"Garder tout,Retirer tout,Je trie à la main"',allow_blank=True);S.add_data_validation(dv);dv.add(f'{chr(64+len(H))}2:{chr(64+len(H))}{len(ths)+1}')
  W=wb.create_sheet('Cartes');W.append(['ID','Jeu','Niveau','Type','Thème','Intensité','Texte','Action','Nouveau texte'])
  for r in R:W.append([r['id'],r['name'],r['level'],r['type'],r['theme'],r['int'],r['text'],'',''])
  dv2=DataValidation(type='list',formula1='"Garder,Retirer,Modifier"',allow_blank=True);W.add_data_validation(dv2);dv2.add(f'H2:H{len(R)+1}')
  W.freeze_panes='A2';W.auto_filter.ref=f'A1:I{len(R)+1}';S.freeze_panes='B2'
  for ws,wd in((S,{'A':28,chr(64+len(H)-2):60,chr(64+len(H)-1):60,chr(64+len(H)):20}),(W,{'A':24,'B':24,'C':11,'D':9,'E':26,'F':9,'G':90,'H':11,'I':50})):
    for c in ws[1]:c.font=Font(bold=True,color='FFFFFF');c.fill=PatternFill('solid',fgColor='7A1030');c.alignment=Alignment(wrap_text=True,vertical='top')
    for k,v in wd.items():ws.column_dimensions[k].width=v
  for row in S.iter_rows(min_row=2):
    for c in row:c.alignment=Alignment(wrap_text=True,vertical='top')
  wb.save('/workspace/tri_par_theme.xlsx')
  json.dump([{k:r[k] for k in('id','theme','type','int')} for r in R],open('/workspace/tri_par_theme_ids.json','w'),ensure_ascii=False)
  c=Counter(r['theme'] for r in R);print(len(R));[print(k,v) for k,v in c.most_common()];print('Autre %',round(100*c['Autre']/len(R),1))
  print(Counter(r['type'] for r in R),Counter(r['int'] for r in R))
# Export pour le panneau créateur (themes.json, lu par creator.js)
if __name__=='__main__':
  json.dump({'themes':[[a,p.pattern] for a,p in TH if a!='Ridicule/imitation' and not a.startswith('⚠️')]},open('themes.json','w'),ensure_ascii=False,indent=1);print('themes.json écrit')
