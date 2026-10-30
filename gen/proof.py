import json,re
SEND=re.compile(r'envoie|envoyer|vocal|photo|vidéo|message|texto|sexto|selfie|émoji|appel|écris à',re.I)
KEEP=('dans le chat','strip-tease intégral hors champ','scénario porno de 3 lignes')
CONS=re.compile(r'strip|lingerie|caleçon|sous-vêtement|décolleté|torse|déboutonn|dégraf|retire ton haut|tenue la plus courte',re.I)
LIVE=re.compile(r"caméra|voix haute|au micro|micro ouvert|raconte|\bdis\b|dis-|décris|explique|chante|imite|devant|au groupe|tout le monde|\blis\b|avoue|réponds|parle|chaque joueur|\bcite|visio|en vocal|appelle|le groupe (vote|note|choisit|choisis)|laisse (le groupe|\{q\})|confession|murmure|gémis|pendant \d+ tours?|jusqu'à (la fin|ton prochain|ce que)|reste |question suivante|prochain défi|garde|ne |pose une question",re.I)
def proof(b):
  if re.search(r'chant|gémi|murmur|soupir|cri|rire|voix|accent|rime',b,re.I):return 'enregistre-toi et envoie le vocal'
  if re.search(r'secondes|\d+ ?s\b|mime|danse|défil|mouvement|slow|lap dance|caresse|masse',b,re.I):return 'filme-toi et envoie la vidéo'
  if re.search(r'\bpose|tenue|montre|mets|écris|enfile|déguise|maquill|feutre|sous-vêtement|lingerie|look',b,re.I):return 'prends-toi en photo et envoie-la'
  return 'filme-toi et envoie la vidéo'
from proofmap import M
def fix(b):
  if b in M:return M[b]
  if any(k in b for k in KEEP):return b
  # b = body starting with "{p}, "
  if '{q}' not in b and 'personne de ton choix' in b and SEND.search(b):
    return b.replace('la personne de ton choix','{q} (la personne de ton choix)',1)
  if '{q}' in b and SEND.search(b):return b
  if LIVE.search(b):return b
  s=b.rstrip(' .!')
  return f"{s}, {proof(b)} à {{q}}"+('' if '{q}' in b else ', la personne de ton choix')+(' (envoi hors appli, avec son accord).' if CONS.search(b) else ' (envoi hors appli).')
stats={}
for g in ['defis','av']:
  d=json.load(open(f'content/{g}.json'))
  for l,v in d['levels'].items():
    out=[]
    for x in v:
      if g=='av':
        if not x.startswith('Action : '):out.append(x);continue
        n='Action : '+fix(x[9:])
      else:n=fix(x)
      if n!=x:stats[(g,l)]=stats.get((g,l),0)+1;stats.setdefault('ex',[]).append((x,n))
      out.append(n)
    d['levels'][l]=list(dict.fromkeys(out))
  json.dump(d,open(f'content/{g}.json','w'),ensure_ascii=False)
ex=stats.pop('ex')
for k,v in sorted(stats.items()):print(k,v)
import random;random.seed(1)
for a,b in random.sample(ex,10):print('-',a,'\n+',b)
