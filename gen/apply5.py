import json,glob,os,re,difflib,unicodedata
import sys;W=sys.argv[1]
def norm(s):
  s=unicodedata.normalize('NFD',s.lower());s=''.join(c for c in s if unicodedata.category(c)!='Mn')
  s=re.sub(r'\{[pq]\}|verite|action|[^a-z ]',' ',s);return ' '.join(s.split())
allc={};games={}
for f in glob.glob('content/*.json'):
  g=os.path.basename(f)[:-5];d=json.load(open(f));games[g]=d
  for l,v in d['levels'].items():
    for x in v:allc[norm(x)]=x
added={};skipped=[]
keys=list(allc)
for fn in sorted(os.listdir(W)):
  raw=fn.startswith('RAW_');b=fn[4:-4] if raw else fn[:-4]
  g,l=b.rsplit('_',1);g=re.sub(r'\d+$','',g)
  for line in open(f'{W}/{fn}',encoding='utf-8'):
    t=line.strip()
    if not t:continue
    c=t if raw else '{p}, '+t
    n=norm(c)
    if n in allc or difflib.get_close_matches(n,keys,1,0.88):skipped.append(c);continue
    allc[n]=c;keys.append(n)
    games[g]['levels'].setdefault(l,[]).append(c);added[(g,l)]=added.get((g,l),0)+1
for g,d in games.items():json.dump(d,open(f'content/{g}.json','w'),ensure_ascii=False)
for k,v in sorted(added.items()):print(k,v)
print('added',sum(added.values()),'skipped',len(skipped));print(*skipped,sep='\n')
